/**
 * Web Vitals Monitoring Component
 * Tracks and reports Core Web Vitals metrics to console/analytics
 *
 * Metrics tracked:
 * - LCP (Largest Contentful Paint): Loading performance (target: ≤2.5s)
 * - INP (Interaction to Next Paint): Responsiveness (target: ≤200ms)
 * - CLS (Cumulative Layout Shift): Visual stability (target: <0.1)
 * - FCP (First Contentful Paint): Initial load (target: ≤1.8s)
 * - TTFB (Time to First Byte): Server response (target: <600ms)
 */

'use client'

import { useEffect, useRef } from 'react'

type Metric = {
  name: string
  delta: number
  id: string
  value: number
}

/**
 * Check if metric value is in "good" range
 */
function isGoodValue(value: number, metric: string): boolean {
  switch (metric) {
    case 'LCP':
      return value <= 2500
    case 'INP':
      return value <= 200
    case 'CLS':
      return value < 0.1
    case 'FCP':
      return value <= 1800
    case 'TTFB':
      return value < 600
    default:
      return true
  }
}

/**
 * Report metric to console
 */
function reportMetric(metric: Metric) {
  const status = isGoodValue(metric.value, metric.name)
    ? '✅ GOOD'
    : '⚠️ NEEDS IMPROVEMENT'
  const color = isGoodValue(metric.value, metric.name) ? '#10b981' : '#f59e0b'

  console.log(
    `%c${metric.name}: ${metric.value.toFixed(2)}ms ${status}`,
    `color: ${color}; font-weight: bold`,
    { delta: metric.delta, id: metric.id }
  )
}

/**
 * Hook to initialize Web Vitals monitoring
 */
export function useWebVitals() {
  const initialized = useRef(false)

  useEffect(() => {
    if (initialized.current) return
    initialized.current = true

    const initWebVitals = async () => {
      try {
        const webVitals = await import('web-vitals')

        // Report CLS
        webVitals.onCLS(reportMetric)

        // Report INP
        webVitals.onINP(reportMetric)

        // Report LCP
        webVitals.onLCP(reportMetric)

        // Report FCP
        webVitals.onFCP(reportMetric)

        // Report TTFB
        webVitals.onTTFB(reportMetric)
      } catch (error) {
        console.warn('Web Vitals not available:', error)
      }
    }

    initWebVitals()

    // Cleanup function
    return () => {
      // Web vitals doesn't need explicit cleanup
    }
  }, [])
}

/**
 * Web Vitals Report Component
 * Shows current metrics in development mode
 */
export function WebVitalsReport() {
  useWebVitals()

  return null // Silent component, logs to console
}

export default WebVitalsReport
