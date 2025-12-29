'use client'

import ReactBalancer from 'react-wrap-balancer'

/**
 * Client wrapper cho react-wrap-balancer
 * Để tránh lỗi "useState only works in Client Components" khi dùng trong Server Components
 */
export function Balancer({ children }: { children: React.ReactNode }) {
  return <ReactBalancer>{children}</ReactBalancer>
}
