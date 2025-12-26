# Changelog

All notable changes to Huỳnh Sang Blog will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2025-12-26

### Added
- Comprehensive documentation suite in `docs/` directory (9 files, ~2,870 lines)
  - README.md - Project overview
  - setup.md - Installation and setup guide
  - architecture.md - Technical architecture documentation
  - development.md - Development workflow and best practices
  - deployment.md - Deployment guides (Vercel, Netlify, Docker, VPS)
  - contentlayer.md - Contentlayer configuration and MDX guide
  - app-router.md - Next.js 16 App Router patterns
  - turborepo.md - Turborepo monorepo configuration
  - contributing.md - Contribution guidelines

### Changed
- **MAJOR UPDATE**: Upgraded entire tech stack to latest versions
  - Next.js 16.0.10 → **16.1.1** (with Turbopack improvements)
  - Turborepo 2.6.3 → **2.7.2** (enhanced caching)
  - Bun 1.2.23 → **1.3.5** (faster package resolution)
  - Biome 2.3.8 → **2.3.10** (React 19 support)
  - next-intl 4.6.0 → **4.6.1** (improved i18n)
  - lucide-react 0.561.0 → **0.562.0**
  - esbuild 0.27.1 → **0.27.2**

- Updated Vietnamese translations for personal open-source blog context
  - Enhanced description emphasizing open-source nature
  - Updated featured cards with specific version numbers
  - Refined announcement and call-to-action messages

- Updated all documentation files with latest versions and configurations
  - Prerequisites now reflect Bun 1.3.5 requirement
  - Tech stack sections updated across all docs
  - Installation guides reflect current dependencies

### Removed
- Cleaned up template references and branding from previous iteration
- Removed `lib/opendocs/` → renamed to `lib/core/` (completed in previous session)

### Security
- Applied Next.js 16.1.1 which includes security patches for RSC vulnerabilities
  - CVE-2025-55184: React Server Components RCE
  - CVE-2025-55183: Bypass vulnerability
- All dependencies updated to latest secure versions

### Technical Details

#### Build Performance
- Build time: ~15 seconds (optimized with Turbopack)
- TypeScript compilation: ~7.6 seconds
- Generated 16 routes (9 documents, RSS feeds, sitemap)

#### Compatibility
- Node.js: >= 20.0.0 (Node 18 no longer supported per Next.js 16)
- TypeScript: 5.9.3 (minimum 5.1.0 required)
- React: 19.2.3 with Server Components
- Browsers: Chrome 111+, Edge 111+, Firefox 111+, Safari 16.4+

#### Monorepo Structure
```
blog-nextjs/
├── apps/
│   ├── content/      # MDX blog posts and docs (Vietnamese)
│   └── web/          # Next.js 16 application
├── packages/
│   ├── biome-config/      # Shared Biome config
│   └── typescript-config/ # Shared TS configs
└── docs/             # Comprehensive documentation (NEW)
```

#### Migration Notes

**For Next.js 16.1 Changes:**
- Turbopack is now default bundler (opt-out with `--webpack` if needed)
- Image optimization defaults changed (4-hour cache TTL)
- Separate output directories for dev/build enable concurrent execution
- No breaking changes detected in this project's codebase

**For Developers:**
- Run `bun install` to update dependencies
- Test with `bun dev` and `bun build`
- Verify types with `bun typecheck`
- Lint with `bun lint`

## [1.0.0] - 2025-12-26

### Initial Release

- Next.js 16 blog with App Router and React Server Components
- Contentlayer2 for type-safe MDX content management
- Turborepo monorepo setup
- Vietnamese-only internationalization (expandable)
- Dark mode support with next-themes
- Syntax highlighting with Shiki
- RSS feed generation (XML and JSON)
- Automatic sitemap
- SEO optimization with metadata
- Shadcn UI + Radix UI components
- Tailwind CSS 4 styling
- Biome for linting and formatting
- Husky + Commitlint for git hooks

---

## Version Comparison

| Package | Previous | Current | Change |
|---------|----------|---------|--------|
| Next.js | 16.0.10 | 16.1.1 | Minor update with security fixes |
| Turborepo | 2.6.3 | 2.7.2 | Enhanced caching, React 19 support |
| Bun | 1.2.23 | 1.3.5 | Performance improvements |
| Biome | 2.3.8 | 2.3.10 | React 19 compatibility |
| next-intl | 4.6.0 | 4.6.1 | Bug fixes |
| lucide-react | 0.561.0 | 0.562.0 | Icon updates |
| esbuild | 0.27.1 | 0.27.2 | Build optimizations |

## Links

- [GitHub Repository](https://github.com/HuynhSang2005/blog-nextjs)
- [Documentation](./docs/README.md)
- [Contributing Guide](./docs/contributing.md)
- [Next.js 16.1 Release Notes](https://nextjs.org/blog/next-16-1)
- [Turborepo 2.7 Changelog](https://turbo.build/repo/docs)
