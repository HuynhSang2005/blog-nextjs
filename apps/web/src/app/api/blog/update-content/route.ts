import { type NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { id, content } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Missing post ID' }, { status: 400 })
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('blog_posts')
      .update({ content })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error updating post:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
