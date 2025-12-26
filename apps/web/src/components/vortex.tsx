'use client'

import dynamic from 'next/dynamic'

export const Vortex = dynamic(() => import('./ui/vortex'), {
  ssr: false,
})
