# 04 — UI/UX Design Brief
## Project: TypeMaster Pro — Bilingual Typing Master

---

## 1. Design Philosophy

**"Dark. Precise. Powerful."**

TypeMaster Pro should feel like a **professional developer tool meets a competitive gaming platform** — dark, focused, with glowing accents. Users should feel serious and motivated when they open it. It is NOT a children's app. It is a tool for people who want to master a skill.

Inspiration references: VS Code + MonkeyType + Linear.app

---

## 2. Color Palette

### Dark Mode (Default)

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#0D0F14` | Main background (near black) |
| `bg-surface` | `#161B27` | Cards, panels |
| `bg-elevated` | `#1E2535` | Modals, dropdowns |
| `border` | `#2A3447` | Dividers, card borders |
| `accent-cyan` | `#00E5FF` | Primary CTA, highlights, correct chars |
| `accent-purple` | `#A855F7` | Secondary accent, badges |
| `accent-gradient` | `#00E5FF → #A855F7` | Hero text, logo gradient |
| `text-primary` | `#E8EBF0` | Main text |
| `text-secondary` | `#8892A4` | Subtitles, labels |
| `text-muted` | `#4B5563` | Disabled, placeholders |
| `success` | `#22C55E` | Correct character, success states |
| `error` | `#EF4444` | Wrong character, error states |
| `warning` | `#F59E0B` | Warnings |

### Light Mode

| Token | Hex | Usage |
|-------|-----|-------|
| `bg-primary` | `#F8FAFC` | Main background |
| `bg-surface` | `#FFFFFF` | Cards |
| `bg-elevated` | `#F1F5F9` | Modals |
| `border` | `#E2E8F0` | Dividers |
| `text-primary` | `#0F172A` | Main text |
| `text-secondary` | `#64748B` | Secondary |
| Accent colors | Same as dark | Accents stay consistent |

---

## 3. Typography

### English
| Use | Font | Weight | Size |
|-----|------|--------|------|
| UI / Body | Inter | 400, 500, 600 | 14–16px |
| Typing Area | JetBrains Mono | 400 | 20–24px |
| Headings | Inter | 700, 800 | 24–48px |
| Stats Numbers | JetBrains Mono | 700 | 32–64px |

### Urdu
| Use | Font | Weight | Size |
|-----|------|--------|------|
| UI / Body | Noto Nastaliq Urdu | 400 | 16–18px (larger due to script) |
| Typing Area | Noto Nastaliq Urdu | 400 | 22–26px |
| Headings | Noto Nastaliq Urdu | 700 | 26–44px |

**Font Loading:** Preload both fonts on app init. Show fallback serif until loaded.

---

## 4. Layout

### General
- Max content width: `1200px`, centered
- Side padding: `24px` mobile, `48px` desktop
- Grid: 12-column CSS Grid for complex layouts
- Spacing scale: `4px` base unit (Tailwind spacing)

### Navbar
- Fixed top, full-width
- Height: `64px`
- Left: Logo (gradient text "TypeMaster Pro" + keyboard icon)
- Center (desktop): Nav links
- Right: Language Toggle + Theme Toggle + Profile Avatar
- Mobile: Hamburger menu → slide-down drawer

### Language Toggle Button
- Design: Pill-shaped toggle `[EN | اردو]`
- Active side: filled with accent-cyan background, white text
- Inactive side: ghost/outlined
- Always visible in navbar — NEVER hidden on mobile
- Animation: smooth 200ms slide transition

---

## 5. Key Component Designs

### Typing Area
```
┌─────────────────────────────────────────────┐
│  [Live Stats: WPM | Accuracy | Errors | ⏱] │
├─────────────────────────────────────────────┤
│                                             │
│  The quick brown fox jumps over the lazy   │
│  ████████████████ ▌ dog                   │
│  (green = correct) (cursor) (upcoming)     │
│                                             │
├─────────────────────────────────────────────┤
│  [████████████░░░░░░░░░] 60% complete      │
└─────────────────────────────────────────────┘
```
- Monospace font for English typing area
- Text size: 20px minimum (legibility)
- Background: slightly lighter than main bg (bg-elevated)
- Border: `1px solid border-color` with `border-radius: 12px`
- Current word subtle highlight (background box)
- Error characters: red background tint (not just red text)

### Stats Cards (Dashboard)
- Dark card with subtle border glow (cyan/purple)
- Icon top-left (Lucide)
- Large number (JetBrains Mono, 36px)
- Label below (text-secondary)
- Subtle gradient background (5% opacity)

### Leaderboard Table
- Rank column: numbered with special icons for 🥇🥈🥉
- Alternating row backgrounds (subtle)
- Current user row: cyan accent left border + subtle glow
- WPM column: bold, cyan color
- Hover row: slightly elevated bg

### Result Modal / Screen
- Full-screen overlay (not tiny modal)
- Large WPM number center (gradient text, 72px)
- Ring/circle animation around WPM
- Stats grid below
- Confetti animation on excellent result (>80 WPM or >95% accuracy)

### Level Badges
- Beginner: Green pill
- Intermediate: Yellow/amber pill
- Advanced: Purple pill
- With icon: 🌱 / ⚡ / 🔥

---

## 6. Buttons

| Type | Style |
|------|-------|
| Primary | Cyan gradient bg, dark text, `px-6 py-3`, rounded-lg, hover: glow shadow |
| Secondary | Outlined cyan border, cyan text, transparent bg |
| Ghost | No border, text-secondary, hover: bg-elevated |
| Danger | Red bg/border |
| Toggle (Language) | Pill with sliding active indicator |
| Disabled | 50% opacity, `cursor-not-allowed` |

---

## 7. Animations & Transitions

| Element | Animation |
|---------|-----------|
| Page transitions | Fade in (150ms) |
| Correct character | Instant green highlight |
| Wrong character | Instant red + subtle shake |
| Stats numbers | Count-up animation on result |
| Language toggle | Smooth slide 200ms |
| Theme toggle | 300ms color interpolation |
| Modal open | Scale from 0.95 + fade (200ms) |
| Leaderboard rank change | Slide up |
| Confetti | On excellent result only |
| Cursor blink | CSS animation, 1s interval |

---

## 8. Responsive Behavior

| Breakpoint | Behavior |
|-----------|----------|
| Mobile (<640px) | Single column, hamburger nav, font size -2px, typing area full-width |
| Tablet (640–1024px) | 2-column dashboard grid, condensed leaderboard |
| Desktop (>1024px) | Full layout, side-by-side panels |

**Critical mobile rules:**
- Language toggle must be visible in mobile nav
- Typing area must NOT require horizontal scroll
- Virtual keyboard hint hidden on mobile (device keyboard used)
- Font size in typing area: minimum 18px on mobile

---

## 9. Accessibility

- All interactive elements keyboard-focusable (Tab order logical)
- Focus ring visible (cyan outline, `2px offset`)
- Color not the only indicator (icons + labels alongside)
- Contrast ratio: minimum 4.5:1 for all text
- `aria-label` on icon-only buttons
- `lang` attribute on `<html>` updated when language switches
- Screen reader: typing area announces errors

---

## 10. Iconography

- Icon library: **Lucide React** (consistent, clean, minimal)
- Key icons: Keyboard (logo), Trophy (leaderboard), BarChart (dashboard), Zap (test), BookOpen (lessons), User (profile), Sun/Moon (theme), Globe (language)
- Icons always paired with text labels (not standalone except navbar)

---

## 11. Home Page Layout

```
[NAVBAR: Logo | Nav Links | EN/UR Toggle | Theme | Avatar]
│
├── HERO SECTION
│   ├── Tagline: "Master Typing in English & اردو" (gradient text)
│   ├── Sub: "Track your speed. Beat your records. Rule the leaderboard."
│   ├── [Start for Free] [View Leaderboard] buttons
│   └── Animated typing demo (auto-plays sample text)
│
├── STATS BAR (social proof)
│   ├── X Users | X Tests Taken | X Average WPM
│
├── FEATURES GRID (3 cols)
│   ├── 🌐 Bilingual — English + Urdu
│   ├── 📊 Real-time Stats
│   └── 🏆 Global Leaderboard
│
├── LEVEL PREVIEW (3 cards: Beginner / Intermediate / Advanced)
│
└── FOOTER
    ├── Logo | Links | "Built for typists, by typists"
```

---
