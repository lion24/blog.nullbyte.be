import type { Translation } from './Translation'
import type { FullTranslation } from './FullTranslation'

/**
 * PostsT namespace class - represents the posts translations structure.
 * Use this class with the localize() function to get strongly typed translations.
 */
export class PostsT implements Translation {
  namespace?: keyof FullTranslation = 'posts'

  allPosts = ''
  allPostsDescription = ''
  publishedOn = ''
  updatedOn = ''
  tags = ''
  tagsLabel = ''
  categories = ''
  relatedPosts = ''
  loadingPosts = ''
  noPostsPublished = ''
  byAuthor = ''
  viewCount = ''
  taggedWith = ''
  categorizedAs = ''
  foundCount = ''
  noPostsWithTag = ''
  noPostsInCategory = ''
}
