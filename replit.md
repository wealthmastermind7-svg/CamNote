# CamNote

## Overview
CamNote is a premium iOS document scanning app - a cleaner, more intuitive alternative to CamScanner. Every core action is reachable in 2 taps or less.

## Recent Changes
- December 16, 2025: Initial frontend prototype completed
  - Implemented 3-tab navigation (Scan, Files, Tools)
  - Created glassmorphic UI with deep graphite base and emerald green accents
  - Built NOVA animated mascot system
  - Implemented RevenueCat-style paywall with free trial toggle
  - Added document editing and export screens

## Architecture

### Frontend (Expo/React Native)
- **Navigation**: React Navigation 7 with bottom tabs
- **Screens**: ScanScreen, FilesScreen, ToolsScreen, EditScreen, ExportScreen, PaywallScreen
- **Design System**: Glassmorphic UI with blur effects, emerald accent color
- **State**: In-memory mock data (no persistent storage yet)

### Backend (Express)
- Currently serving static files only
- API endpoints to be implemented for document storage

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

## Running the App
- Workflow: "Start dev servers" runs both Expo and Express
- Expo on port 8081, Express on port 5000
- Use Expo Go app to test on physical device (scan QR code)
