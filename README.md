# Huỳnh Sang Blog

Blog cá nhân và portfolio được xây dựng bằng Next.js 16, React 19, Bunjs, TypeScript và Turborepo.

[![Next.js](https://img.shields.io/badge/Next.js-16.1.1-black?logo=next.js)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-19.2.3-blue?logo=react)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.9.3-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Bun](https://img.shields.io/badge/Bun-1.3.5-black?logo=bun)](https://bun.sh/)
[![Biome](https://img.shields.io/badge/Biome-latest-black?logo=biome)](https://biomejs.dev/)

## Tính năng chính

- **Next.js 16 App Router** - Kiến trúc React Server Components hiện đại
- **Supabase Database** - Quản lý blog posts, documentation và projects
- **Runtime MDX** - Render nội dung động với MDX
- **Cloudinary** - Tối ưu và quản lý hình ảnh
- **Internationalization** - Hỗ trợ tiếng Việt với next-intl
- **TypeScript** - Type safety toàn diện
- **Modern Tooling** - Bun package manager, Biome linting/formatting

## Bắt đầu nhanh

### Yêu cầu

- **Bun** >= 1.3.5 ([Cài đặt](https://bun.sh/))
- **Node.js** >= 20.0.0 (để tương thích)
- **Supabase** project ([Tạo mới](https://supabase.com/))
- **Cloudinary** account ([Tạo mới](https://cloudinary.com/))

### Cài đặt

```bash
# Clone repository
git clone https://github.com/HuynhSang2005/blog-nextjs.git
cd blog-nextjs

# Cài đặt dependencies
bun install

# Copy file môi trường
cp apps/web/.env.example apps/web/.env.local

# Cấu hình biến môi trường
# Sửa apps/web/.env.local với Supabase và Cloudinary credentials

# Chạy development server
bun dev
```

Truy cập [http://localhost:3000](http://localhost:3000) để xem blog.

## Cấu trúc dự án

```
blog-nextjs/
├── apps/
│   └── web/                  # Next.js 16 application
│       ├── src/
│       │   ├── app/          # App Router pages và layouts
│       │   ├── components/   # Reusable components
│       │   ├── config/       # Configuration files
│       │   ├── features/     # Feature-based modules
│       │   ├── hooks/        # Custom React hooks
│       │   ├── i18n/         # Internationalization
│       │   ├── lib/          # Utilities và core logic
│       │   ├── providers/    # React context providers
│       │   ├── schemas/      # Zod validation schemas
│       │   ├── services/     # Supabase service layer
│       │   ├── stores/       # Zustand state management
│       │   └── types/        # TypeScript type definitions
│       ├── supabase/         # Database migrations
│       └── tests/            # Playwright E2E tests
├── packages/                 # Shared packages (TypeScript configs)
├── docs/                     # Project documentation
└── supabase/                 # Supabase configuration
```

## Dev

### Các lệnh thường dùng

```bash
# Chạy development server
bun dev

# Build cho production
bun run build

# Chạy production server
bun run start

# Lint codebase
bun run lint

# Tự động sửa linting issues
bun run lint:fix

# Type check
bun run typecheck

# Chạy E2E tests
bun run test:e2e
```

### Code Style

Dự án sử dụng **Biome** cho linting và formatting:

```bash
# Kiểm tra issues
bun run lint

# Tự động sửa issues
bun run lint:fix
```

## Tech Stack

| Danh mục | Công nghệ |
|----------|-----------|
| Framework | Next.js 16.1.1 |
| Ngôn ngữ | TypeScript 5.9.3 |
| Runtime | React 19.2.3 |
| Package Manager | Bun 1.3.5 |
| Styling | Tailwind CSS 4 |
| Database | Supabase (PostgreSQL) |
| State Management | TanStack Query v5, Zustand v5 |
| Validation | Zod v4 |
| Internationalization | next-intl |
| Linting/Formatting | Biome |
| Testing | Playwright |

## Biến môi trường

Cấu hình trong `apps/web/.env.local`:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your-project-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME=your-cloud-name
NEXT_PUBLIC_CLOUDINARY_PRESET_NAME=your-preset-name

# Next.js
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Deployment

### Vercel (Khuyến nghị)

1. Push code lên GitHub
2. Import project trong [Vercel](https://vercel.com)
3. Cấu hình environment variables
4. Deploy

### Docker

```bash
docker build -t blog-nextjs .
docker run -p 3000:3000 blog-nextjs
```

---

Xây dựng với bằng Next.js, React, Bun và TypeScript
