/**
 * Test route để kiểm tra kết nối Supabase
 * Visit: http://localhost:3000/api/test-supabase
 */

import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Test connection by querying database
    const { data, error } = await supabase
      .from('profiles')
      .select('count')
      .limit(1)

    if (error) {
      // If profiles table doesn't exist yet, that's expected
      if (
        error.message.includes('relation') ||
        error.message.includes('does not exist')
      ) {
        return NextResponse.json({
          status: '✅ KẾT NỐI THÀNH CÔNG',
          message: 'Supabase connection successful (tables not created yet)',
          connection: {
            url: process.env.NEXT_PUBLIC_SUPABASE_URL,
            hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
          },
          note: 'Tables will be created in next migration step',
        })
      }

      return NextResponse.json(
        {
          status: '❌ LỖI KẾT NỐI',
          message: 'Supabase connection failed',
          error: error.message,
        },
        { status: 500 }
      )
    }

    return NextResponse.json({
      status: '✅ KẾT NỐI THÀNH CÔNG',
      message: 'Supabase connection successful',
      connection: {
        url: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceRole: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
      },
      data: data,
    })
  } catch (error) {
    return NextResponse.json(
      {
        status: '❌ LỖI KHÔNG MÔN ĐOÁN',
        message: 'Unexpected error',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    )
  }
}
