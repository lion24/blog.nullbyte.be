// Deletes this PR's ci/design-detector review comments from an earlier run,
// so a fresh push doesn't pile duplicate comments on top of the old ones.
// Loaded by actions/github-script's `script-path` (see ci.yml); it supplies
// `github`, `context` and `core` already authenticated with GITHUB_TOKEN.
//
// Keep this literal in sync with impeccable-to-rdjson.mjs if either changes.
const MARKER = '<!-- impeccable-detector -->'

module.exports = async ({ github, context, core }) => {
  const { owner, repo } = context.repo
  const pull_number = context.payload.pull_request.number

  const comments = await github.paginate(github.rest.pulls.listReviewComments, {
    owner,
    repo,
    pull_number,
    per_page: 100,
  })

  const stale = comments.filter((comment) => comment.body?.includes(MARKER))
  for (const comment of stale) {
    // A comment another run already deleted, or one GitHub detached from
    // the diff, 404s here; skip it rather than failing the whole cleanup.
    try {
      await github.rest.pulls.deleteReviewComment({ owner, repo, comment_id: comment.id })
    } catch (error) {
      core.warning(`Could not delete comment ${comment.id}: ${error.message}`)
    }
  }
  core.info(`Deleted ${stale.length} of ${comments.length} review comment(s) (stale impeccable comments).`)
}
