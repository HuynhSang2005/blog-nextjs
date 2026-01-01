import { getTranslations } from 'next-intl/server'

interface AdminHelpPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminHelpPage({ params }: AdminHelpPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.help')

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <div className="space-y-2 text-sm">
        <p>{t('tips.locale_prefix', { locale })}</p>
        <p>{t('tips.auth')}</p>
        <p>{t('tips.support')}</p>
      </div>
    </div>
  )
}
