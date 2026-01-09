import type { TableOfContents } from '@/lib/core/utils/toc'
import type { FlatTocItem } from '@/lib/mdx/precompute'

export function convertFlatTocToNested(flatToc: unknown): TableOfContents {
  const coerced = coerceFlatTocItems(flatToc)

  if (!coerced || coerced.length === 0) {
    return { items: [] }
  }

  const items = coerced.map(item => ({
    url: `#${item.id}`,
    title: item.value,
    items: [],
  }))

  return { items }
}

function coerceFlatTocItems(value: unknown): FlatTocItem[] | null {
  if (!Array.isArray(value) || value.length === 0) {
    return null
  }

  const result: FlatTocItem[] = []

  for (const item of value) {
    if (!item || typeof item !== 'object') {
      continue
    }

    const maybeId = (item as { id?: unknown }).id
    const maybeDepth = (item as { depth?: unknown }).depth
    const maybeValue = (item as { value?: unknown }).value

    if (typeof maybeId !== 'string' || typeof maybeValue !== 'string') {
      continue
    }

    const depth = typeof maybeDepth === 'number' ? maybeDepth : 0

    result.push({
      id: maybeId,
      depth,
      value: maybeValue,
    })
  }

  return result.length > 0 ? result : null
}
