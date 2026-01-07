'use client'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Copy, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import type { SiteConfig } from '@/config/site'
import type { BlogConfig } from '@/types/blog'

interface SettingsClientProps {
  siteConfig: SiteConfig
  blogConfig: BlogConfig
}

export function SettingsClient({
  siteConfig,
  blogConfig,
}: SettingsClientProps) {
  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text)
    toast.success(`Đã sao chép ${label}`)
  }

  return (
    <div className="space-y-6">
      {/* Site Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin trang web</CardTitle>
          <CardDescription>
            Cấu hình cơ bản của trang web (được quản lý trong{' '}
            <code className="text-xs">config/site.ts</code>)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Tên trang web</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {siteConfig.name}
                </p>
                <Button
                  className="h-8 w-8"
                  onClick={() =>
                    copyToClipboard(siteConfig.name, 'tên trang web')
                  }
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">URL</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {siteConfig.url}
                </p>
                <Button
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(siteConfig.url || '', 'URL')}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div className="sm:col-span-2">
              <p className="text-sm font-medium">Mô tả</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {siteConfig.description.vi}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Phiên bản</p>
              <div className="mt-1">
                <Badge variant="secondary">
                  {siteConfig.app.latestVersion}
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Author Information */}
      <Card>
        <CardHeader>
          <CardTitle>Thông tin tác giả</CardTitle>
          <CardDescription>Thông tin về tác giả trang web</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Tên tác giả</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {siteConfig.author.name}
              </p>
            </div>

            <div>
              <p className="text-sm font-medium">Trang web</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="text-sm text-muted-foreground">
                  {siteConfig.author.site}
                </p>
                <a
                  className="text-primary hover:underline"
                  href={siteConfig.author.site}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Social Links */}
      <Card>
        <CardHeader>
          <CardTitle>Liên kết mạng xã hội</CardTitle>
          <CardDescription>
            Các liên kết mạng xã hội của trang web
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {Object.entries(siteConfig.links).map(([key, link]) => (
            <div className="flex items-center justify-between" key={key}>
              <div>
                <p className="text-sm font-medium">{link.label}</p>
                <p className="text-sm text-muted-foreground">{link.url}</p>
              </div>
              <div className="flex gap-2">
                <Button
                  className="h-8 w-8"
                  onClick={() => copyToClipboard(link.url, link.label)}
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
                <a
                  className="inline-flex h-8 w-8 items-center justify-center rounded-md hover:bg-accent hover:text-accent-foreground"
                  href={link.url}
                  rel="noopener noreferrer"
                  target="_blank"
                >
                  <ExternalLink className="h-4 w-4" />
                </a>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Blog Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình Blog</CardTitle>
          <CardDescription>
            Các tùy chọn cơ bản cho blog (được quản lý trong{' '}
            <code className="text-xs">config/blog.ts</code>)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <p className="text-sm font-medium">Số lượng tác giả</p>
            <p className="mt-1 text-sm text-muted-foreground">
              {blogConfig.authors.length} tác giả
            </p>
          </div>

          <Separator />

          <div>
            <p className="text-sm font-medium">RSS Feeds</p>
            <div className="mt-2 space-y-2">
              {blogConfig.rss.map(feed => (
                <div
                  className="flex items-center justify-between rounded-lg border p-3"
                  key={feed.file}
                >
                  <div>
                    <p className="text-sm font-medium">{feed.file}</p>
                    <p className="text-xs text-muted-foreground">
                      {feed.type} - {feed.contentType}
                    </p>
                  </div>
                  <Badge variant="secondary">{feed.type}</Badge>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SEO Information */}
      <Card>
        <CardHeader>
          <CardTitle>Cấu hình SEO</CardTitle>
          <CardDescription>Thông tin Open Graph và meta tags</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-medium">Open Graph Image</p>
              <div className="mt-1 flex items-center gap-2">
                <p className="truncate text-sm text-muted-foreground">
                  {siteConfig.og.image}
                </p>
                <Button
                  className="h-8 w-8 flex-shrink-0"
                  onClick={() =>
                    copyToClipboard(siteConfig.og.image, 'OG image URL')
                  }
                  size="icon"
                  variant="ghost"
                >
                  <Copy className="h-4 w-4" />
                </Button>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium">Kích thước OG Image</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {siteConfig.og.size.width} × {siteConfig.og.size.height}px
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Edit Instructions */}
      <Card className="border-dashed">
        <CardHeader>
          <CardTitle className="text-base">Cách chỉnh sửa cài đặt</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm text-muted-foreground">
          <p>
            Để thay đổi các cài đặt này, hãy chỉnh sửa các file cấu hình sau
            trong code:
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                apps/web/src/config/site.ts
              </code>{' '}
              - Thông tin trang web, tác giả, liên kết mạng xã hội
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                apps/web/src/config/blog.ts
              </code>{' '}
              - Cấu hình hiển thị blog
            </li>
            <li>
              <code className="rounded bg-muted px-1.5 py-0.5 text-xs">
                apps/web/src/i18n/locales/vi.json
              </code>{' '}
              - Các văn bản tiếng Việt
            </li>
          </ul>
          <p className="pt-2">
            Sau khi chỉnh sửa, commit changes và push lên repository để áp dụng.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
