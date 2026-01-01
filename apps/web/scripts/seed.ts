import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/lib/supabase/database.types'
import { readdir, readFile } from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

/**
 * Seed Script cho Database
 * Chạy với: bun run seed
 */

// Initialize Supabase client với service role key
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error('❌ Missing environment variables!')
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY')
  process.exit(1)
}

const supabase = createClient<Database>(supabaseUrl, supabaseServiceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
})

/**
 * Helper function để check xem record đã tồn tại chưa
 */
async function recordExists(
  table: string,
  column: string,
  value: string,
): Promise<boolean> {
  const { data, error } = await supabase.from(table as any).select('id').eq(column, value).single()

  return !error && !!data
}

/**
 * Seed Blog Tags
 */
async function seedBlogTags() {
  console.log('\n📚 Seeding blog tags...')

  const tags = [
    { name: 'Next.js', slug: 'nextjs', color: '#000000' },
    { name: 'React', slug: 'react', color: '#61DAFB' },
    { name: 'TypeScript', slug: 'typescript', color: '#3178C6' },
    { name: 'JavaScript', slug: 'javascript', color: '#F7DF1E' },
    { name: 'Tailwind CSS', slug: 'tailwindcss', color: '#06B6D4' },
    { name: 'Node.js', slug: 'nodejs', color: '#339933' },
    { name: 'Supabase', slug: 'supabase', color: '#3ECF8E' },
    { name: 'PostgreSQL', slug: 'postgresql', color: '#4169E1' },
    { name: 'Web Development', slug: 'web-development', color: '#FF6B6B' },
    { name: 'Frontend', slug: 'frontend', color: '#4ECDC4' },
    { name: 'Backend', slug: 'backend', color: '#95E1D3' },
    { name: 'Full Stack', slug: 'fullstack', color: '#F38181' },
    { name: 'Tutorial', slug: 'tutorial', color: '#AA96DA' },
    { name: 'Best Practices', slug: 'best-practices', color: '#FCBAD3' },
    { name: 'Performance', slug: 'performance', color: '#FFFFD2' },
  ]

  let inserted = 0
  let skipped = 0

  for (const tag of tags) {
    const exists = await recordExists('tags', 'slug', tag.slug)

    if (exists) {
      console.log(`   ⏭️  Tag "${tag.name}" already exists`)
      skipped++
      continue
    }

    const { error } = await supabase.from('tags').insert(tag)

    if (error) {
      console.error(`   ❌ Failed to insert tag "${tag.name}":`, error.message)
    } else {
      console.log(`   ✅ Inserted tag: ${tag.name}`)
      inserted++
    }
  }

  console.log(`\n✨ Blog tags seeding complete: ${inserted} inserted, ${skipped} skipped`)
}

/**
 * Seed Docs Topics
 */
async function seedDocsTopics() {
  console.log('\n📖 Seeding docs topics...')

  const topics = [
    {
      name: 'Next.js',
      slug: 'nextjs',
      description: 'Framework React cho production',
      order_index: 1,
    },
    {
      name: 'React',
      slug: 'react',
      description: 'Thư viện JavaScript để xây dựng UI',
      order_index: 2,
    },
    {
      name: 'TypeScript',
      slug: 'typescript',
      description: 'JavaScript với type system',
      order_index: 3,
    },
    {
      name: 'Tailwind CSS',
      slug: 'tailwindcss',
      description: 'Utility-first CSS framework',
      order_index: 4,
    },
    {
      name: 'Supabase',
      slug: 'supabase',
      description: 'Backend-as-a-Service platform',
      order_index: 5,
    },
    {
      name: 'Deployment',
      slug: 'deployment',
      description: 'Hướng dẫn deploy ứng dụng',
      order_index: 6,
    },
    {
      name: 'Best Practices',
      slug: 'best-practices',
      description: 'Các best practices khi phát triển web',
      order_index: 7,
    },
    {
      name: 'Troubleshooting',
      slug: 'troubleshooting',
      description: 'Giải quyết các vấn đề thường gặp',
      order_index: 8,
    },
  ]

  let inserted = 0
  let skipped = 0

  for (const topic of topics) {
    const exists = await recordExists('docs_topics', 'slug', topic.slug)

    if (exists) {
      console.log(`   ⏭️  Topic "${topic.name}" already exists`)
      skipped++
      continue
    }

    const { error } = await supabase.from('docs_topics').insert(topic)

    if (error) {
      console.error(`   ❌ Failed to insert topic "${topic.name}":`, error.message)
    } else {
      console.log(`   ✅ Inserted topic: ${topic.name}`)
      inserted++
    }
  }

  console.log(`\n✨ Docs topics seeding complete: ${inserted} inserted, ${skipped} skipped`)
}

interface MdxFrontmatter {
  title?: string
  description?: string
}

function parseMdxFrontmatter(raw: string): { frontmatter: MdxFrontmatter; body: string } {
  const match = raw.match(/^---\s*\n([\s\S]*?)\n---\s*\n?/)
  if (!match) {
    return { frontmatter: {}, body: raw }
  }

  const yaml = match[1] ?? ''
  const body = raw.slice(match[0].length)

  const frontmatter: MdxFrontmatter = {}
  for (const line of yaml.split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    const value = trimmed.slice(colonIndex + 1).trim()

    if (key === 'title') frontmatter.title = value
    if (key === 'description') frontmatter.description = value
  }

  return { frontmatter, body }
}

async function getAllMdxFiles(dirPath: string): Promise<string[]> {
  const entries = await readdir(dirPath, { withFileTypes: true })
  const results: string[] = []

  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name)
    if (entry.isDirectory()) {
      results.push(...(await getAllMdxFiles(fullPath)))
      continue
    }
    if (entry.isFile() && entry.name.endsWith('.mdx')) {
      results.push(fullPath)
    }
  }

  return results
}

function mdxFileToSlug(filePath: string, baseDir: string): string {
  const rel = path.relative(baseDir, filePath)
  const normalized = rel.split(path.sep).join('/')
  return normalized.replace(/\.mdx$/i, '')
}

function inferTitleFromBody(body: string): string | undefined {
  const match = body.match(/^#\s+(.+)$/m)
  return match?.[1]?.trim() || undefined
}

async function getDefaultDocsTopicId(): Promise<string> {
  const preferredSlug = 'nextjs'

  const preferred = await supabase
    .from('docs_topics')
    .select('id')
    .eq('slug', preferredSlug)
    .single()

  if (!preferred.error && preferred.data?.id) {
    return preferred.data.id
  }

  const fallback = await supabase
    .from('docs_topics')
    .select('id')
    .order('order_index', { ascending: true })
    .limit(1)
    .single()

  if (fallback.error || !fallback.data?.id) {
    throw new Error('Không tìm thấy docs topic để seed (docs_topics trống).')
  }

  return fallback.data.id
}

/**
 * Seed Docs từ các file MDX trong `apps/content/docs/vi`.
 * - Strips YAML frontmatter và lưu body vào `docs.content`
 * - Đảm bảo có doc `slug = "index"` cho route `/[locale]/docs`
 */
async function seedDocsFromMdx() {
  console.log('\n🧾 Seeding docs từ MDX files...')

  const scriptDir = path.dirname(fileURLToPath(import.meta.url))
  const docsDir = path.resolve(scriptDir, '../../content/docs/vi')

  const topicId = await getDefaultDocsTopicId()
  const mdxFiles = await getAllMdxFiles(docsDir)

  if (mdxFiles.length === 0) {
    console.log(`   ⏭️  Không tìm thấy file .mdx trong: ${docsDir}`)
    return
  }

  const rows: Database['public']['Tables']['docs']['Insert'][] = []

  for (const filePath of mdxFiles) {
    const raw = await readFile(filePath, 'utf8')
    const { frontmatter, body } = parseMdxFrontmatter(raw)

    const slug = mdxFileToSlug(filePath, docsDir)
    const title = frontmatter.title || inferTitleFromBody(body) || slug.split('/').pop() || slug

    rows.push({
      topic_id: topicId,
      locale: 'vi',
      slug,
      title,
      description: frontmatter.description || null,
      content: body.trim(),
      show_toc: true,
      order_index: 0,
      parent_id: null,
    })
  }

  // Sort: index trước, sau đó theo slug
  rows.sort((a, b) => {
    const aSlug = a.slug
    const bSlug = b.slug
    if (aSlug === 'index' && bSlug !== 'index') return -1
    if (bSlug === 'index' && aSlug !== 'index') return 1
    return aSlug.localeCompare(bSlug)
  })

  rows.forEach((row, i) => {
    row.order_index = i
  })

  const hasIndex = rows.some((r) => r.slug === 'index')
  if (!hasIndex) {
    console.warn('   ⚠️  Không có file index.mdx; `/vi/docs` sẽ fallback sang doc đầu tiên.')
  }

  const { error } = await supabase
    .from('docs')
    .upsert(rows, {
      onConflict: 'topic_id,slug,locale',
    })

  if (error) {
    console.error('   ❌ Failed to upsert docs:', error.message)
    throw new Error(error.message)
  }

  console.log(`   ✅ Upserted ${rows.length} docs (topic_id=${topicId})`)
}

/**
 * Seed Skills
 */
async function seedSkills() {
  console.log('\n💪 Seeding skills...')

  const skills = [
    // Frontend
    { name: 'Next.js', category: 'frontend', proficiency: 90, order_index: 1 },
    { name: 'React', category: 'frontend', proficiency: 95, order_index: 2 },
    { name: 'TypeScript', category: 'frontend', proficiency: 85, order_index: 3 },
    { name: 'Tailwind CSS', category: 'frontend', proficiency: 90, order_index: 4 },
    { name: 'HTML/CSS', category: 'frontend', proficiency: 95, order_index: 5 },
    { name: 'JavaScript', category: 'frontend', proficiency: 90, order_index: 6 },

    // Backend
    { name: 'Node.js', category: 'backend', proficiency: 85, order_index: 7 },
    { name: 'Express.js', category: 'backend', proficiency: 80, order_index: 8 },
    { name: 'Supabase', category: 'backend', proficiency: 85, order_index: 9 },
    { name: 'REST API', category: 'backend', proficiency: 90, order_index: 10 },
    { name: 'PostgreSQL', category: 'backend', proficiency: 80, order_index: 11 },
    { name: 'MongoDB', category: 'backend', proficiency: 75, order_index: 12 },
    { name: 'SQL', category: 'backend', proficiency: 85, order_index: 13 },

    // Tools
    { name: 'Git', category: 'tools', proficiency: 90, order_index: 14 },
    { name: 'Docker', category: 'tools', proficiency: 70, order_index: 15 },
    { name: 'Vercel', category: 'tools', proficiency: 85, order_index: 16 },
    { name: 'GitHub Actions', category: 'tools', proficiency: 75, order_index: 17 },
    { name: 'VS Code', category: 'tools', proficiency: 95, order_index: 18 },
    { name: 'Figma', category: 'tools', proficiency: 70, order_index: 19 },
    { name: 'Postman', category: 'tools', proficiency: 85, order_index: 20 },
  ]

  let inserted = 0
  let skipped = 0

  for (const skill of skills) {
    const { data: existingSkill } = await supabase
      .from('skills')
      .select('id')
      .eq('name', skill.name)
      .eq('category', skill.category)
      .single()

    if (existingSkill) {
      console.log(`   ⏭️  Skill "${skill.name}" already exists`)
      skipped++
      continue
    }

    const { error } = await supabase.from('skills').insert(skill)

    if (error) {
      console.error(`   ❌ Failed to insert skill "${skill.name}":`, error.message)
    } else {
      console.log(`   ✅ Inserted skill: ${skill.name} (${skill.proficiency}%)`)
      inserted++
    }
  }

  console.log(`\n✨ Skills seeding complete: ${inserted} inserted, ${skipped} skipped`)
}

/**
 * Seed About Sections
 */
async function seedAboutSections() {
  console.log('\n👤 Seeding about sections...')

  const sections = [
    {
      title: 'Giới thiệu',
      section_key: 'introduction',
      content: `Xin chào! Mình là Huỳnh Sang, một Full-stack Developer đam mê xây dựng các ứng dụng web hiện đại.

Với kinh nghiệm trong việc phát triển web sử dụng Next.js, React, và TypeScript, mình luôn tìm kiếm cơ hội để học hỏi và chia sẻ kiến thức với cộng đồng.

Blog này là nơi mình chia sẻ những kinh nghiệm, tutorials, và các best practices trong quá trình phát triển web.`,
      order_index: 1,
      locale: 'vi',
    },
    {
      title: 'Kinh nghiệm',
      section_key: 'experience',
      content: `## Full-stack Developer

Chuyên về phát triển ứng dụng web với:
- **Frontend**: Next.js, React, TypeScript, Tailwind CSS
- **Backend**: Node.js, Supabase, PostgreSQL
- **DevOps**: Vercel, Docker, GitHub Actions

## Dự án tiêu biểu

- Personal Blog & Portfolio (Next.js 16 + Supabase)
- E-commerce Platform (React + Node.js)
- Task Management System (Next.js + PostgreSQL)`,
      order_index: 2,
      locale: 'vi',
    },
    {
      title: 'Học vấn',
      section_key: 'education',
      content: `## Đại học

Đang theo học chuyên ngành Công nghệ Thông tin

## Học tập liên tục

- Online courses: Frontend Masters, Udemy
- Documentation: Next.js, React, TypeScript
- Community: Dev.to, Stack Overflow, Reddit`,
      order_index: 3,
      locale: 'vi',
    },
    {
      title: 'Liên hệ',
      section_key: 'contact',
      content: `## Kết nối với mình

- **Email**: contact@huynhsang.com
- **GitHub**: github.com/HuynhSang2005
- **LinkedIn**: linkedin.com/in/huynhsang

Luôn sẵn sàng kết nối và trao đổi về web development!`,
      order_index: 4,
      locale: 'vi',
    },
  ]

  let inserted = 0
  let skipped = 0

  for (const section of sections) {
    const exists = await recordExists('about_sections', 'section_key', section.section_key)

    if (exists) {
      console.log(`   ⏭️  About section "${section.title}" already exists`)
      skipped++
      continue
    }

    const { error } = await supabase.from('about_sections').insert(section)

    if (error) {
      console.error(`   ❌ Failed to insert section "${section.title}":`, error.message)
    } else {
      console.log(`   ✅ Inserted about section: ${section.title}`)
      inserted++
    }
  }

  console.log(`\n✨ About sections seeding complete: ${inserted} inserted, ${skipped} skipped`)
}

/**
 * Main seed function
 */
async function main() {
  console.log('🌱 Starting database seeding...\n')
  console.log('📍 Supabase URL:', supabaseUrl)

  try {
    // Test connection
    const { data, error } = await supabase.from('profiles').select('count').single()
    if (error && error.code !== 'PGRST116') {
      throw new Error(`Failed to connect to Supabase: ${error.message}`)
    }
    console.log('✅ Connected to Supabase successfully!\n')

    // Run seed functions
    await seedBlogTags()
    await seedDocsTopics()
    await seedDocsFromMdx()
    await seedSkills()
    await seedAboutSections()

    console.log('\n🎉 Database seeding completed successfully!')
  } catch (error) {
    console.error('\n❌ Error during seeding:', error)
    process.exit(1)
  }
}

// Run main function
main()
