import { Metadata } from 'next'
import { getTranslations } from 'next-intl/server'
import { LoginForm } from './login-form'

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations('auth.login')
  
  return {
    title: t('title'),
    description: t('description'),
  }
}

export default async function LoginPage() {
  const t = await getTranslations('auth.login')
  
  return (
    <div className="container flex min-h-screen items-center justify-center py-10">
      <div className="w-full max-w-md space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold tracking-tight">
            {t('title')}
          </h1>
          <p className="text-muted-foreground">
            {t('description')}
          </p>
        </div>
        
        <LoginForm />
      </div>
    </div>
  )
}
