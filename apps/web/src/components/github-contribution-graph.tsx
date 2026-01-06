import { getTranslations } from 'next-intl/server'

import { Link } from '@/navigation'
import {
  getCachedGithubAccountCreatedYear,
  getCachedGithubContributions,
  type GithubContributionsView,
} from '@/lib/github/get-github-contributions'
import { cn } from '@/lib/utils'

import { GithubContributionGraphClient } from './github-contribution-graph.client'

const GITHUB_USERNAME = 'HuynhSang2005'
const GITHUB_PROFILE_URL = 'https://github.com/HuynhSang2005'

function parseYearView(value: string | undefined): GithubContributionsView {
  if (!value) return 'last'
  if (value === 'last') return 'last'

  if (/^\d{4}$/.test(value)) {
    const year = Number(value)
    if (Number.isFinite(year)) return year
  }

  return 'last'
}

function buildYearOptions(params: {
  createdYear: number
  currentYear: number
}): number[] {
  const start = Math.min(params.createdYear, params.currentYear)
  const end = Math.max(params.createdYear, params.currentYear)
  const years: number[] = []

  for (let year = end; year >= start; year -= 1) {
    years.push(year)
  }

  return years
}

export interface GithubContributionGraphProps {
  locale: string
  year?: string
}

export async function GithubContributionGraph({
  locale,
  year,
}: GithubContributionGraphProps) {
  const t = await getTranslations('site.github_contribution_graph')

  const view = parseYearView(year)
  const hrefBase = '/'

  try {
    const [result, createdYear] = await Promise.all([
      getCachedGithubContributions(GITHUB_USERNAME, view),
      getCachedGithubAccountCreatedYear(GITHUB_USERNAME),
    ])

    const currentYear = new Date().getFullYear()
    const years = buildYearOptions({ createdYear, currentYear })

    const headline =
      view === 'last'
        ? t('headline_last_year', { count: result.total })
        : t('headline_year', { count: result.total, year: String(view) })

    if (result.contributions.length === 0) {
      return (
        <section className="mx-auto mt-10 w-full max-w-5xl rounded-lg border bg-card p-6">
          <div className="flex flex-col gap-2">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t('title')}</h2>
              <Link
                className="text-sm text-muted-foreground underline underline-offset-4"
                href={GITHUB_PROFILE_URL}
                rel="noreferrer"
                target="_blank"
              >
                {t('view_profile')}
              </Link>
            </div>

            <p className="text-sm font-medium">{headline}</p>
            <p className="text-sm text-muted-foreground">{t('error')}</p>
          </div>
        </section>
      )
    }

    return (
      <section className="mx-auto mt-10 w-fit rounded-lg border bg-card p-6">
        <div className="flex items-start">
          <div className="min-w-0">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-lg font-semibold">{t('title')}</h2>
              <Link
                className="text-sm text-muted-foreground underline underline-offset-4"
                href={GITHUB_PROFILE_URL}
                rel="noreferrer"
                target="_blank"
              >
                {t('view_profile')}
              </Link>
            </div>

            <p className="mt-2 text-sm font-medium">{headline}</p>

            <div className="mt-4">
              <GithubContributionGraphClient
                contributions={result.contributions}
                labels={{
                  months: [
                    'Th1',
                    'Th2',
                    'Th3',
                    'Th4',
                    'Th5',
                    'Th6',
                    'Th7',
                    'Th8',
                    'Th9',
                    'Th10',
                    'Th11',
                    'Th12',
                  ],
                  legend: {
                    less: t('legend_less'),
                    more: t('legend_more'),
                  },
                }}
                total={result.total}
              />
            </div>
          </div>

          <nav
            aria-label={t('years_aria_label')}
            className="-mx-1 mt-4 flex w-full shrink-0 gap-1 overflow-x-auto px-1 pb-2 sm:mx-0 sm:ml-8 sm:mt-0 sm:w-auto sm:flex-col sm:overflow-visible sm:pb-0"
          >
            <Link
              className={cn(
                'rounded-md px-3 py-2 text-sm',
                view === 'last'
                  ? 'bg-muted font-medium'
                  : 'text-muted-foreground hover:bg-muted'
              )}
              href={hrefBase}
              locale={locale}
              scroll={false}
            >
              {t('filter_last_year')}
            </Link>

            {years.map(y => {
              const isActive = view !== 'last' && view === y

              return (
                <Link
                  className={cn(
                    'rounded-md px-3 py-2 text-sm',
                    isActive
                      ? 'bg-muted font-medium'
                      : 'text-muted-foreground hover:bg-muted'
                  )}
                  href={`${hrefBase}?year=${y}`}
                  key={y}
                  locale={locale}
                  scroll={false}
                >
                  {y}
                </Link>
              )
            })}
          </nav>
        </div>
      </section>
    )
  } catch {
    return (
      <section className="mx-auto mt-10 w-full max-w-5xl rounded-lg border bg-card p-6">
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between gap-3">
            <h2 className="text-lg font-semibold">{t('title')}</h2>
            <Link
              className="text-sm text-muted-foreground underline underline-offset-4"
              href={GITHUB_PROFILE_URL}
              rel="noreferrer"
              target="_blank"
            >
              {t('view_profile')}
            </Link>
          </div>
          <p className="text-sm text-muted-foreground">{t('error')}</p>
        </div>
      </section>
    )
  }
}
