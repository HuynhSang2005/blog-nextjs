'use client'

/**
 * MDX Editor Component - Wrapper for @mdxeditor/editor
 * 
 * Features:
 * - Rich text editing with MDX support
 * - Toolbar with formatting options
 * - Fullscreen mode with toggle button
 * - Image upload support (Cloudinary via placeholder)
 * - Code blocks with syntax highlighting
 * - Links, lists, tables support
 * - Vietnamese UI labels via next-intl
 * - Minimum height 600px for better editing experience
 * 
 * Usage:
 * ```tsx
 * <MDXEditorComponent
 *   value={content}
 *   onChange={setContent}
 *   placeholder="Nhập nội dung tài liệu..."
 * />
 * ```
 */

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import dynamic from 'next/dynamic'
import { Maximize2, Minimize2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import '@mdxeditor/editor/style.css'

// Dynamic import to avoid SSR issues
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
)

// Import plugins dynamically
const {
  headingsPlugin,
  listsPlugin,
  quotePlugin,
  thematicBreakPlugin,
  markdownShortcutPlugin,
  linkPlugin,
  linkDialogPlugin,
  imagePlugin,
  tablePlugin,
  codeBlockPlugin,
  codeMirrorPlugin,
  frontmatterPlugin,
  diffSourcePlugin,
  toolbarPlugin,
  UndoRedo,
  BoldItalicUnderlineToggles,
  BlockTypeSelect,
  CreateLink,
  InsertImage,
  InsertTable,
  InsertCodeBlock,
  ListsToggle,
  Separator,
} = await import('@mdxeditor/editor')

interface MDXEditorComponentProps {
  /** Current MDX content */
  value: string
  /** Callback when content changes */
  onChange: (value: string) => void
  /** Placeholder text (Vietnamese) */
  placeholder?: string
  /** Editor className */
  className?: string
  /** Read-only mode */
  readOnly?: boolean
}

export function MDXEditorComponent({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
  readOnly = false,
}: MDXEditorComponentProps) {
  const t = useTranslations('admin')
  const [isFullscreen, setIsFullscreen] = useState(false)

  return (
    <div
      className={cn(
        'mdx-editor-wrapper relative',
        isFullscreen &&
          'fixed inset-4 z-50 bg-background shadow-2xl overflow-auto',
        className
      )}
    >
      {/* Fullscreen toggle button */}
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="absolute top-2 right-2 z-10 h-8 w-8"
        onClick={() => setIsFullscreen(!isFullscreen)}
        title={isFullscreen ? 'Thu nhỏ' : 'Toàn màn hình'}
      >
        {isFullscreen ? (
          <Minimize2 className="h-4 w-4" />
        ) : (
          <Maximize2 className="h-4 w-4" />
        )}
      </Button>

      <MDXEditor
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        contentEditableClassName="prose dark:prose-invert max-w-none"
        plugins={[
          // Core plugins
          headingsPlugin(),
          listsPlugin(),
          quotePlugin(),
          thematicBreakPlugin(),
          markdownShortcutPlugin(),
          
          // Link support
          linkPlugin(),
          linkDialogPlugin(),
          
          // Image support (placeholder - will integrate Cloudinary later)
          imagePlugin({
            imageUploadHandler: async (file: File) => {
              // TODO: Integrate with Cloudinary upload
              // For now, return placeholder URL
              console.log('Upload image:', file.name)
              return '/placeholder-image.jpg'
            },
          }),
          
          // Table support
          tablePlugin(),
          
          // Code blocks with syntax highlighting
          codeBlockPlugin({ defaultCodeBlockLanguage: 'typescript' }),
          codeMirrorPlugin({
            codeBlockLanguages: {
              typescript: 'TypeScript',
              javascript: 'JavaScript',
              jsx: 'JSX',
              tsx: 'TSX',
              css: 'CSS',
              html: 'HTML',
              json: 'JSON',
              markdown: 'Markdown',
              bash: 'Bash',
              shell: 'Shell',
              python: 'Python',
            },
          }),
          
          // Frontmatter support (for doc metadata if needed)
          frontmatterPlugin(),
          
          // Diff/Source view toggle
          diffSourcePlugin({ viewMode: 'rich-text' }),
          
          // Toolbar with formatting options
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <InsertImage />
                <Separator />
                <ListsToggle />
                <Separator />
                <InsertTable />
                <InsertCodeBlock />
              </>
            ),
          }),
        ]}
      />
    </div>
  )
}

/**
 * MDX Editor with minimal plugins (for simple text editing)
 */
export function MDXEditorSimple({
  value,
  onChange,
  placeholder = 'Nhập nội dung...',
  className = '',
}: Omit<MDXEditorComponentProps, 'readOnly'>) {
  return (
    <div className={`mdx-editor-wrapper ${className}`}>
      <MDXEditor
        markdown={value}
        onChange={onChange}
        placeholder={placeholder}
        contentEditableClassName="prose dark:prose-invert max-w-none"
        plugins={[
          headingsPlugin(),
          listsPlugin(),
          linkPlugin(),
          linkDialogPlugin(),
          markdownShortcutPlugin(),
          toolbarPlugin({
            toolbarContents: () => (
              <>
                <UndoRedo />
                <Separator />
                <BoldItalicUnderlineToggles />
                <Separator />
                <BlockTypeSelect />
                <Separator />
                <CreateLink />
                <ListsToggle />
              </>
            ),
          }),
        ]}
      />
    </div>
  )
}
