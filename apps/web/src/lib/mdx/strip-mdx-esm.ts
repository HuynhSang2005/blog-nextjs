/**
 * Strips ESM `import`/`export` statements from an MDX string.
 *
 * This is important for runtime MDX rendering from database strings:
 * - Admin editors (e.g. @mdxeditor/editor) may serialize JSX blocks with `import ... from`.
 * - Runtime MDX compilation (function-body) cannot accept top-level ESM.
 *
 * We only remove these statements when they appear outside of fenced code blocks.
 */
export function stripMdxEsm(source: string): string {
  const lines = source.split(/\r?\n/)

  let inFence = false

  const cleaned = lines.filter(line => {
    const trimmed = line.trim()

    // Toggle fenced code blocks (```lang)
    if (trimmed.startsWith('```')) {
      inFence = !inFence
      return true
    }

    if (inFence) return true

    // Strip top-level ESM (outside code fences only)
    if (/^(import|export)\s/.test(trimmed)) {
      return false
    }

    return true
  })

  return cleaned.join('\n')
}
