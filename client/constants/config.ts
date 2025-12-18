/**
 * Application Configuration Constants
 * These values are used throughout the app and should be centralized for easy updates.
 */

// RevenueCat Configuration
export const REVENUECAT = {
  ENTITLEMENT_ID: "CamNote Pro",
  /** Fallback monthly price if RevenueCat data is unavailable */
  FALLBACK_MONTHLY_PRICE: "$9.99",
  /** Fallback annual price if RevenueCat data is unavailable */
  FALLBACK_ANNUAL_PRICE: "$39.99",
  /** Fallback annual price calculation (monthly × 12) for UI display */
  FALLBACK_ANNUAL_MONTHLY_CALC: "$119.88",
  /** Free trial duration in days */
  FREE_TRIAL_DAYS: 7,
} as const;

// Legal/Support URLs - loaded from environment variables
export const LEGAL_URLS = {
  TERMS: process.env.EXPO_PUBLIC_TERMS_URL || "https://example.com/terms",
  PRIVACY: process.env.EXPO_PUBLIC_PRIVACY_URL || "https://example.com/privacy",
  APPLE_SUBSCRIPTIONS: "https://apps.apple.com/account/subscriptions",
  GOOGLE_SUBSCRIPTIONS: "https://play.google.com/store/account/subscriptions",
  APPLE_PROBLEM_REPORT: "https://reportaproblem.apple.com/",
  GOOGLE_ORDER_HISTORY: "https://play.google.com/store/account/orderhistory",
} as const;

// Default Values
export const DEFAULTS = {
  DOCUMENT_TITLE: "Untitled Document",
  MERGED_DOCUMENT_TITLE: "Merged Document",
  PROTECTED_DOCUMENT_TITLE: "Protected Document",
  DEFAULT_FILTER: "clean",
} as const;

// OCR Configuration
export const OCR = {
  DEFAULT_LANGUAGE: "eng",
} as const;
