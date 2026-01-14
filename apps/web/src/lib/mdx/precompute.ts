/**
 * MDX Precompute Utilities - Phase 1.3B
 *
 * Precomputes expensive MDX artifacts at publish-time to improve runtime performance.
 * Based on Phase 0 baseline analysis: TOC computation is Hotspot #2 (after MDX compile/render).
 *
 * @see docs/dev-mdx/phase-0-mdx-baseline.md
 */

import { createHash } from 'node:crypto'
import { remark } from 'remark'
import remarkMdx from 'remark-mdx'
import { visit } from 'unist-util-visit'
import { toc } from 'mdast-util-toc'
import type { Root } from 'mdast'

// ============================================
// TYPE DEFINITIONS
// ============================================

/**
 * TOC item structure (matches existing toc.ts format)
 */
export interface TocItem {
  title: string
  url: string
  items?: TocItem[]
}

/**
 * Flat TOC item for JSONB storage
 */
export interface FlatTocItem {
  id: string // Heading ID (URL without #)
  depth: number // Heading depth (1-6)
  value: string // Heading text
}

/**
 * Precomputed artifacts result
 */
export interface PrecomputedArtifacts {
  toc: FlatTocItem[] | null // For docs only
  reading_time_minutes: number // For all content types
  search_text: string // Plain text for FTS
  content_hash: string // SHA-256 hash
}

// ============================================
// TOC COMPUTATION (reuse existing logic)
// ============================================

const textTypes = ['text', 'emphasis', 'strong', 'inlineCode']

function flattenNode(node: any): string {
  const p: string[] = []
  visit(node, (node: any) => {
    if (!textTypes.includes(node.type)) return
    if (node.value) {
      p.push(node.value)
    }
  })
  return p.join('')
}

function getItems(node: any, current: any): any {
  if (!node) return {}

  if (node.type === 'paragraph') {
    visit(node, (item: any) => {
      if (item.type === 'link') {
        current.url = item.url
        current.title = flattenNode(node)
      }
      if (item.type === 'text') {
        current.title = flattenNode(node)
      }
    })
    return current
  }

  if (node.type === 'list') {
    current.items = node.children?.map((i: any) => getItems(i, {})) || []
    return current
  }

  if (node.type === 'listItem') {
    const heading = getItems(node.children?.[0], {})
    if (node.children && node.children.length > 1) {
      getItems(node.children[1], heading)
    }
    return heading
  }

  return {}
}

const getTocPlugin = () => (node: any, file: any) => {
  const table = toc(node)
  const items = getItems(table.map, {})
  file.data = items
}

/**
 * Compute TOC from MDX content (nested structure)
 * @param content - MDX content string
 * @returns Nested TOC structure (existing format)
 */
export async function computeToc(content: string): Promise<TocItem[]> {
  const result = await remark().use(getTocPlugin).process(content)
  const data = result.data as any
  return data.items || []
}

/**
 * Compute flat TOC for JSONB storage
 * Extracts headings directly from AST (simpler than nested structure)
 *
 * @param content - MDX content string
 * @returns Flat array of heading items
 */
export async function computeFlatToc(content: string): Promise<FlatTocItem[]> {
  const items: FlatTocItem[] = []

  const processor = remark().use(remarkMdx)
  const tree = processor.parse(content) as Root

  visit(tree, 'heading', (node: any) => {
    // Extract heading text
    const value = flattenNode(node)
    if (!value) return

    // Generate ID (same logic as remark-slug)
    const id = value
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .replace(/^-|-$/g, '')

    items.push({
      id,
      depth: node.depth,
      value,
    })
  })

  return items
}

// ============================================
// READING TIME COMPUTATION
// ============================================

/**
 * Compute estimated reading time
 * Industry standard: 200 words per minute (WPM) for technical content
 *
 * @param content - MDX content string
 * @returns Reading time in minutes (rounded up)
 */
export function computeReadingTime(content: string): number {
  // Strip MDX/JSX syntax for accurate word count
  const plainText = stripMarkdownToText(content)

  // Split by whitespace and filter empty strings
  const words = plainText.trim().split(/\s+/).filter(Boolean)
  const wordCount = words.length

  // Calculate reading time (minimum 1 minute)
  const WPM = 200
  const minutes = Math.ceil(wordCount / WPM)

  return Math.max(1, minutes)
}

// ============================================
// SEARCH TEXT EXTRACTION
// ============================================

/**
 * Strip markdown/MDX syntax to get plain text for full-text search
 * Removes: code blocks, inline code, JSX tags, links, emphasis, etc.
 *
 * @param content - MDX content string
 * @returns Plain text suitable for FTS indexing
 */
export function stripMarkdownToText(content: string): string {
  let text = content

  // Remove code blocks (```...```)
  text = text.replace(/```[\s\S]*?```/g, '')

  // Remove inline code (`...`)
  text = text.replace(/`[^`]+`/g, '')

  // Remove JSX/HTML tags (<Component>...</Component>)
  text = text.replace(/<[^>]+>/g, ' ')

  // Remove MDX imports/exports
  text = text.replace(/^(import|export)\s+.*$/gm, '')

  // Remove links but keep text: [text](url) -> text
  text = text.replace(/\[([^\]]+)\]\([^)]+\)/g, '$1')

  // Remove images: ![alt](url) -> (empty)
  text = text.replace(/!\[([^\]]*)\]\([^)]+\)/g, '')

  // Remove emphasis/strong: **text** or *text* -> text
  text = text.replace(/(\*\*|__)(.*?)\1/g, '$2')
  text = text.replace(/(\*|_)(.*?)\1/g, '$2')

  // Remove headings markers: ## Heading -> Heading
  text = text.replace(/^#{1,6}\s+/gm, '')

  // Remove blockquotes: > text -> text
  text = text.replace(/^>\s+/gm, '')

  // Remove horizontal rules: --- or *** -> (empty)
  text = text.replace(/^(-{3,}|\*{3,}|_{3,})$/gm, '')

  // Remove list markers: - item or * item or 1. item -> item
  text = text.replace(/^[\s]*[-*+]\s+/gm, '')
  text = text.replace(/^[\s]*\d+\.\s+/gm, '')

  // Normalize whitespace
  text = text.replace(/\s+/g, ' ').trim()

  return text
}

// ============================================
// CONTENT HASH COMPUTATION
// ============================================

/**
 * Compute SHA-256 hash of content for cache invalidation
 *
 * @param content - MDX content string
 * @returns SHA-256 hash (hex format)
 */
export function hashContent(content: string): string {
  return createHash('sha256').update(content, 'utf8').digest('hex')
}

// ============================================
// CODE BLOCK FIXING
// ============================================

/**
 * Fix malformed code blocks in markdown content
 * Handles cases where code blocks don't have language identifiers
 *
 * Common issues:
 * - Empty language: ```\ncode\n```
 * - Text before code block without proper formatting
 *
 * @param content - MDX content string
 * @returns Fixed content with valid code blocks
 */
export function fixMalformedCodeBlocks(content: string): string {
  let fixed = content

  // Fix 1: Code blocks without language (``` followed by newline)
  // These appear as ```\n or ``` \n in markdown
  // Replace with ```javascript as a sensible default
  fixed = fixed.replace(/^```\s*\n/gm, '```javascript\n')

  // Fix 2: Code blocks with only whitespace after opening: ```  \n
  fixed = fixed.replace(/^```\s+(\S)/gm, '```javascript\n$1')

  // Fix 3: Handle cases where text like "JavaScript" appears on line before code block
  // This pattern: word on its own line, followed by empty line, then code block
  // This is often a heading mistake - the word should be removed or formatted properly
  // Pattern: line with single word, followed by ``` on next line
  fixed = fixed.replace(/^([A-Za-z]+)\s*\n\s*```(\w*)\n/gm, '```$2\n')

  return fixed
}

// ============================================
// COMBINED PRECOMPUTE FUNCTION
// ============================================

/**
 * Precompute all MDX artifacts for a given content
 *
 * @param content - MDX content string
 * @param options - Computation options
 * @returns All precomputed artifacts
 */
export async function precomputeArtifacts(
  content: string,
  options: {
    computeToc?: boolean // Set to true for docs (default: false for blog/projects)
  } = {}
): Promise<PrecomputedArtifacts> {
  const { computeToc: shouldComputeToc = false } = options

  // Compute TOC (only for docs)
  const toc = shouldComputeToc ? await computeFlatToc(content) : null

  // Compute reading time
  const reading_time_minutes = computeReadingTime(content)

  // Extract plain text for search
  const search_text = stripMarkdownToText(content)

  // Compute content hash
  const content_hash = hashContent(content)

  return {
    toc,
    reading_time_minutes,
    search_text,
    content_hash,
  }
}
