# Brand Guidelines
## PropManage — AI-Powered Global Property Management Platform

**Document ID:** PM-BRAND-001  
**Version:** 1.0  
**Date:** March 2026

---

## 1. Brand Foundation

### 1.1 Brand Essence
**PropManage gives property owners the clarity and confidence of a professional operation — without the overhead.**

### 1.2 Brand Promise
Every landlord, regardless of portfolio size, deserves to know exactly what they own, who owes them what, and what's coming next.

### 1.3 Brand Personality
| Trait | What It Means in Practice |
|---|---|
| **Trustworthy** | Data is private, never shared, never monetized. The app is always honest about what it knows and doesn't. |
| **Intelligent** | The AI agent speaks like a knowledgeable colleague, not a chatbot. It answers specifically, not generically. |
| **Calm** | The interface doesn't alarm or overwhelm. Even overdue rents are presented as actionable, not urgent crises. |
| **Grounded** | Language is practical and real-world. We talk about actual properties, actual tenants, actual money. |
| **Globally aware** | We respect that property ownership looks different in Chennai, Dubai, and London. We adapt, not impose. |

### 1.4 Tagline Options
- **Primary:** "Your properties. Always in order."
- **Secondary:** "Every property owner's intelligent co-pilot."
- **Short form:** "Property intelligence, finally."

---

## 2. Logo

### 2.1 Logo Concept
The PropManage logo uses a simplified architectural mark — a clean building outline with a subtle document-fold element integrated into the structure. This communicates "property" and "document management" in one mark.

### 2.2 Logo Lockup
```
[Building/Document Icon]  PropManage
```

The wordmark uses a modern geometric sans-serif (Satoshi or Inter) with slightly tightened letter spacing. The "P" in PropManage is the same weight as the icon.

### 2.3 Logo Variations
- **Full lockup** — Icon + Wordmark (horizontal) — use for onboarding, marketing
- **Icon only** — App icon, favicon, notification badge
- **Wordmark only** — Document headers, legal pages
- **Monochrome** — White on dark, black on light — for print/PDF exports

### 2.4 Logo Clear Space
Minimum clear space = height of the letter "P" in the wordmark on all four sides.

### 2.5 Logo Don'ts
- Do not rotate the logo
- Do not stretch or compress
- Do not apply drop shadows or bevels
- Do not place on a busy background without a container
- Do not change the font
- Do not use the icon at sizes smaller than 24×24px

---

## 3. Color System

### 3.1 Primary Palette

| Color | Name | Hex | RGB | Usage |
|---|---|---|---|---|
| ![#1B4FD8](https://via.placeholder.com/20/1B4FD8) | **Propblue** | `#1B4FD8` | 27, 79, 216 | Primary CTA, links, active states |
| ![#0F2D7F](https://via.placeholder.com/20/0F2D7F) | **Propblue Dark** | `#0F2D7F` | 15, 45, 127 | Headers, pressed states |
| ![#E8EDFF](https://via.placeholder.com/20/E8EDFF) | **Propblue Light** | `#E8EDFF` | 232, 237, 255 | Backgrounds, tag chips, highlights |

### 3.2 Neutral Palette

| Color | Name | Hex | Usage |
|---|---|---|---|
| `#0D0D0D` | **Ink** | Almost black | Body text, headings |
| `#2E2E2E` | **Ink Medium** | — | Secondary text |
| `#6B7280` | **Ink Light** | — | Captions, metadata, placeholder text |
| `#E5E7EB` | **Border** | — | Card borders, dividers |
| `#F9FAFB` | **Surface** | — | Card backgrounds, screen backgrounds |
| `#FFFFFF` | **White** | — | Primary background |

### 3.3 Semantic Colors (Status Indicators)

| Status | Color Name | Hex | Usage |
|---|---|---|---|
| Paid / Occupied | **Sage** | `#16A34A` | Positive status badges |
| Overdue / Warning | **Amber** | `#D97706` | Warnings, overdue flags |
| Critical / Expired | **Crimson** | `#DC2626` | Errors, expired alerts |
| Pending / Neutral | **Slate** | `#64748B` | Neutral/pending states |
| Vacant | **Violet** | `#7C3AED` | Vacancy indicators |

### 3.4 Color Usage Rules
- **Propblue** is the only color used for primary CTAs. Never mix CTA colors.
- **Semantic colors** are used ONLY for status indicators — never for decorative purposes.
- Background colors: use Surface (`#F9FAFB`) for app background, White for cards.
- Never put blue text on a blue background.
- Maintain WCAG AA contrast ratio (4.5:1) minimum for all text.

---

## 4. Typography

### 4.1 Typefaces

| Role | Font | Fallback |
|---|---|---|
| **Display / Headings** | Satoshi | Inter, system-ui |
| **Body / UI** | Inter | -apple-system, Segoe UI |
| **Monospace (data, code)** | JetBrains Mono | Courier New |

Both Satoshi and Inter are available via Google Fonts. Use variable font versions where possible.

### 4.2 Type Scale (Mobile)

| Name | Size | Weight | Line Height | Usage |
|---|---|---|---|---|
| Display | 28sp | 700 | 34sp | Screen titles (onboarding) |
| H1 | 24sp | 700 | 30sp | Page headers |
| H2 | 20sp | 600 | 26sp | Section headers |
| H3 | 17sp | 600 | 22sp | Card titles |
| Body Large | 16sp | 400 | 24sp | Primary body text |
| Body | 15sp | 400 | 22sp | Secondary body text |
| Caption | 13sp | 400 | 18sp | Metadata, timestamps |
| Label | 12sp | 500 | 16sp | Tag chips, badges |
| Overline | 11sp | 600 | 14sp | Category labels (ALL CAPS) |

### 4.3 Typography Rules
- Never go below 13sp for any visible text (accessibility)
- Body text is always Ink (`#0D0D0D`) or Ink Medium on light backgrounds
- Heading color: always Ink — never Propblue for headings
- Use font weight to create hierarchy, not size alone
- Avoid underlines for non-link text

---

## 5. Iconography

### 5.1 Icon Library
Use **Lucide Icons** as the primary icon set. It is clean, consistent, and has excellent React Native support via `lucide-react-native`.

### 5.2 Icon Usage Rules
- Icon size: 20px (inline), 24px (navigation), 32px (feature/empty state)
- Stroke width: 1.5px consistently
- Color: always match the text or status color — never standalone decorative colors
- Never use filled and outlined icons together in the same component
- Tab bar: use filled icons for active state, outline for inactive

### 5.3 Key Icon Mappings

| Feature | Icon (Lucide) |
|---|---|
| Properties | `Building2` |
| Documents | `FileText` |
| Tenants | `Users` |
| Payments / Rent | `Banknote` |
| Maintenance | `Wrench` |
| AI Agent / Chat | `MessageSquare` |
| Notifications | `Bell` |
| Settings | `Settings` |
| Upload | `Upload` |
| Overdue / Alert | `AlertCircle` |
| Paid | `CheckCircle2` |
| Vacant | `DoorOpen` |
| Expiry | `CalendarClock` |

---

## 6. UI Components

### 6.1 Buttons

**Primary Button:**
- Background: Propblue `#1B4FD8`
- Text: White, 16sp, weight 600
- Border radius: 12px
- Height: 52px
- Padding: 16px horizontal
- States: Default → Pressed (Propblue Dark) → Disabled (50% opacity)

**Secondary Button:**
- Background: Transparent
- Border: 1.5px Propblue
- Text: Propblue, 16sp, weight 600
- Same sizing as Primary

**Ghost Button:**
- No border, no background
- Text: Ink Medium, 15sp, weight 500
- Used for cancel/back actions

**Danger Button:**
- Background: Crimson `#DC2626`
- Text: White
- Used ONLY for irreversible destructive actions (archive, delete with confirmation)

### 6.2 Cards

**Standard Card:**
```
Background: White
Border: 1px Border (#E5E7EB)
Border radius: 16px
Shadow: 0 1px 4px rgba(0,0,0,0.06)
Padding: 16px
```

**Status Card (e.g., overdue rent):**
```
Left border: 4px, semantic color (Crimson for overdue, Sage for paid)
Background: White
Same border radius and shadow as standard card
```

### 6.3 Status Badges

```
Paid:     Background #DCFCE7, Text #15803D, "PAID"
Overdue:  Background #FEF3C7, Text #B45309, "OVERDUE"
Pending:  Background #F1F5F9, Text #475569, "PENDING"
Vacant:   Background #EDE9FE, Text #6D28D9, "VACANT"
Occupied: Background #DCFCE7, Text #15803D, "OCCUPIED"
```

Badge specs: height 22px, font 12sp weight 600, border radius 6px, padding 6px horizontal.

### 6.4 Input Fields

```
Height: 52px
Border: 1.5px Border (#E5E7EB) default, Propblue on focus
Border radius: 12px
Background: White
Label: 13sp, Ink Light, above field (not floating)
Error state: Crimson border + error text below (13sp Crimson)
```

### 6.5 Navigation

**Bottom Tab Bar:**
- 5 tabs: Portfolio, Documents, Tenants, Payments, Agent
- Active: Propblue icon + Propblue label
- Inactive: Slate icon + Slate label
- Height: 60px + safe area insets
- Background: White with 1px top border

**Top App Bar:**
- Height: 52px + status bar
- Back arrow: left-aligned, 24px
- Title: H2 weight, center or left
- Actions: right-aligned icon buttons (max 2)

---

## 7. Illustration Style

### 7.1 Empty States
Use minimal, single-color line illustrations with a subtle Propblue Light background circle. The illustration should directly represent the empty state context (e.g., empty folder for documents, empty building for properties).

### 7.2 Onboarding Illustrations
3 onboarding slides. Each uses:
- Full-width illustration
- Soft gradient background (Propblue Light to White)
- Centered layout
- No photography — illustration only

### 7.3 AI Agent Visual
The AI chat interface uses a simple PropManage logo mark as the "agent avatar." No humanoid avatars or anthropomorphized characters.

---

## 8. Motion & Animation

### 8.1 Transition Durations
- Micro-interactions (button press, badge change): 120ms
- Screen transitions: 300ms
- Loading states: 400ms fade-in
- Skeleton shimmer: 1200ms loop

### 8.2 Easing
- Enter: `ease-out` — things entering the screen decelerate
- Exit: `ease-in` — things leaving accelerate
- Spring physics for bottom sheets and modals (React Native Reanimated)

### 8.3 Loading States
- Skeleton screens for all data-fetching states (not spinners)
- Full-screen loader ONLY for auth and initial app load
- Inline loaders: small circular indicator in button or card

---

## 9. Writing Style Guide (UI Copy)

### 9.1 Voice Principles
- **Direct:** Tell the user what they need to know, not what happened technically.
- **Human:** Write as if a helpful colleague is explaining, not a system log.
- **Specific:** Use actual names, amounts, and dates — never "your property" or "the amount."
- **Brief:** Subject lines and labels < 5 words. Body copy < 3 sentences.

### 9.2 Error Messages
```
❌ Wrong: "An error occurred while processing your request. Error code: 500."
✅ Right: "We couldn't save this document. Please try again."

❌ Wrong: "Validation failed for field: expiry_date"
✅ Right: "Please enter a valid expiry date (e.g., 31 March 2027)."
```

### 9.3 Empty States
```
Properties: "No properties yet. Add your first property to get started."
Documents: "No documents for this property. Upload your first document."
Payments: "No payments recorded for [Tenant Name] yet."
Agent: "Ask me anything about your properties, documents, or tenants."
```

### 9.4 CTA Labels
```
✅ "Add Property" not "Create New Property"
✅ "Upload Document" not "Add File"
✅ "Invite Tenant" not "Create Tenancy"
✅ "Log Payment" not "Record Transaction"
✅ "Send Reminder" not "Trigger Notification"
```

---

## 10. Design Tokens (For Developers)

```javascript
// colors.ts
export const colors = {
  propblue: '#1B4FD8',
  propblueDark: '#0F2D7F',
  propblueLight: '#E8EDFF',
  ink: '#0D0D0D',
  inkMedium: '#2E2E2E',
  inkLight: '#6B7280',
  border: '#E5E7EB',
  surface: '#F9FAFB',
  white: '#FFFFFF',
  sage: '#16A34A',
  amber: '#D97706',
  crimson: '#DC2626',
  slate: '#64748B',
  violet: '#7C3AED',
};

// typography.ts
export const typography = {
  display:   { fontSize: 28, fontWeight: '700', lineHeight: 34 },
  h1:        { fontSize: 24, fontWeight: '700', lineHeight: 30 },
  h2:        { fontSize: 20, fontWeight: '600', lineHeight: 26 },
  h3:        { fontSize: 17, fontWeight: '600', lineHeight: 22 },
  bodyLarge: { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body:      { fontSize: 15, fontWeight: '400', lineHeight: 22 },
  caption:   { fontSize: 13, fontWeight: '400', lineHeight: 18 },
  label:     { fontSize: 12, fontWeight: '500', lineHeight: 16 },
  overline:  { fontSize: 11, fontWeight: '600', lineHeight: 14 },
};

// spacing.ts
export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  xxl: 32,
  section: 48,
};

// radius.ts
export const radius = {
  sm: 6,
  md: 12,
  lg: 16,
  xl: 24,
  round: 9999,
};
```

---

*Brand Guidelines v1.0 — PropManage*  
*All design decisions should refer back to this document. When in doubt, ask: "Is this trustworthy, intelligent, calm, grounded, and globally aware?"*
