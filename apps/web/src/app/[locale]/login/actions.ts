'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: Đăng nhập với email và password
 * @param email - Email đăng nhập
 * @param password - Mật khẩu
 * @returns Object với error nếu có lỗi
 */
export async function signIn(email: string, password: string) {
  const supabase = await createClient()

  // Validate input
  if (!email || !password) {
    return { error: 'Email và mật khẩu không được để trống' }
  }

  // Attempt sign in
  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    // Map Supabase errors to Vietnamese messages
    if (error.message.includes('Invalid login credentials')) {
      return { error: 'Email hoặc mật khẩu không đúng' }
    }
    
    if (error.message.includes('Email not confirmed')) {
      return { error: 'Email chưa được xác nhận' }
    }

    if (error.message.includes('Too many requests')) {
      return { error: 'Quá nhiều lần thử, vui lòng thử lại sau' }
    }

    // Generic error
    return { error: error.message }
  }

  // Get admin path from environment
  const adminPath = process.env.NEXT_PUBLIC_ADMIN_PATH || '/admin'

  // Revalidate cached pages
  revalidatePath('/', 'layout')

  // Redirect to admin
  redirect(adminPath)
}
