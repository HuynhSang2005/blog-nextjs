'use client'

import ReactBalancer, { type BalancerOwnProps } from 'react-wrap-balancer'

/**
 * Client wrapper cho react-wrap-balancer
 * Để tránh lỗi "useState only works in Client Components" khi dùng trong Server Components
 */
export function Balancer(props: BalancerOwnProps) {
  return <ReactBalancer {...props} />
}
