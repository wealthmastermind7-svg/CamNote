# CamNote

## Overview
CamNote is a premium iOS document scanning app - a cleaner, more intuitive alternative to CamScanner. Every core action is reachable in 2 taps or less.

## Recent Changes
- December 18, 2025: Hardcoded Values Audit & Configuration Management
  - Created `client/constants/config.ts` for centralized configuration
  - Moved RevenueCat entitlement ID, prices, and URLs to config constants
  - Terms/Privacy URLs now use environment variables (EXPO_PUBLIC_TERMS_URL, EXPO_PUBLIC_PRIVACY_URL)
  - Added comments explaining fallback prices in PaywallScreen
  - Removed hardcoded "7-day" trial text (now uses REVENUECAT.FREE_TRIAL_DAYS constant)
  - All pricing now pulls from RevenueCat with proper fallbacks, zero hardcoding of actual prices
- December 17, 2025: RevenueCat SDK Integration & App Store Preparation
  - Integrated RevenueCat for subscription management
  - Added RevenueCatProvider context with entitlement checking
  - Updated PaywallScreen with real RevenueCat purchases
  - Added CustomerCenterScreen for subscription management
  - ToolsScreen now checks "CamNote Pro" entitlement for locked features
  - Updated app.json with Apple-compliant permission strings (Guideline 5.1.1)
- December 16, 2025: Initial frontend prototype completed
  - Implemented 3-tab navigation (Scan, Files, Tools)
  - Created glassmorphic UI with deep graphite base and emerald green accents
  - Built NOVA animated mascot system
  - Implemented paywall with free trial toggle
  - Added document editing and export screens

## Architecture

### Frontend (Expo/React Native)
- **Navigation**: React Navigation 7 with bottom tabs
- **Screens**: ScanScreen, FilesScreen, ToolsScreen, EditScreen, ExportScreen, PaywallScreen, CustomerCenterScreen, SettingsScreen, HelpScreen
- **Design System**: Glassmorphic UI with blur effects, emerald accent color
- **State**: RevenueCat for subscriptions, PostgreSQL for document storage
- **Subscriptions**: RevenueCat SDK (react-native-purchases)
- **Data Fetching**: React Query with mutations for CRUD operations

### Backend (Express)
- PostgreSQL database with Drizzle ORM
- RESTful API for documents:
  - GET /api/documents - list all documents
  - GET /api/documents/:id - get single document
  - POST /api/documents - create document
  - PUT /api/documents/:id - update document (validated)
  - DELETE /api/documents/:id - delete document

### Database Schema
- **documents** table: id (UUID), title, imageUri, pageCount, filter, createdAt, updatedAt

## Configuration & Constants
- **Config File**: `client/constants/config.ts` - Centralized app-wide configuration
  - RevenueCat entitlement ID, prices, trial duration
  - Legal URLs (Terms, Privacy)
  - Default values for documents and OCR
- **Environment Variables** (all prefixed with EXPO_PUBLIC_):
  - `EXPO_PUBLIC_REVENUECAT_API_KEY_IOS` (iOS API key from RevenueCat)
  - `EXPO_PUBLIC_REVENUECAT_API_KEY_ANDROID` (Android API key from RevenueCat)
  - `EXPO_PUBLIC_TERMS_URL` (Terms of use link, defaults to example.com)
  - `EXPO_PUBLIC_PRIVACY_URL` (Privacy policy link, defaults to example.com)
  - `EXPO_PUBLIC_DOMAIN` (API server domain, set by Replit automatically)

## RevenueCat Integration
- **Provider**: `client/lib/revenuecat.tsx` - Context/hooks for subscription state
- **Entitlement**: "CamNote Pro" (defined in config.ts)
- **Products**: Monthly and Yearly packages from RevenueCat offerings
- **Pricing**: Dynamic from RevenueCat with fallback values ($9.99 monthly, $39.99 annual)
- **Note**: Purchases only work in Expo Go on device, not on web
- **Setup**: Platform-specific initialization following Expo best practices

## Design Guidelines
See `design_guidelines.md` for complete visual specifications including:
- Color palette (#0A0C10 base, #22C55E accent)
- Typography (Zayan-inspired oversized headings)
- NOVA mascot specifications
- Glass panel styling

## Key Features
- One-tap document scanning
- Multi-page PDF creation
- Filters: Clean, B&W, Soft Color, Original
- Export to PDF, JPG (free) and Word, Excel, TXT (premium)
- OCR, signatures, password protection (premium)

## Monetization
- Free: Basic scanning, PDF/JPG export
- Premium: OCR, Word/Excel export, signatures, password protection
- Pricing: Monthly $9.99 (7-day trial), Annual $39.99
- Implementation: RevenueCat SDK with "CamNote Pro" entitlement

## App Store Compliance
- Permission strings updated per Guideline 5.1.1
- See `.local/APP_STORE_PREPARATION.md` for submission checklist
- Camera, Photo Library Read/Write permissions all have explicit descriptions

## Running the App
- Workflow: "Start dev servers" runs both Expo and Express
- Expo on port 8081, Express on port 5000
- Use Expo Go app to test on physical device (scan QR code)
- In-app purchases require Expo Go on device (not web)
