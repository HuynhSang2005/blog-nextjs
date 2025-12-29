import { Metadata } from 'next'
import { SettingsClient } from './settings-client'
import { siteConfig } from '@/config/site'
import { blogConfig } from '@/config/blog'

export const metadata: Metadata = {
  title: 'Cài đặt',
  description: 'Quản lý cài đặt trang web',
}

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Cài đặt</h1>
        <p className="text-muted-foreground">
          Quản lý cài đặt và cấu hình trang web
        </p>
      </div>

      <SettingsClient siteConfig={siteConfig} blogConfig={blogConfig} />
    </div>
  )
}
