'use server'

import { revalidatePath } from 'next/cache'
import { createClient } from '@/lib/supabase/server'

/**
 * Server Action: Đăng nhập với email và password
 */
export async function signIn(email: string, password: string) {
	const supabase = await createClient()

	if (!email || !password) {
		return { error: 'Email và mật khẩu không được để trống' }
	}

	const { error } = await supabase.auth.signInWithPassword({
		email,
		password,
	})

	if (error) {
		if (error.message.includes('Invalid login credentials')) {
			return { error: 'Email hoặc mật khẩu không đúng' }
		}

		if (error.message.includes('Email not confirmed')) {
			return { error: 'Email chưa được xác nhận' }
		}

		if (error.message.includes('Too many requests')) {
			return { error: 'Quá nhiều lần thử, vui lòng thử lại sau' }
		}

		return { error: error.message }
	}

	revalidatePath('/', 'layout')

	return { error: '' }
}
