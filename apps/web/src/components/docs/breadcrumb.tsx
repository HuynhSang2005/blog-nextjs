import { ChevronRightIcon } from 'lucide-react'
import { Fragment } from 'react'

import { Link } from '@/navigation'

interface DocBreadcrumbProps {
  doc: {
    title: string
    href: string
  }

  messages: {
    docs: string
  }
}

export function DocBreadcrumb({ doc, messages }: DocBreadcrumbProps) {
  return (
    <div className="text-muted-foreground mb-4 flex items-center space-x-1 text-sm">
      <Link className="text-foreground hover:underline" href="/docs">
        {messages.docs}
      </Link>

      {doc.href !== '/docs' ? (
        <Fragment>
          <ChevronRightIcon className="size-4" />
          <span className="truncate">{doc.title}</span>
        </Fragment>
      ) : null}
    </div>
  )
}
