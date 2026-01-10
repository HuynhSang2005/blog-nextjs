/**
 * Cookie Consent Initialization Script
 * 
 * This script initializes cookie consent management.
 * In production, replace with a proper library like:
 * - cookieconsent (Osano)
 * - OneTrust
 * - Cookiebot
 * 
 * Usage: Load via next/script with strategy="beforeInteractive"
 * 
 * WARNING: Do not include this script directly in HTML.
 * Use the CookieConsentScripts component instead.
 */

(function() {
  // Check if consent was already given
  if (document.cookie.split(';').some(function(c) {
    return c.trim().indexOf('cookie_consent=') === 0;
  })) {
    console.log('Cookie consent already given');
    return;
  }
  
  // Initialize consent tracking
  window.__cookieConsentGiven = false;
  
  console.log('Cookie consent initialized');
  // In production, show consent banner here:
  // showCookieBanner();
})();
