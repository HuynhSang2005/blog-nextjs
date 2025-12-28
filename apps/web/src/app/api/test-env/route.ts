/**
 * Test route để kiểm tra environment variables
 * Visit: http://localhost:3000/api/test-env
 */

export async function GET() {
  // Check tất cả các biến môi trường
  const envCheck = {
    supabase: {
      url: {
        value: process.env.NEXT_PUBLIC_SUPABASE_URL || 'MISSING',
        isValid: !!process.env.NEXT_PUBLIC_SUPABASE_URL,
        format: process.env.NEXT_PUBLIC_SUPABASE_URL?.startsWith('https://') ? '✅ Đúng format' : '❌ Phải bắt đầu với https://',
      },
      anonKey: {
        exists: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        isValid: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.startsWith('eyJ') ? '✅ JWT format đúng' : '❌ JWT token phải bắt đầu với eyJ',
        length: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.length || 0,
      },
      serviceRoleKey: {
        exists: !!process.env.SUPABASE_SERVICE_ROLE_KEY,
        isValid: process.env.SUPABASE_SERVICE_ROLE_KEY?.startsWith('eyJ') ? '✅ JWT format đúng' : '❌ JWT token phải bắt đầu với eyJ',
        length: process.env.SUPABASE_SERVICE_ROLE_KEY?.length || 0,
      },
    },
    cloudinary: {
      cloudName: {
        value: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || 'MISSING',
        isValid: !!process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        format: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME ? '✅ Có giá trị' : '❌ Chưa set',
      },
      apiKey: {
        exists: !!process.env.CLOUDINARY_API_KEY,
        isValid: /^\d+$/.test(process.env.CLOUDINARY_API_KEY || '') ? '✅ Format đúng (chỉ số)' : '❌ API Key phải là số',
        length: process.env.CLOUDINARY_API_KEY?.length || 0,
      },
      apiSecret: {
        exists: !!process.env.CLOUDINARY_API_SECRET,
        isValid: (process.env.CLOUDINARY_API_SECRET?.length || 0) > 10 ? '✅ Có giá trị' : '❌ Secret quá ngắn',
        length: process.env.CLOUDINARY_API_SECRET?.length || 0,
      },
      preset: {
        value: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME || 'MISSING',
        isValid: !!process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME,
        format: process.env.NEXT_PUBLIC_CLOUDINARY_PRESET_NAME ? '✅ Có giá trị' : '❌ Chưa set preset',
      },
    },
    nextjs: {
      appUrl: {
        value: process.env.NEXT_PUBLIC_APP_URL || 'MISSING',
        isValid: process.env.NEXT_PUBLIC_APP_URL?.startsWith('http') ? '✅ Đúng format' : '❌ Phải bắt đầu với http',
      },
      debug: {
        value: process.env.DEBUG || 'false',
        isValid: ['true', 'false'].includes(process.env.DEBUG || '') ? '✅ Giá trị hợp lệ' : '⚠️ Nên là true hoặc false',
      },
    },
  }

  // Tính tổng số lỗi
  const errors: string[] = []
  
  if (!envCheck.supabase.url.isValid) errors.push('❌ NEXT_PUBLIC_SUPABASE_URL chưa set')
  if (!envCheck.supabase.url.format.includes('✅')) errors.push('❌ NEXT_PUBLIC_SUPABASE_URL sai format')
  if (!envCheck.supabase.anonKey.exists) errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY chưa set')
  if (!envCheck.supabase.anonKey.isValid.includes('✅')) errors.push('❌ NEXT_PUBLIC_SUPABASE_ANON_KEY sai format')
  if (!envCheck.supabase.serviceRoleKey.exists) errors.push('❌ SUPABASE_SERVICE_ROLE_KEY chưa set')
  if (!envCheck.supabase.serviceRoleKey.isValid.includes('✅')) errors.push('❌ SUPABASE_SERVICE_ROLE_KEY sai format')
  
  if (!envCheck.cloudinary.cloudName.isValid) errors.push('❌ NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME chưa set')
  if (!envCheck.cloudinary.apiKey.exists) errors.push('❌ CLOUDINARY_API_KEY chưa set')
  if (!envCheck.cloudinary.apiKey.isValid.includes('✅')) errors.push('❌ CLOUDINARY_API_KEY sai format')
  if (!envCheck.cloudinary.apiSecret.exists) errors.push('❌ CLOUDINARY_API_SECRET chưa set')
  if (!envCheck.cloudinary.preset.isValid) errors.push('❌ NEXT_PUBLIC_CLOUDINARY_PRESET_NAME chưa set')
  
  if (!envCheck.nextjs.appUrl.isValid) errors.push('❌ NEXT_PUBLIC_APP_URL chưa set hoặc sai format')

  const allValid = errors.length === 0

  return Response.json({
    status: allValid ? '✅ TẤT CẢ BIẾN MÔI TRƯỜNG HỢP LỆ' : '❌ CÓ LỖI TRONG CẤU HÌNH',
    timestamp: new Date().toISOString(),
    errors: errors.length > 0 ? errors : ['Không có lỗi'],
    details: envCheck,
    summary: {
      total: 10,
      valid: 10 - errors.length,
      invalid: errors.length,
    },
    nextSteps: allValid ? [
      '✅ Tiếp theo: Test kết nối Supabase tại /api/test-supabase',
      '✅ Tiếp theo: Test Cloudinary upload tại Cloudinary Console',
    ] : [
      '⚠️ Sửa các lỗi ở trên trước khi tiếp tục',
      '📖 Xem hướng dẫn tại: docs/dev-v1/environment-variables.md',
    ],
  }, {
    headers: {
      'Content-Type': 'application/json',
    },
  })
}
