'use client'

import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { User } from '@supabase/supabase-js'
import { Button } from '@/components/ui/button'
import { signOut } from '@/app/actions/auth'

interface AuthStatusProps {
  user: User | null
}

/**
 * Component hiển thị trạng thái authentication
 * - Hiển thị email và nút đăng xuất khi đã đăng nhập
 * - Hiển thị nút đăng nhập khi chưa đăng nhập
 */
export function AuthStatus({ user }: AuthStatusProps) {
  const router = useRouter()
  const t = useTranslations('auth')

  const handleLogout = async () => {
    try {
      await signOut()
    } catch (error) {
      console.error('Logout error:', error)
      // Fallback: force redirect
      router.push('/')
      router.refresh()
    }
  }

  if (!user) {
    return (
      <Button
        variant="outline"
        onClick={() => router.push('/login')}
      >
        {t('login.title')}
      </Button>
    )
  }

  return (
    <div className="flex items-center gap-3">
      <span className="text-sm text-muted-foreground">
        {user.email}
      </span>
      <Button
        variant="outline"
        size="sm"
        onClick={handleLogout}
      >
        {t('logout')}
      </Button>
    </div>
  )
}
