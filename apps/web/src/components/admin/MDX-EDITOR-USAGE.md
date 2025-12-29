# MDX Editor Component - Usage Guide

Created: December 29, 2025
Version: 3.50.0 (@mdxeditor/editor)

## Installation ✅

```bash
bun add @mdxeditor/editor@3.50.0
```

## Components

### 1. MDXEditorComponent (Full Features)

Rich text editor với full toolbar và plugins.

**Features:**
- ✅ Headings (H1-H6)
- ✅ Bold, Italic, Underline
- ✅ Lists (ordered, unordered)
- ✅ Links
- ✅ Images (placeholder - Cloudinary integration pending)
- ✅ Tables
- ✅ Code blocks với syntax highlighting
- ✅ Blockquotes
- ✅ Markdown shortcuts
- ✅ Undo/Redo
- ✅ Rich-text/Source toggle

**Usage:**
```tsx
'use client'

import { MDXEditorComponent } from '@/components/admin/mdx-editor'
import { useState } from 'react'

export function DocEditor() {
  const [content, setContent] = useState('')
  
  return (
    <MDXEditorComponent
      value={content}
      onChange={setContent}
      placeholder="Nhập nội dung tài liệu..."
      className="min-h-[500px]"
    />
  )
}
```

### 2. MDXEditorSimple (Minimal)

Editor đơn giản với basic formatting.

**Features:**
- ✅ Headings
- ✅ Bold, Italic, Underline
- ✅ Lists
- ✅ Links
- ✅ Undo/Redo

**Usage:**
```tsx
import { MDXEditorSimple } from '@/components/admin/mdx-editor'

<MDXEditorSimple
  value={description}
  onChange={setDescription}
  placeholder="Mô tả ngắn..."
/>
```

## Props

```typescript
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
```

## Integration Examples

### Admin Docs Create Form

```tsx
'use client'

import { MDXEditorComponent } from '@/components/admin/mdx-editor'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useState } from 'react'

export function CreateDocForm() {
  const [title, setTitle] = useState('')
  const [content, setContent] = useState('')
  
  async function handleSubmit() {
    const { error } = await supabase.from('docs').insert({
      title,
      content,
      slug: slugify(title),
      topic_id: selectedTopicId,
      locale: 'vi',
    })
    
    if (!error) {
      toast.success('Tài liệu đã được tạo!')
    }
  }
  
  return (
    <form onSubmit={handleSubmit}>
      <Input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Tiêu đề tài liệu"
      />
      
      <MDXEditorComponent
        value={content}
        onChange={setContent}
        placeholder="Nội dung tài liệu (MDX)..."
        className="my-4"
      />
      
      <Button type="submit">Lưu</Button>
    </form>
  )
}
```

### Edit Mode with Prefilled Data

```tsx
export function EditDocForm({ doc }: { doc: Doc }) {
  const [content, setContent] = useState(doc.content)
  
  return (
    <MDXEditorComponent
      value={content}
      onChange={setContent}
      placeholder="Chỉnh sửa nội dung..."
    />
  )
}
```

### Read-Only Preview

```tsx
<MDXEditorComponent
  value={doc.content}
  onChange={() => {}}
  readOnly={true}
  className="border-0"
/>
```

## Styling

Custom styles in `src/styles/mdx-editor.css`:

- ✅ Dark mode support
- ✅ Tailwind integration
- ✅ Vietnamese UI adjustments
- ✅ Responsive design

**Customization:**
```css
/* Override in your component */
.my-editor .mdx-editor-wrapper {
  border: 2px solid red;
  border-radius: 1rem;
}
```

## Supported Languages (Code Blocks)

- TypeScript
- JavaScript
- JSX/TSX
- CSS
- HTML
- JSON
- Markdown
- Bash/Shell
- Python

**Add more languages:**
```tsx
codeMirrorPlugin({
  codeBlockLanguages: {
    // ...existing
    rust: 'Rust',
    go: 'Go',
    php: 'PHP',
  },
})
```

## Image Upload Integration (TODO)

Current: Returns placeholder URL.
**Next:** Integrate Cloudinary upload:

```tsx
imagePlugin({
  imageUploadHandler: async (file: File) => {
    // Upload to Cloudinary
    const formData = new FormData()
    formData.append('file', file)
    formData.append('upload_preset', 'blog-docs')
    
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      { method: 'POST', body: formData }
    )
    
    const data = await response.json()
    
    // Save to media table
    await supabase.from('media').insert({
      public_id: data.public_id,
      version: data.version,
      resource_type: 'image',
      // ...
    })
    
    return data.secure_url
  },
}),
```

## Troubleshooting

### SSR Hydration Error

**Problem:** "Hydration failed because the initial UI does not match..."

**Solution:** Already handled with `dynamic` import and `{ ssr: false }`:
```tsx
const MDXEditor = dynamic(
  () => import('@mdxeditor/editor').then((mod) => mod.MDXEditor),
  { ssr: false }
)
```

### Plugins Not Loading

**Problem:** Toolbar buttons không hiển thị.

**Solution:** Import plugins dynamically:
```tsx
const { headingsPlugin, toolbarPlugin } = await import('@mdxeditor/editor')
```

### Dark Mode Not Working

**Problem:** Editor không theo dark mode.

**Solution:** Check `globals.css` đã import `mdx-editor.css`:
```css
@import "./mdx-editor.css";
```

## Next Steps

1. ✅ Install package
2. ✅ Create wrapper component
3. ✅ Add custom CSS
4. ⏸️ Integrate Cloudinary image upload
5. ⏸️ Use in Admin Docs CRUD (Phase 4)
6. ⏸️ Test với real data

## References

- [MDXEditor Docs](https://mdxeditor.dev/)
- [npm Package](https://www.npmjs.com/package/@mdxeditor/editor)
- [GitHub Releases](https://github.com/mdx-editor/editor/releases)
