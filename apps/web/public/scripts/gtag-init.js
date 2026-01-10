/**
 * Google Analytics 4 Initialization Script
 * 
 * This script initializes Google Analytics 4 with proper configuration.
 * 
 * Usage: Load via next/script with strategy="afterInteractive"
 * 
 * WARNING: Do not include this script directly in HTML.
 * Use the AnalyticsScripts component instead.
 */

(function() {
  // Prevent multiple initialization
  if (window.dataLayer) return;
  
  window.dataLayer = [];
  
  function gtag() {
    window.dataLayer.push(arguments);
  }
  
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    send_page_view: true,
    cookie_flags: 'SameSite=None;Secure'
  });
  
  // Signal that gtag is ready
  window.__gtagInitialized = true;
})();
