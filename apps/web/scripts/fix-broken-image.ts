/**
 * Fix broken image for "Giới thiệu Next.js 16" post
 * This script removes the invalid cover_media_id so the post uses placeholder
 *
 * Run with: bun run scripts/fix-broken-image.ts
 */

import { createClient } from '@supabase/supabase-js'
import type { Database } from '../src/types/database'

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

async function fixBrokenImage() {
  console.log('\n🔧 Fixing broken image for "Giới thiệu Next.js 16"...\n')

  // Find the post
  const { data: post, error: findError } = await supabase
    .from('blog_posts')
    .select('id, title, slug, cover_media_id')
    .ilike('title', 'Giới thiệu Next.js 16')
    .single()

  if (findError || !post) {
    console.error('❌ Post not found!')
    console.error(findError)
    process.exit(1)
  }

  console.log(`📄 Found post: "${post.title}"`)
  console.log(`   ID: ${post.id}`)
  console.log(`   Slug: ${post.slug}`)
  console.log(`   Current cover_media_id: ${post.cover_media_id}`)

  if (!post.cover_media_id) {
    console.log('\n✅ Post already has no cover_media_id. Nothing to fix.')
    return
  }

  // Check the media record
  const { data: media, error: mediaError } = await supabase
    .from('media')
    .select('id, public_id')
    .eq('id', post.cover_media_id)
    .single()

  if (media) {
    console.log('\n🖼️  Media record:')
    console.log(`   ID: ${media.id}`)
    console.log(`   public_id: ${media.public_id}`)
    console.log('   ⚠️  This image URL is broken in Cloudinary')
  }

  // Remove cover_media_id so post uses placeholder
  console.log('\n🗑️  Removing cover_media_id to use placeholder...')

  const { error: updateError } = await supabase
    .from('blog_posts')
    .update({ cover_media_id: null })
    .eq('id', post.id)

  if (updateError) {
    console.error('❌ Failed to update post!')
    console.error(updateError)
    process.exit(1)
  }

  console.log('\n✅ Successfully fixed broken image!')
  console.log(
    '   The post will now show a placeholder instead of broken image.'
  )
  console.log(
    '\n💡 To add a new image later, upload to Cloudinary and update the media table.'
  )
}

fixBrokenImage().catch(err => {
  console.error('❌ Unexpected error:', err)
  process.exit(1)
})
