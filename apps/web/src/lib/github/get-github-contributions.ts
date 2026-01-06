import { unstable_cache } from 'next/cache'

export interface GithubContributionActivity {
  date: string
  count: number
  level: number
}

interface GithubContributionsApiResponse {
  total: Record<string, number>
  contributions: GithubContributionActivity[]
}

interface GithubUserApiResponse {
  created_at?: string
}

export type GithubContributionsView = 'last' | number

export interface GithubContributionsResult {
  username: string
  view: GithubContributionsView
  year: number | null
  total: number
  contributions: GithubContributionActivity[]
  availableYears: number[]
}

function getAvailableYears(total: Record<string, number>): number[] {
  return Object.keys(total)
    .map(key => {
      if (!/^\d{4}$/.test(key)) return null
      const year = Number(key)
      return Number.isFinite(year) ? year : null
    })
    .filter((year): year is number => year !== null)
    .sort((a, b) => b - a)
}

function dedupeAndSortContributions(
  contributions: GithubContributionActivity[]
): GithubContributionActivity[] {
  const byDate = new Map<string, GithubContributionActivity>()

  for (const activity of contributions) {
    if (!activity || typeof activity.date !== 'string') continue

    const existing = byDate.get(activity.date)
    if (!existing) {
      byDate.set(activity.date, activity)
      continue
    }

    // Prefer the entry with higher count (defensive; API should not duplicate).
    byDate.set(
      activity.date,
      activity.count >= existing.count ? activity : existing
    )
  }

  return Array.from(byDate.values()).sort((a, b) =>
    a.date.localeCompare(b.date)
  )
}

function clampContributionsToView(params: {
  contributions: GithubContributionActivity[]
  view: GithubContributionsView
}): GithubContributionActivity[] {
  const { contributions, view } = params

  if (contributions.length === 0) return []

  if (view !== 'last') {
    const prefix = `${view}-`
    return contributions.filter(activity => activity.date.startsWith(prefix))
  }

  const last = contributions.at(-1)
  if (!last) return contributions

  const lastDate = new Date(`${last.date}T00:00:00.000Z`)
  if (Number.isNaN(lastDate.getTime())) return contributions

  lastDate.setUTCDate(lastDate.getUTCDate() - 365)
  const cutoff = lastDate.toISOString().slice(0, 10)
  return contributions.filter(activity => activity.date >= cutoff)
}

async function fetchGithubContributions(
  username: string,
  view: GithubContributionsView
): Promise<GithubContributionsResult> {
  const url = new URL(
    `/v4/${username}`,
    'https://github-contributions-api.jogruber.de'
  )
  url.searchParams.append('y', String(view))

  const response = await fetch(url, {
    headers: {
      // Public endpoint; keep it cache-friendly.
      Accept: 'application/json',
    },
    // Next.js cache is handled by unstable_cache. Avoid double-caching here.
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`GitHub contributions fetch failed: ${response.status}`)
  }

  const data = (await response.json()) as GithubContributionsApiResponse
  const availableYears = getAvailableYears(data.total ?? {})

  const rawContributions = Array.isArray(data.contributions)
    ? data.contributions
    : []
  const contributions = clampContributionsToView({
    contributions: dedupeAndSortContributions(rawContributions),
    view,
  })
  const year = view === 'last' ? null : view

  const totalFromApi =
    view === 'last' ? data.total?.lastYear : data.total?.[String(view)]
  const total =
    typeof totalFromApi === 'number'
      ? totalFromApi
      : contributions.reduce((sum, activity) => sum + activity.count, 0)

  return {
    username,
    view,
    year,
    total,
    contributions,
    availableYears,
  }
}

export function getCachedGithubContributions(
  username: string,
  view: GithubContributionsView
) {
  return unstable_cache(
    async () => fetchGithubContributions(username, view),
    ['github-contributions', username, String(view)],
    { revalidate: 60 * 60 * 24 }
  )()
}

async function fetchGithubAccountCreatedYear(
  username: string
): Promise<number> {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github+json',
    },
    cache: 'no-store',
  })

  if (!response.ok) {
    throw new Error(`GitHub user fetch failed: ${response.status}`)
  }

  const data = (await response.json()) as GithubUserApiResponse
  const createdAt = data.created_at
  if (!createdAt) return new Date().getFullYear()

  const createdYear = Number(createdAt.slice(0, 4))
  return Number.isFinite(createdYear) ? createdYear : new Date().getFullYear()
}

export function getCachedGithubAccountCreatedYear(username: string) {
  return unstable_cache(
    async () => fetchGithubAccountCreatedYear(username),
    ['github-user-created-year', username],
    // GitHub created_at should never change; keep it fresh but not chatty.
    { revalidate: 60 * 60 * 24 * 7 }
  )()
}
