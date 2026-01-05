import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info } from 'lucide-react'
import { useTranslations } from 'next-intl'

interface MDXGuidelinesProps {
  i18nNamespace?: string
}

/**
 * Hiển thị quy chuẩn MDX cho admin editor.
 * Displays MDX guidelines for admin editors.
 */
export function MDXGuidelines({
  i18nNamespace = 'admin.docs',
}: MDXGuidelinesProps) {
  const t = useTranslations(i18nNamespace)

  return (
    <Alert className="mb-4">
      <Info className="h-4 w-4" />
      <AlertTitle>{t('mdx_guidelines.title')}</AlertTitle>
      <AlertDescription className="space-y-2 text-sm">
        <div>
          <strong>{t('mdx_guidelines.allowed_components')}:</strong>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            <li>
              <code className="text-xs">{'<Callout>'}</code> —{' '}
              {t('mdx_guidelines.callout_desc')}
            </li>
            <li>
              <code className="text-xs">{'<Steps>'}</code> —{' '}
              {t('mdx_guidelines.steps_desc')}
            </li>
            <li>
              <code className="text-xs">
                {'<Tabs>, <TabsList>, <TabsTrigger>, <TabsContent>'}
              </code>{' '}
              — {t('mdx_guidelines.tabs_desc')}
            </li>
            <li>
              <code className="text-xs">{'<Alert>, <Accordion>, <Image>'}</code>{' '}
              — {t('mdx_guidelines.other_components')}
            </li>
          </ul>
        </div>

        <div>
          <strong>{t('mdx_guidelines.restrictions')}:</strong>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            <li>
              ❌ Không dùng <code className="text-xs">import</code> /{' '}
              <code className="text-xs">export</code> top-level
            </li>
            <li>
              ❌ Components không trong whitelist sẽ không render (hoặc lỗi)
            </li>
          </ul>
        </div>

        <div>
          <strong>{t('mdx_guidelines.recommendations')}:</strong>
          <ul className="ml-4 mt-1 list-disc space-y-1">
            <li>
              ✅ Code blocks: dùng triple backticks với language tag (
              <code className="text-xs">```tsx</code>)
            </li>
            <li>✅ Headings: dùng markdown syntax (#, ##, ###)</li>
            <li>
              ✅ Links: dùng <code className="text-xs">[text](url)</code>
            </li>
          </ul>
        </div>
      </AlertDescription>
    </Alert>
  )
}
