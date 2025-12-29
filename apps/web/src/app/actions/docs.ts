'use server'

import { revalidatePath } from 'next/cache'
import {
  createDoc as createDocQuery,
  updateDoc as updateDocQuery,
  deleteDoc as deleteDocQuery,
} from '@/lib/supabase/queries/docs'
import type { TablesInsert, TablesUpdate } from '@/lib/supabase/database.types'

export async function createDoc(docData: TablesInsert<'docs'>) {
  try {
    const result = await createDocQuery(docData)

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    const locale = docData.locale || 'vi'
    // Revalidate admin list and public docs pages theo locale
    revalidatePath(`/${locale}/admin/docs`)
    revalidatePath(`/${locale}/docs`)

    return { success: true, data: result.data }
  } catch (error) {
    console.error('[createDoc] Unexpected error:', error)
    return { 
      success: false, 
      error: 'Có lỗi xảy ra khi tạo tài liệu' 
    }
  }
}

export async function updateDoc(id: string, updates: TablesUpdate<'docs'>) {
  try {
    const result = await updateDocQuery(id, updates)

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    const locale = updates.locale || 'vi'
    // Revalidate admin list and public docs pages theo locale
    revalidatePath(`/${locale}/admin/docs`)
    revalidatePath(`/${locale}/admin/docs/${id}`)
    revalidatePath(`/${locale}/docs`)

    return { success: true, data: result.data }
  } catch (error) {
    console.error('[updateDoc] Unexpected error:', error)
    return { 
      success: false, 
      error: 'Có lỗi xảy ra khi cập nhật tài liệu' 
    }
  }
}

export async function deleteDoc(id: string, locale: string = 'vi') {
  try {
    const result = await deleteDocQuery(id)

    if (result.error) {
      return { success: false, error: result.error.message }
    }

    // Revalidate admin list and public docs pages theo locale
    revalidatePath(`/${locale}/admin/docs`)
    revalidatePath(`/${locale}/docs`)

    return { success: true }
  } catch (error) {
    console.error('[deleteDoc] Unexpected error:', error)
    return { 
      success: false, 
      error: 'Có lỗi xảy ra khi xóa tài liệu' 
    }
  }
}
