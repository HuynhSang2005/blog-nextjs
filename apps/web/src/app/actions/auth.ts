'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: Đăng xuất
 * Clears session và redirects về homepage
 */
export async function signOut() {
  const supabase = await createClient()

  // Sign out from Supabase (clears auth cookies)
  await supabase.auth.signOut()

  // Revalidate all cached pages
  revalidatePath('/', 'layout')

  // Redirect to homepage
  redirect('/')
}
