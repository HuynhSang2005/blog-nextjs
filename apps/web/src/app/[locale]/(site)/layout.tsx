import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export default async function SiteLayout(props: { children: React.ReactNode }) {
  const { children } = props

  return (
    <div>
      <div className="relative z-10 flex min-h-screen flex-col">
        <SiteHeader />

        <main className="flex-1">{children}</main>

        <SiteFooter />
      </div>

      <div className="fixed left-0 top-0 size-full bg-gradient-to-b from-[#a277ff] via-transparent to-transparent opacity-10" />
    </div>
  )
}
