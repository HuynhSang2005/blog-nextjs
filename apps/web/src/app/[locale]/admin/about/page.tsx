import { getTranslations } from 'next-intl/server'

import { createClient } from '@/lib/supabase/server'
import type { Database } from '@/lib/supabase/database.types'
import { AboutAdminClient } from '@/components/admin/about/about-admin-client'

type AboutSection = Database['public']['Tables']['about_sections']['Row']
type TimelineEvent = Database['public']['Tables']['timeline_events']['Row']
type Skill = Database['public']['Tables']['skills']['Row']

interface AdminAboutPageProps {
  params: Promise<{ locale: string }>
}

export default async function AdminAboutPage({ params }: AdminAboutPageProps) {
  const { locale } = await params
  const t = await getTranslations('admin.about')
  const supabase = await createClient()

  const [sectionsResult, timelineResult, skillsResult] = await Promise.all([
    supabase
      .from('about_sections')
      .select('*')
      .eq('locale', locale)
      .order('order_index'),
    supabase
      .from('timeline_events')
      .select('*')
      .eq('locale', locale)
      .order('start_date', { ascending: false }),
    supabase.from('skills').select('*').order('category').order('order_index'),
  ])

  if (sectionsResult.error) {
    console.error('Error fetching about_sections:', sectionsResult.error)
  }

  if (timelineResult.error) {
    console.error('Error fetching timeline_events:', timelineResult.error)
  }

  if (skillsResult.error) {
    console.error('Error fetching skills:', skillsResult.error)
  }

  const sections = (sectionsResult.data || []) as AboutSection[]
  const timeline = (timelineResult.data || []) as TimelineEvent[]
  const skills = (skillsResult.data || []) as Skill[]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground">{t('description')}</p>
      </div>

      <AboutAdminClient
        locale={locale}
        initialSections={sections}
        initialTimeline={timeline}
        initialSkills={skills}
      />
    </div>
  )
}
