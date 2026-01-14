'use client'

import { useEffect, useRef, useState, type RefAttributes } from 'react'
import dynamic from 'next/dynamic'
import type {
  JsxComponentDescriptor,
  MDXEditorMethods,
  MDXEditorProps,
} from '@mdxeditor/editor'
import '@mdxeditor/editor/style.css'
import '@/styles/mdx-editor.css'
import '@/styles/mdx-editor-overrides.css'
import { Loader2 } from 'lucide-react'
import { useTranslations } from 'next-intl'

// Dynamic import để tránh SSR issues
const MDXEditorComponent = dynamic(
  () => import('@mdxeditor/editor').then(mod => mod.MDXEditor),
  { ssr: false }
) as unknown as React.ComponentType<
  MDXEditorProps & RefAttributes<MDXEditorMethods>
>

interface MDXEditorWrapperProps {
  value: string
  onChange: (value: string) => void
  /**
   * Dùng cho Diff mode: so sánh nội dung hiện tại với một phiên bản khác (thường là bản đã lưu).
   * Lưu ý: MDXEditor coi `markdown` là read-only sau khi mount, nên diff base sẽ được áp bằng cách remount editor.
   */
  diffMarkdown?: string
  readOnly?: boolean
  withToolbar?: boolean
  placeholder?: string
  className?: string
  i18nNamespace?: string
}

export function MDXEditorWrapper({
  value,
  onChange,
  diffMarkdown,
  readOnly = false,
  withToolbar = true,
  placeholder,
  className,
  i18nNamespace = 'admin.docs',
}: MDXEditorWrapperProps) {
  const t = useTranslations(i18nNamespace)
  const [isMounted, setIsMounted] = useState(false)
  const editorRef = useRef<MDXEditorMethods | null>(null)
  const lastEmittedMarkdownRef = useRef<string>(value)
  const lastExternalMarkdownRef = useRef<string>(value)
  const initialMarkdownRef = useRef<string | null>(null)
  if (initialMarkdownRef.current === null) {
    initialMarkdownRef.current = value
  }
  const initialMarkdown = initialMarkdownRef.current
  const [plugins, setPlugins] = useState<
    NonNullable<MDXEditorProps['plugins']>
  >([])

  useEffect(() => {
    setIsMounted(true)

    // Load plugins client-side only
    import('@mdxeditor/editor').then(mod => {
      const {
        diffSourcePlugin,
        directivesPlugin,
        AdmonitionDirectiveDescriptor,
        headingsPlugin,
        jsxPlugin,
        GenericJsxEditor,
        listsPlugin,
        linkPlugin,
        linkDialogPlugin,
        quotePlugin,
        thematicBreakPlugin,
        markdownShortcutPlugin,
        codeBlockPlugin,
        codeMirrorPlugin,
        tablePlugin,
        imagePlugin,
        frontmatterPlugin,
        toolbarPlugin,
        DiffSourceToggleWrapper,
        UndoRedo,
        BoldItalicUnderlineToggles,
        CreateLink,
        InsertCodeBlock,
        InsertImage,
        InsertTable,
        InsertThematicBreak,
        InsertAdmonition,
        InsertFrontmatter,
        ListsToggle,
        BlockTypeSelect,
        CodeToggle,
        ConditionalContents,
        ChangeCodeMirrorLanguage,
        insertMarkdown$,
        usePublisher,
        Button: ToolbarButton,
        Separator: ToolbarSeparator,
      } = mod

      const jsxComponentDescriptors: JsxComponentDescriptor[] = [
        {
          name: 'Callout',
          kind: 'flow',
          source: '@/components/callout',
          props: [
            { name: 'title', type: 'string' },
            { name: 'icon', type: 'string' },
          ],
          hasChildren: true,
          Editor: GenericJsxEditor,
        },
        {
          name: 'Steps',
          kind: 'flow',
          source: '@/components/docs/mdx-remote',
          props: [],
          hasChildren: true,
          Editor: GenericJsxEditor,
        },
        {
          name: 'Tabs',
          kind: 'flow',
          source: '@/components/ui/tabs',
          props: [{ name: 'defaultValue', type: 'string' }],
          hasChildren: true,
          Editor: GenericJsxEditor,
        },
        {
          name: 'TabsList',
          kind: 'flow',
          source: '@/components/ui/tabs',
          props: [],
          hasChildren: true,
          Editor: GenericJsxEditor,
        },
        {
          name: 'TabsTrigger',
          kind: 'text',
          source: '@/components/ui/tabs',
          props: [{ name: 'value', type: 'string', required: true }],
          hasChildren: true,
          Editor: GenericJsxEditor,
        },
        {
          name: 'TabsContent',
          kind: 'flow',
          source: '@/components/ui/tabs',
          props: [{ name: 'value', type: 'string', required: true }],
          hasChildren: true,
          Editor: GenericJsxEditor,
        },
      ]

      const InsertCallout = () => {
        const insertMarkdown = usePublisher(insertMarkdown$)

        const label = t('editor.toolbar.insert_callout')

        return (
          <ToolbarButton
            className="w-auto whitespace-nowrap px-2"
            onClick={() =>
              insertMarkdown(
                '\n\n<Callout title="Lưu ý" icon="💡">\n<p>Nội dung Callout...</p>\n</Callout>\n'
              )
            }
            title={label}
          >
            {label}
          </ToolbarButton>
        )
      }

      const InsertSteps = () => {
        const insertMarkdown = usePublisher(insertMarkdown$)

        const label = t('editor.toolbar.insert_steps')

        return (
          <ToolbarButton
            className="w-auto whitespace-nowrap px-2"
            onClick={() =>
              insertMarkdown(
                '\n\n<Steps>\n\n<h3>Bước 1</h3>\n<p>Mô tả bước 1...</p>\n\n<h3>Bước 2</h3>\n<p>Mô tả bước 2...</p>\n\n</Steps>\n'
              )
            }
            title={label}
          >
            {label}
          </ToolbarButton>
        )
      }

      const InsertTabs = () => {
        const insertMarkdown = usePublisher(insertMarkdown$)

        const label = t('editor.toolbar.insert_tabs')

        return (
          <ToolbarButton
            className="w-auto whitespace-nowrap px-2"
            onClick={() =>
              insertMarkdown(
                '\n\n<Tabs defaultValue="tab-1">\n  <TabsList>\n    <TabsTrigger value="tab-1">Tab 1</TabsTrigger>\n    <TabsTrigger value="tab-2">Tab 2</TabsTrigger>\n  </TabsList>\n\n  <TabsContent value="tab-1">\n    <p>Nội dung Tab 1</p>\n  </TabsContent>\n\n  <TabsContent value="tab-2">\n    <p>Nội dung Tab 2</p>\n  </TabsContent>\n</Tabs>\n'
              )
            }
            title={label}
          >
            {label}
          </ToolbarButton>
        )
      }

      // Cloudinary image upload handler
      const handleImageUpload = async (file: File): Promise<string> => {
        try {
          const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
          const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME

          if (!cloudName || !uploadPreset) {
            throw new Error(t('messages.cloudinary_missing_config'))
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
        // Toggle between rich-text and source mode
        diffSourcePlugin({
          viewMode: 'rich-text',
          diffMarkdown: diffMarkdown ?? initialMarkdown,
          readOnlyDiff: true,
        }),

        // Markdown directives (Admonitions)
        directivesPlugin({
          directiveDescriptors: [AdmonitionDirectiveDescriptor],
        }),

        // JSX components (Callout/Tabs/Steps) for MDX runtime rendering
        jsxPlugin({
          jsxComponentDescriptors,
          allowFragment: true,
        }),

        // Core text formatting
        headingsPlugin(),
        listsPlugin(),
        linkPlugin(),
        linkDialogPlugin(),
        quotePlugin(),
        thematicBreakPlugin(),

        // Code blocks with syntax highlighting
        codeBlockPlugin({
          defaultCodeBlockLanguage: 'typescript',
        }),
        codeMirrorPlugin({
          autoLoadLanguageSupport: true,
          codeBlockLanguages: {
            'N/A': 'Plain text',
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
      ])

      if (withToolbar) {
        setPlugins(prev => [
          ...prev,
          toolbarPlugin({
            toolbarContents: () => (
              <DiffSourceToggleWrapper>
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
                <ConditionalContents
                  options={[
                    {
                      when: editor => editor?.editorType === 'codeblock',
                      contents: () => <ChangeCodeMirrorLanguage />,
                    },
                  ]}
                />
                <InsertImage />
                <InsertTable />
                <ToolbarSeparator />
                <InsertAdmonition />
                <InsertCallout />
                <InsertTabs />
                <InsertSteps />
                <InsertThematicBreak />
                <InsertFrontmatter />
              </DiffSourceToggleWrapper>
            ),
          }),
        ])
      }
    })
  }, [diffMarkdown, initialMarkdown, t, withToolbar])

  // MDXEditor treats `markdown` as read-only after mount.
  // Keep form state in sync using ref methods instead of feeding `value` back into the `markdown` prop.
  useEffect(() => {
    const isInternalUpdate = value === lastEmittedMarkdownRef.current
    if (isInternalUpdate) return
    if (value === lastExternalMarkdownRef.current) return

    lastExternalMarkdownRef.current = value
    editorRef.current?.setMarkdown(value)
  }, [value])

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
        className="mdxeditor"
        markdown={initialMarkdown}
        onChange={(markdown: string) => {
          lastEmittedMarkdownRef.current = markdown
          onChange(markdown)
        }}
        placeholder={placeholder ?? t('form.placeholders.content')}
        plugins={plugins}
        readOnly={readOnly}
        ref={editorRef}
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
  i18nNamespace,
}: {
  value: string
  className?: string
  i18nNamespace?: string
}) {
  return (
    <MDXEditorWrapper
      className={className}
      i18nNamespace={i18nNamespace}
      onChange={() => {}} // No-op
      readOnly
      value={value}
      withToolbar={false}
    />
  )
}
