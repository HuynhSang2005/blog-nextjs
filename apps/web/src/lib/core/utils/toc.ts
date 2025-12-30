import { visit } from 'unist-util-visit'
import { toc } from 'mdast-util-toc'
import { remark } from 'remark'
import type { Node } from 'unist'
import type { Root } from 'mdast'
import type { VFile } from 'vfile'

const textTypes = ['text', 'emphasis', 'strong', 'inlineCode']

interface Item {
  title?: string
  url?: string
  items?: Item[]
}

function flattenNode(node: Node): string {
  const p: string[] = []

  visit(node, (node: Node) => {
    if (!textTypes.includes(node.type)) return
    if ('value' in node && typeof node.value === 'string') {
      p.push(node.value)
    }
  })

  return p.join('')
}

function getItems(node: Node | undefined, current: Item): Item {
  if (!node) {
    return {}
  }

  if (node.type === 'paragraph') {
    visit(node, (item: Node) => {
      if (item.type === 'link' && 'url' in item) {
        current.url = item.url as string
        current.title = flattenNode(node)
      }

      if (item.type === 'text') {
        current.title = flattenNode(node)
      }
    })

    return current
  }

  if (node.type === 'list' && 'children' in node) {
    current.items = (node.children as Node[])?.map((i: Node) => getItems(i, {})) || []

    return current
  }
  if (node.type === 'listItem' && 'children' in node) {
    const children = node.children as Node[]
    const heading = getItems(children?.[0], {})

    if (children && children.length > 1) {
      getItems(children[1], heading)
    }

    return heading
  }

  return {}
}

const getToc = () => (node: Root, file: VFile) => {
  const table = toc(node)
  const items = getItems(table.map as Node | undefined, {})

  // Store in file.data with proper typing
  file.data.toc = items
}

export type TableOfContents = Item

export async function getTableOfContents(
  content: string
): Promise<TableOfContents> {
  const result = await remark().use(getToc).process(content)

  return (result.data.toc as TableOfContents) || {}
}
