'use client'

import { useEffect, useState } from 'react'
import dynamic from 'next/dynamic'
import type { MDXEditorProps } from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Dynamic import để tránh SSR issues
const MDXEditorComponent = dynamic<MDXEditorProps>(
  () => import('@mdxeditor/editor').then(mod => mod.MDXEditor),
  {
    ssr: false,
  }
)

interface MDXEditorWrapperProps {
  value: string
  onChange: (value: string) => void
  readOnly?: boolean
  placeholder?: string
  className?: string
}

export function MDXEditorWrapper({
  value,
  onChange,
  readOnly = false,
  placeholder,
  className,
}: MDXEditorWrapperProps) {
  const t = useTranslations('admin.docs')
  const [isMounted, setIsMounted] = useState(false)
  const [plugins, setPlugins] = useState<
    NonNullable<MDXEditorProps['plugins']>
  >([])

  useEffect(() => {
    setIsMounted(true)

    // Load plugins client-side only
    import('@mdxeditor/editor').then(mod => {
      const {
        headingsPlugin,
        listsPlugin,
        linkPlugin,
        quotePlugin,
        thematicBreakPlugin,
        markdownShortcutPlugin,
        codeBlockPlugin,
        codeMirrorPlugin,
        tablePlugin,
        imagePlugin,
        frontmatterPlugin,
        toolbarPlugin,
        UndoRedo,
        BoldItalicUnderlineToggles,
        CreateLink,
        InsertCodeBlock,
        InsertImage,
        InsertTable,
        ListsToggle,
        BlockTypeSelect,
        CodeToggle,
        Separator: ToolbarSeparator,
      } = mod

      // Cloudinary image upload handler
      const handleImageUpload = async (file: File): Promise<string> => {
        try {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME

          if (!cloudName || !uploadPreset) {
            throw new Error(
              t('messages.cloudinary_missing_config')
            )
          }

          const formData = new FormData()
          formData.append('file', file)
          formData.append('upload_preset', uploadPreset)

          const response = await fetch(
            `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
            {
              method: 'POST',
              body: formData,
            }
          )

          if (!response.ok) {
            throw new Error('Upload failed')
          }

          const data = await response.json()
          return data.secure_url
        } catch (error) {
          console.error('Image upload error:', error)
          throw new Error(t('messages.image_upload_failed'))
        }
      }

      setPlugins([
        // Core text formatting
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),

        // Code blocks with syntax highlighting
        codeBlockPlugin({
          defaultCodeBlockLanguage: 'typescript',
        }),
        codeMirrorPlugin({
          codeBlockLanguages: {
            typescript: 'TypeScript',
            javascript: 'JavaScript',
            tsx: 'TSX',
            jsx: 'JSX',
            css: 'CSS',
            html: 'HTML',
            json: 'JSON',
            bash: 'Bash',
            sql: 'SQL',
            python: 'Python',
            go: 'Go',
            rust: 'Rust',
            markdown: 'Markdown',
          },
        }),

        // Rich content
        tablePlugin(),
        imagePlugin({
          imageUploadHandler: handleImageUpload,
          imageAutocompleteSuggestions: [],
        }),
        frontmatterPlugin(),

        // UX improvements
        markdownShortcutPlugin(),

        // Toolbar
        toolbarPlugin({
          toolbarContents: () => (
            <>
              <UndoRedo />
              <ToolbarSeparator />
              <BoldItalicUnderlineToggles />
              <CodeToggle />
              <ToolbarSeparator />
              <BlockTypeSelect />
              <ToolbarSeparator />
              <CreateLink />
              <ListsToggle />
              <ToolbarSeparator />
              <InsertCodeBlock />
              <InsertImage />
              <InsertTable />
            </>
          ),
        }),
      ])
    })
  }, [])

  if (!isMounted || plugins.length === 0) {
    return (
      <div className="flex items-center justify-center h-96 border rounded-lg bg-muted/50">
        <div className="flex flex-col items-center gap-2 text-muted-foreground">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p className="text-sm">{t('messages.editor_initializing')}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={className}>
      <MDXEditorComponent
        contentEditableClassName="prose prose-slate dark:prose-invert max-w-none min-h-[400px] p-4"
        markdown={value}
        onChange={onChange}
        placeholder={placeholder ?? t('form.placeholders.content')}
        plugins={plugins}
        readOnly={readOnly}
      />
    </div>
  )
}

/**
 * Lightweight preview-only MDX viewer
 * Không có toolbar, chỉ hiển thị nội dung
 */
export function MDXEditorPreview({
  value,
  className,
}: {
  value: string
  className?: string
}) {
  return (
    <MDXEditorWrapper
      className={className}
      onChange={() => {}} // No-op
      readOnly
      value={value}
    />
  )
}
