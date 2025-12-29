/**
 * Color contrast utilities for WCAG AA compliance
 * ITU-R BT.709 luminance formula
 */

/**
 * Calculate relative luminance of a color
 * @param hexColor - Hex color string (e.g., '#FF0000' or 'FF0000')
 * @returns Luminance value between 0 (black) and 1 (white)
 */
export function getColorLuminance(hexColor: string): number {
  const hex = hexColor.replace('#', '')
  
  // Parse RGB values
  const r = parseInt(hex.substr(0, 2), 16) / 255
  const g = parseInt(hex.substr(2, 2), 16) / 255
  const b = parseInt(hex.substr(4, 2), 16) / 255
  
  // Apply sRGB gamma correction
  const rLinear = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
  const gLinear = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
  const bLinear = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)
  
  // ITU-R BT.709 coefficients
  return 0.2126 * rLinear + 0.7152 * gLinear + 0.0722 * bLinear
}

/**
 * Determine if text should be light or dark based on background color
 * @param hexColor - Background hex color
 * @returns 'light' or 'dark' for text color
 */
export function getContrastColor(hexColor: string): 'light' | 'dark' {
  const luminance = getColorLuminance(hexColor)
  
  // Threshold at 0.5 (mid-point)
  // Higher luminance = lighter background = needs dark text
  return luminance > 0.5 ? 'dark' : 'light'
}

/**
 * Get text color class for Tailwind based on background
 * @param hexColor - Background hex color
 * @returns Tailwind text color class
 */
export function getContrastTextClass(hexColor: string): string {
  const contrastType = getContrastColor(hexColor)
  
  return contrastType === 'light'
    ? 'text-white dark:text-white'
    : 'text-gray-900 dark:text-gray-100'
}

/**
 * Calculate contrast ratio between two colors
 * @param color1 - First hex color
 * @param color2 - Second hex color
 * @returns Contrast ratio (1-21)
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getColorLuminance(color1)
  const lum2 = getColorLuminance(color2)
  
  const lighter = Math.max(lum1, lum2)
  const darker = Math.min(lum1, lum2)
  
  return (lighter + 0.05) / (darker + 0.05)
}

/**
 * Check if contrast ratio meets WCAG AA standard (4.5:1 for normal text)
 * @param backgroundColor - Background hex color
 * @param textColor - Text hex color
 * @returns True if meets WCAG AA
 */
export function meetsWCAGAA(backgroundColor: string, textColor: string): boolean {
  const ratio = getContrastRatio(backgroundColor, textColor)
  return ratio >= 4.5
}

/**
 * Check if contrast ratio meets WCAG AAA standard (7:1 for normal text)
 * @param backgroundColor - Background hex color
 * @param textColor - Text hex color
 * @returns True if meets WCAG AAA
 */
export function meetsWCAGAAA(backgroundColor: string, textColor: string): boolean {
  const ratio = getContrastRatio(backgroundColor, textColor)
  return ratio >= 7
}
