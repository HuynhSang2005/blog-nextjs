export interface DocLinksValue {
  source?: string
  doc?: string
  api?: string
  blog?: string
}

export type PublicDocRecord = Record<string, unknown> & {
  title: string
  description: string | null
  content: string
  toc: unknown
  show_toc: boolean | null
  links?: DocLinksValue | null
}
