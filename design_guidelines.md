# CamNote Design Guidelines

## Visual Design System

### Color Palette
- **Base**: Deep graphite `#0A0C10`
- **Accent**: Emerald green `#22C55E`
- **Glass panels**: White at 18–22% opacity with blur radius 35, soft inner shadow
- **Visual effects**: Dramatic rim lighting on cards, subtle film grain overlay
- **Design philosophy**: High-contrast minimalism

### Typography
- **Font**: Zayan Luxury Font (https://pluvix.com/zayan-luxury-font/)
- **Hierarchy**:
  - Key numbers/metrics: 64–96px
  - Section headers: 32–40px
  - Oversized headings only
  - Bold, premium aesthetic

### Visual Feedback
- **Haptics**: 
  - Light haptic on splash screen entry
  - Strong shutter haptic on camera capture
- **Animations**: Smooth, premium feel with glass morphism effects

## Navigation Architecture

### Bottom Tab Navigation (3 Tabs Only)
1. **Scan** - Primary camera/scanning interface
2. **Files** - Document library and management
3. **Tools** - Utilities and settings

**Critical Rule**: All core actions must be reachable in **2 taps or less**. No hamburger menus. No tool walls. Contextual tools only.

## Mascot System (NOVA)

### Visual Design
- Floating glowing paper-orb
- Soft eye-like highlights
- Calm emotional expressions
- Gentle idle breathing animation

### Placement
- Appears on **every screen**
- Serves as app icon, logo, splash screen, and favicon
- Provides 1-line contextual guidance:
  - "Let's scan this."
  - "Tap here to export."

## Screen Specifications

### Splash Screen
- NOVA mascot floats in
- Light haptic feedback on entry
- Clean, minimal introduction

### Scan Screen
- Live camera feed
- Auto capture with edge detection
- Strong shutter haptic on capture
- One-tap primary action

### Edit Screen
- Glass tool rail
- Contextual tools only (no overwhelming options)
- Filters: Clean, B&W, Soft Color, Original
- Multi-page PDF support
- Perspective correction controls

### Export Screen
- Format selection cards (PDF, JPG unlocked)
- Premium actions blurred with lock indicators:
  - Word/Excel/TXT conversion
  - OCR text extraction
  - Password-protected PDFs
  - Signature tool
- Share to email, cloud, contacts

### Paywall (RevenueCat Style)
- **Full glass modal** overlay
- **"Not Sure? Enable Free Trial" toggle** prominently displayed
- Pricing cards:
  - **Monthly**: $9.99 with 7-day trial
  - **Annual**: $39.99 with discount badge showing savings
- Clear feature comparison showing locked premium features
- Glassmorphic design matching app aesthetic
- RevenueCat checkout integration

### Files Screen
- Document library grid/list view
- Glass cards for each document
- Quick actions accessible
- NOVA provides contextual guidance

### Tools Screen
- Settings and utilities
- Glass panel design consistency
- Organized, minimal options

## Component Design

### Glass Panels
- White at 18–22% opacity
- Blur radius: 35
- Soft inner shadow
- Dramatic rim lighting
- Maintains readability over dark graphite base

### Cards
- Glassmorphic treatment
- Rim lighting for depth
- Subtle film grain overlay
- Premium, tactile feel

### Tool Rails
- Contextual only (appear based on current action)
- Glassmorphic background
- Clear, large touch targets
- Emerald green accent for active states

## Feature Locks & Monetization

### Free Features
- Basic scanning
- PDF and JPG export
- Basic filters and editing

### Premium Features (Locked)
- OCR text extraction
- Word/Excel export
- Password-protected PDFs
- Signature tool

### Lock Indicators
- Blurred glass overlay on premium features
- Lock icon with emerald accent
- Tap to trigger paywall modal

## Onboarding
- Looping preview videos showing core features
- NOVA mascot introduction
- Demonstrates one-tap workflow
- Glass UI showcased throughout

## iOS-First Considerations
- iOS-only configuration
- Native iOS design patterns
- Smooth animations with react-native-reanimated
- Haptic feedback integration
- Camera permissions handled gracefully

## Assets Required
- **NOVA mascot** in various states (idle, guiding, celebrating)
- **App icon** featuring NOVA
- **Splash screen** with NOVA animation
- **Onboarding videos** demonstrating features
- **Premium feature preview images** (blurred for locked state)