import { getTranslations } from 'next-intl/server'
import BranchSwitcher from '@/components/BranchSwitcher'
import { isoDate, type Branch } from '@/lib/build-log'

type Props = {
  locale: string
  branches: Branch[]
  /** Post count shown on the "all" pill. */
  total: number
}

/**
 * The branch (topic) filter above a Build Log: radios read by :has() selectors
 * on the page root, so filtering works without JavaScript.
 */
export default async function BranchFilter({ locale, branches, total }: Props) {
  if (branches.length === 0) return null
  const t = await getTranslations({ locale, namespace: 'home' })
  const nf = new Intl.NumberFormat(locale)

  return (
    <BranchSwitcher>
      <fieldset className="bl-branches">
        <legend className="bl-branches__legend">{t('branchesLabel')}</legend>
        <div className="bl-branches__list">
          <div className="bl-branch">
            <input type="radio" name="bl-branch" id="bl-b-all" defaultChecked />
            <label htmlFor="bl-b-all">
              {t('allBranches')}
              <span className="bl-branch__stat bl-mono">{nf.format(total)}</span>
            </label>
          </div>
          {branches.map((b) => (
            <div className="bl-branch" key={b.lane}>
              <input type="radio" name="bl-branch" id={`bl-b-${b.lane}`} />
              <label htmlFor={`bl-b-${b.lane}`} className={`bl-lane-${b.lane}`}>
                <span className="bl-branch__swatch" aria-hidden="true" />
                {b.slug ? b.name : t('otherBranch')}
                <span className="bl-branch__stat bl-mono">
                  {nf.format(b.count)}
                  <span className="bl-branch__when">
                    <span className="bl-branch__dot" aria-hidden="true">·</span>
                    <time dateTime={b.latest}>{isoDate(b.latest)}</time>
                  </span>
                </span>
              </label>
            </div>
          ))}
        </div>
      </fieldset>
    </BranchSwitcher>
  )
}
