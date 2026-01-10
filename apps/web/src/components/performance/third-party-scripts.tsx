/**
 * Third-Party Script Optimization Component
 *
 * This component provides a centralized way to manage third-party scripts
 * with optimal loading strategies to minimize impact on Core Web Vitals.
 *
 * Loading Strategies:
 * - beforeInteractive: Critical scripts (cookie consent, bot detectors)
 * - afterInteractive: Analytics, tag managers (default)
 * - lazyOnload: Low-priority scripts (chat, social widgets)
 * - worker: Heavy scripts via Partytown (experimental)
 */

'use client'

import Script from 'next/script'

/**
 * Example: Google Analytics / Google Tag Manager
 * Strategy: afterInteractive - loads after page becomes interactive
 * This is suitable for analytics as they don't block initial rendering
 */
export function AnalyticsScripts() {
  return (
    <>
      {/* Google Analytics 4 - afterInteractive */}
      <Script
        onLoad={() => {
          console.log('Google Analytics loaded')
        }}
        src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"
        strategy="afterInteractive"
      />
      {/* Google Analytics initialization - external script */}
      <Script src="/scripts/gtag-init.js" strategy="afterInteractive" />
    </>
  )
}

/**
 * Example: Chat widget (Intercom, Drift, etc.)
 * Strategy: lazyOnload - loads during browser idle time
 * Chat widgets are not critical for initial page load
 */
export function ChatWidgetScripts() {
  return (
    <Script
      onLoad={() => {
        console.log('Chat widget loaded')
      }}
      src="https://widget.intercom.io/widget/YOUR_APP_ID"
      strategy="lazyOnload"
    />
  )
}

/**
 * Example: Social Media Widgets (Twitter, Facebook, etc.)
 * Strategy: lazyOnload - loads during browser idle time
 * Social widgets are low priority and should not affect LCP
 */
export function SocialWidgetScripts() {
  return (
    <Script
      src="https://platform.twitter.com/widgets.js"
      strategy="lazyOnload"
    />
  )
}

/**
 * Example: Cookie Consent Manager
 * Strategy: beforeInteractive - must load before user interaction
 * Critical for GDPR compliance and user privacy
 */
export function CookieConsentScripts() {
  return (
    <Script
      src="/scripts/cookie-consent-init.js"
      strategy="beforeInteractive"
    />
  )
}

/**
 * Main Third-Party Scripts Component
 * Add/remove script components based on your needs
 */
export function ThirdPartyScripts() {
  return (
    <>
      {/* Uncomment scripts you need: */}
      {/* <AnalyticsScripts /> */}
      {/* <ChatWidgetScripts /> */}
      {/* <SocialWidgetScripts /> */}
      {/* <CookieConsentScripts /> */}
    </>
  )
}

export default ThirdPartyScripts
