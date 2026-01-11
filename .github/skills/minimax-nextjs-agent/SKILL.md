---
name: minimax-nextjs-agent
description: Expert UI/UX Next.js v16 với MiniMax M2.1 + MCP (understand_image, Chrome DevTools). Phân tích UI, redesign Shadcn/Tailwind, responsive, accessibility.
---

# MiniMax M2.1 Next.js UI/Agent Skill

Expert UI/UX development cho Next.js 16 sử dụng **MiniMax M2.1** model với MCP tools. Đặc biệt hữu ích cho việc phân tích và cải thiện UI/UX vì MiniMax M2.1 không có native vision.

## 🎯 Overview

### Model Limitations & Solutions

**MiniMax M2.1**: Không có native vision capabilities → Sử dụng:
- **`understand_image` MCP**: Phân tích images (URLs, local files, base64)
- **`chrome-devtools-mcp`**: Browser automation, screenshots, DOM inspection

### MCP Tools Stack

```json
{
  "mcpServers": {
    "minimax": {
      "command": "uvx",
      "args": ["minimax-coding-plan-mcp", "-y"],
      "env": {
        "MINIMAX_API_KEY": "your-api-key",
        "MINIMAX_API_HOST": "https://api.minimax.io"
      }
    },
    "chrome-devtools": {
      "command": "npx",
      "args": ["-y", "chrome-devtools-mcp@latest"]
    }
  }
}
```

## 🔧 MCP Tools Reference

### MiniMax Coding Plan MCP

#### understand_image
**Purpose**: Analyze images using AI vision models (compensates for M2.1's lack of native vision)

**Input Types**:
- Remote URLs: `https://example.com/screenshot.png`
- Local paths: `/absolute/path/to/image.png` hoặc `relative/path.jpg`
- Base64 data URLs: `data:image/png;base64,...`

**Usage Examples**:
```text
"Analyze this design mockup: https://example.com/design.png and identify components"

"Describe the UI issues in this screenshot: /Users/dev/Downloads/ current.png"

"Extract text from images/receipt.jpg for data entry validation"
```

**Response**: Textual analysis của image content

#### web_search
**Purpose**: Intelligent web search (organic results + related searches)

```text
"Search for latest Tailwind CSS v4 features 2025"
```

---

### Chrome DevTools MCP

#### Navigation Tools (7 tools)
- `navigate_page(url)` - Điều hướng đến URL
- `new_page(url)` - Mở tab mới
- `list_pages()` - Liệt kê tất cả tabs
- `select_page(pageIdx)` - Chọn tab theo index
- `close_page()` - Đóng tab hiện tại
- `wait_for(selectorOrTimeout)` - Chờ element hoặc timeout

#### Input Automation (7 tools)
- `click(uid)` - Click element
- `hover(uid)` - Hover element
- `fill(uid, value)` - Điền text vào input
- `fill_form(fieldValues)` - Điền form với object
- `drag(fromUid, toUid)` - Drag element
- `handle_dialog(action, promptText)` - Handle alerts/confirms
- `upload_file(uid, filePath)` - Upload file

#### Emulation (3 tools)
- `resize_page(width, height)` - Resize viewport
- `emulate_network(condition)` - Network throttling (Offline, Slow 3G, Fast 3G, Slow 4G, Fast 4G)
- `emulate_cpu(throttlingRate)` - CPU throttling (1-20x)

#### Debugging (4 tools)
- `take_screenshot(uid?, fullPage?, filePath?)` - Chụp screenshot
- `take_snapshot(verbose?)` - Lấy DOM snapshot (a11y tree)
- `evaluate_script(function)` - Execute JavaScript
- `list_console_messages()` - Xem console logs

#### Network (2 tools)
- `list_network_requests()` - Liệt kê network requests
- `get_network_request(reqid)` - Chi tiết một request

#### Performance (3 tools)
- `performance_start_trace()` - Bắt đầu trace
- `performance_stop_trace()` - Dừng trace
- `performance_analyze_insight()` - Phân tích insights

---

## 📋 UI/UX Workflow với MiniMax M2.1

### Phase 1: Analysis & Planning

**Step 1: Navigate & Capture**
```
1. navigate_page("http://localhost:3000/your-page")
2. take_screenshot(fullPage=true, filePath="/tmp/current-ui.png")
3. take_snapshot() // DOM structure
```

**Step 2: Analyze với understand_image**
```text
Prompt: "Analyze this UI screenshot (/tmp/current-ui.png). Identify:
- Layout structure (grid, flex, stacked)
- Component types (cards, forms, modals, navigation)
- Color scheme và contrast issues
- Spacing/typography problems
- Accessibility concerns (color contrast, focus states)
- Responsive behavior suggestions

Focus on: Shadcn UI patterns, Tailwind conventions."
```

**Step 3: Check Console/Network Errors**
```
1. list_console_messages()
2. list_network_requests()
3. evaluate_script(() => document.documentElement.outerHTML)
```

---

### Phase 2: Redesign Planning

**Component Tree Analysis**:
```
From snapshot + screenshot → Identify:
├── Navigation (header, sidebar)
├── Hero Section
├── Content Area
│   ├── Cards (blog, projects)
│   ├── Forms (search, filter)
│   └── Modals/Dialogs
└── Footer
```

**Responsive Breakpoints**:
```typescript
// Tailwind breakpoints
const breakpoints = {
  sm: '640px',   // Mobile landscape
  md: '768px',   // Tablet
  lg: '1024px',  // Desktop
  xl: '1280px',  // Large desktop
  '2xl': '1536px' // Extra large
}
```

**Design System Check**:
```text
"Based on screenshot analysis, suggest:
1. Shadcn UI components to use (Card, Button, Dialog, etc.)
2. Tailwind classes for consistent spacing (spacing scale)
3. Color adjustments for dark mode compatibility
4. Typography hierarchy (text-sm, text-lg, text-xl, etc.)
5. Motion/Animation with Framer Motion"
```

---

### Phase 3: Implementation

**File Structure**:
```
apps/web/src/components/
├── ui/                    # Shadcn (DON'T EDIT)
├── blog/
│   ├── post-card.tsx
│   ├── post-list.tsx
│   └── pagination.tsx
├── docs/
│   ├── sidebar-nav.tsx
│   └── toc.tsx
└── site/
    ├── site-header.tsx
    └── site-footer.tsx
```

**Code Patterns**:

**Client Component (interactive)**:
```tsx
'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'

export function PostCard({ post }: { post: BlogPost }) {
  const [isHovered, setIsHovered] = useState(false)
  
  return (
    <Card
      className="transition-all duration-200 hover:shadow-lg"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Content */}
    </Card>
  )
}
```

**Server Component (data fetch)**:
```tsx
import { getBlogPosts } from '@/services/blog-service'
import { PostCard } from './post-card'

export async function BlogList({ page = 1 }: { page?: number }) {
  const { data: posts } = await getBlogPosts('vi', 'published', { page })
  
  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {posts.map(post => (
        <PostCard key={post.id} post={post} />
      ))}
    </div>
  )
}
```

**Responsive Design**:
```tsx
// Mobile-first responsive classes
<div className="
  grid gap-4           // Mobile (default)
  md:grid-cols-2       // Tablet
  lg:grid-cols-3       // Desktop
  xl:gap-6             // Large screens
">
```

---

### Phase 4: Validation & Iteration

**Screenshot Comparison Workflow**:
```
1. make_file_changes()
2. navigate_page("http://localhost:3000/page")
3. take_screenshot(filePath="/tmp/updated-ui.png")
4. understand_image("Compare with /tmp/current-ui.png. What changed? Is it better?")
```

**Accessibility Check**:
```text
"Check this screenshot for:
- Color contrast ratios (WCAG AA/AAA)
- Focus indicators on interactive elements
- Touch target sizes (44x44px minimum)
- Semantic HTML structure
- ARIA labels missing"
```

**Performance Audit**:
```text
performance_start_trace()
wait_for(5000)  // Let page load
performance_stop_trace()
performance_analyze_insight()
```

---

## 🛠️ Common Tasks

### Task 1: Redesign Hero Section

**Prompt**:
```text
1. Navigate http://localhost:3000 và take screenshot
2. Analyze hero section: "Describe hero layout, identify issues with spacing, typography, visual hierarchy"
3. Suggest Shadcn + Tailwind redesign:
   - Use Card or custom component
   - Suggest heading sizes (text-3xl, text-4xl, text-5xl)
   - Suggest button styles (default, secondary, outline)
   - Suggest spacing (gap-4, gap-6, gap-8)
```

### Task 2: Fix Responsive Grid

**Prompt**:
```text
1. Navigate http://localhost:3000/blog và take full-page screenshot
2. Analyze grid: "How does the current grid behave on mobile? Tablet? Desktop?"
3. Suggest Tailwind grid fixes:
   - Mobile: grid-cols-1
   - Tablet: md:grid-cols-2
   - Desktop: lg:grid-cols-3
4. Verify with resize_page(375, 667) // Mobile size
5. Screenshot and confirm
```

### Task 3: Form Validation UI

**Prompt**:
```text
1. Navigate http://localhost:3000/admin/posts/new
2. Analyze form: "Identify form fields, validation states, error message placement"
3. Suggest improvements:
   - Use Shadcn Form components (Form, FormField, FormItem)
   - Add error: parameter in Zod schemas
   - Show inline validation feedback
4. Fill form test data và screenshot kết quả
```

### Task 4: Dark Mode Check

**Prompt**:
```text
1. Take screenshot of current page (assume light mode)
2. evaluate_script(() => document.documentElement.classList.contains('dark'))
3. If dark mode not active: navigate_page with ?theme=dark or trigger toggle
4. take_screenshot() for dark mode
5. analyze_image: "Compare light vs dark mode. Any contrast issues? Gray-on-gray? Text unreadable?"
```

---

## ⚠️ Limitations & Workarounds

### MiniMax M2.1 Vision Limits

**Issue**: M2.1 không có native vision

**Solution**: Sử dụng chain:
```
browser_action → take_screenshot → understand_image → analysis
```

**Best Practices**:
- Luôn capture trước/sau comparison
- Sử dụng `take_snapshot()` để có DOM structure (text-based, more accurate)
- Kết hợp console errors với visual analysis

### Image Path Handling

**Issue**: File paths với @ prefix từ MCP clients

**Solution**: `understand_image` tool automatically strips @ prefix

### Browser Startup

**Issue**: Chrome DevTools MCP starts browser on first tool use

**Solution**: Đợi browser ready trước khi take screenshot:
```text
navigate_page("http://localhost:3000")
wait_for("body")  // Wait for page load
take_screenshot()
```

---

## 🔗 Cross-References

**Related Skills**:
- [.github/skills/nextjs-app-router/SKILL.md](./nextjs-app-router/SKILL.md) - Next.js 16 patterns
- [.github/skills/tailwind/SKILL.md](./tailwind/SKILL.md) - Tailwind CSS patterns
- [.github/skills/i18n-next-intl-vi/SKILL.md](./i18n-next-intl-vi/SKILL.md) - Vietnamese UI
- [.github/skills/shadcn-ui/SKILL.md](./shadcn-ui/SKILL.md) - Shadcn patterns

**Documentation**:
- [app-router.instructions.md](../../.github/instructions/app-router.instructions.md) - Next.js 16 App Router
- [components.instructions.md](../../.github/instructions/components.instructions.md) - Component rules

---

## 📝 Example Prompts

**Full UI Redesign**:
```text
"Redesign the blog listing page:
1. Navigate http://localhost:3000/vi/blog
2. Take full-page screenshot
3. Analyze current UI: 'Describe layout, components, color scheme, spacing issues'
4. Suggest Shadcn + Tailwind redesign:
   - PostCard component với hover effects
   - Responsive grid (1→2→3 columns)
   - Pagination component
   - Tag filter UI
5. Make changes và screenshot để verify"
```

**Quick Visual Check**:
```text
"Check UI consistency:
1. Navigate http://localhost:3000
2. Take screenshot
3. analyze_image: 'List all UI inconsistencies (colors, spacing, typography)'
4. suggest_fixes: 'Specific Tailwind classes to fix each issue'"
```

**Form UX Improvement**:
```text
"Improve form UX:
1. Navigate http://localhost:3000/contact
2. Take screenshot
3. Analyze: 'What form validation exists? Any UX issues?'
4. Suggest: 'Add Zod validation, error messages, focus states'
5. Implement và verify với screenshot comparison"
```

---

## 🎨 UI Component Patterns

### Shadcn + Tailwind Combinations

**Card with hover effect**:
```tsx
<Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
  <CardHeader>
    <CardTitle>{title}</CardTitle>
  </CardHeader>
  <CardContent>{content}</CardContent>
</Card>
```

**Button variants**:
```tsx
<Button variant="default">Primary</Button>
<Button variant="secondary">Secondary</Button>
<Button variant="outline">Outline</Button>
<Button variant="ghost">Ghost</Button>
<Button variant="link">Link</Button>
```

**Responsive spacing**:
```tsx
<div className="p-4 md:p-6 lg:p-8">
  <div className="gap-4 md:gap-6 lg:gap-8">
```

**Dark mode**:
```tsx
<div className="bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
```

---

## 🚫 Boundaries

- **DO**: Focus UI/UX, responsive, accessibility, Shadcn/Tailwind patterns
- **DON'T**: Edit backend code, database migrations, authentication logic
- **DO**: Use `understand_image` + `take_screenshot` chain for visual analysis
- **DON'T**: Rely solely on code reading—always verify with browser inspection
