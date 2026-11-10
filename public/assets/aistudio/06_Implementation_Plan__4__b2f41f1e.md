# 06 — Implementation Plan
## Project: TypeMaster Pro — Bilingual Typing Master

> **For AI Studio (Internal Execution Plan):** This document defines the build order and checklist for constructing the full application in a single pass. This is NOT a phase-by-phase user prompt — it is a complete internal plan for AI Studio to execute from `Follow the plan`.

---

## 1. Project Bootstrap

- Initialize React 18 + TypeScript project with Vite
- Install dependencies:
  - `tailwindcss`, `autoprefixer`, `postcss`
  - `react-router-dom` v6
  - `zustand`
  - `@supabase/supabase-js`
  - `recharts`
  - `lucide-react`
- Configure Tailwind with `darkMode: 'class'`
- Configure Vite for SPA (single page app)
- Create `.env.example` with `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (placeholder values)
- Create `.npmrc` at root with `legacy-peer-deps=true`
- Create `public/_redirects` with `/* /index.html 200`
- Set up `tsconfig.json` with strict mode + path aliases (`@/` → `src/`)

---

## 2. Global Styles & Design System

- Set up `src/styles/globals.css`:
  - Tailwind directives
  - Google Fonts import: Inter, JetBrains Mono, Noto Nastaliq Urdu
  - CSS custom properties for all color tokens (dark + light)
  - `.rtl` class rules for Urdu mode
  - Typing area character styles (`.char-correct`, `.char-error`, `.char-current`, `.char-upcoming`)
  - Custom scrollbar styles
  - Smooth cursor blink animation
- Extend `tailwind.config.ts` with:
  - Custom colors matching the design palette from UI/UX Brief
  - Custom font families: `inter`, `mono`, `urdu`
  - Custom animation utilities

---

## 3. Core Types & Utilities

- `src/types/index.ts`: Define all TypeScript interfaces:
  - `User`, `Profile`, `TestResult`, `LessonCompletion`, `CustomSession`, `DailyStreak`
  - `Lesson`, `LessonLevel`, `Language`, `Theme`
  - `TypingSession`, `TypingStats`, `LeaderboardEntry`

- `src/lib/supabase.ts`:
  - Initialize Supabase client using `import.meta.env.VITE_SUPABASE_URL` and `import.meta.env.VITE_SUPABASE_ANON_KEY`
  - Export typed Supabase client

- `src/lib/typingUtils.ts`:
  - `calculateWPM(correctChars, elapsedSeconds)` → number
  - `calculateAccuracy(correctChars, totalTyped)` → number
  - `getStarRating(wpm, accuracy)` → 1 | 2 | 3
  - `formatTime(seconds)` → "1:30"

- `src/lib/lessonData.ts`:
  - English lessons: Beginner (10 lessons), Intermediate (10), Advanced (10)
  - Urdu lessons: Beginner (10 lessons), Intermediate (10), Advanced (10)
  - Each lesson: `{ id, title, level, language, description, text, estimatedMinutes }`

---

## 4. State Management (Zustand Stores)

- `src/store/authStore.ts`:
  - `user`, `profile`, `session`, `loading`
  - Actions: `setUser()`, `setProfile()`, `clearAuth()`
  - `initAuth()`: calls `supabase.auth.getSession()` + listens to `onAuthStateChange`

- `src/store/themeStore.ts`:
  - `theme: 'dark' | 'light'`, `language: 'english' | 'urdu'`
  - Actions: `toggleTheme()`, `setLanguage()`, `toggleLanguage()`
  - On change: update `<html>` class + `dir` attribute + localStorage

- `src/store/typingStore.ts`:
  - `originalText`, `typedChars`, `currentIndex`, `errors`, `startTime`, `isActive`, `isComplete`
  - Actions: `startSession()`, `handleKeyPress()`, `endSession()`, `resetSession()`

---

## 5. Custom Hooks

- `src/hooks/useAuth.ts`:
  - Wraps authStore, exposes `user`, `profile`, `isLoggedIn`, `loading`

- `src/hooks/useTyping.ts`:
  - Core typing engine using typingStore
  - Handles `keydown` event listener
  - Returns: `chars[]` (with status), `stats`, `isComplete`, `reset()`

- `src/hooks/useTimer.ts`:
  - Countdown timer (for timed tests) or elapsed timer (for lessons)
  - Params: `mode: 'countdown' | 'elapsed'`, `duration?: number`
  - Returns: `timeLeft`, `elapsed`, `isRunning`, `start()`, `stop()`, `reset()`

- `src/hooks/useLanguage.ts`:
  - Wraps themeStore language state
  - Returns: `language`, `isUrdu`, `isEnglish`, `toggleLanguage()`
  - Applies RTL/LTR and font changes

---

## 6. Layout Components

- `src/components/layout/Navbar.tsx`:
  - Fixed top, `z-50`
  - Logo: keyboard icon + "TypeMaster Pro" gradient text
  - Desktop: horizontal nav links
  - Mobile: hamburger → drawer
  - Language toggle pill: `[EN | اردو]` — always visible, disabled during active test
  - Theme toggle: Sun/Moon icon button
  - Profile avatar (initials) with dropdown (Dashboard, Profile, Logout)
  - Guest: Show "Login" + "Sign Up" buttons

- `src/components/layout/Footer.tsx`:
  - Simple dark footer
  - Logo, nav links, tagline
  - Language-aware content

- `src/components/layout/PrivateRoute.tsx`:
  - HOC: if no session → redirect to `/login`
  - Shows loading skeleton while auth is initializing

---

## 7. Reusable UI Components

- `src/components/ui/Button.tsx` — variant: primary, secondary, ghost, danger; size: sm, md, lg
- `src/components/ui/Card.tsx` — dark surface card with optional glow border
- `src/components/ui/Badge.tsx` — level badges (Beginner/Intermediate/Advanced), language badge
- `src/components/ui/Modal.tsx` — centered overlay with backdrop blur
- `src/components/ui/Skeleton.tsx` — loading placeholder blocks
- `src/components/ui/Toast.tsx` — top-right notification (success/error/info)
- `src/components/ui/ProgressBar.tsx` — animated fill bar (cyan gradient)
- `src/components/ui/StatCard.tsx` — icon + big number + label card

---

## 8. Typing Components

- `src/components/typing/TypingArea.tsx`:
  - Displays `originalText` as individual `<span>` elements
  - Each span has class: `char-correct`, `char-error`, `char-current`, or `char-upcoming`
  - Hidden `<input>` captures keystrokes (auto-focused)
  - Font: JetBrains Mono (English) or Noto Nastaliq Urdu (Urdu)
  - RTL layout when language = Urdu

- `src/components/typing/LiveStatsBar.tsx`:
  - Horizontal bar: WPM | Accuracy % | Errors | Time
  - Updates in real-time (every 500ms)
  - Clean minimal design

- `src/components/typing/ResultCard.tsx`:
  - Full-screen result display
  - Large WPM (animated count-up)
  - Stats grid: Accuracy, Errors, Chars, Time
  - Comparison vs last test
  - Action buttons

- `src/components/typing/KeyboardHint.tsx`:
  - Visual keyboard showing next key to press
  - Desktop only (hidden on mobile)
  - Highlights current key in cyan

---

## 9. Pages — Build Order

### 9.1 `src/pages/Home.tsx`
- Hero section with animated typing demo
- Stats bar (fetch aggregate stats from DB or use static numbers initially)
- Features grid (3 cards)
- Level preview cards
- CTA buttons

### 9.2 `src/pages/Login.tsx`
- Email + Password form
- Error handling inline
- "Forgot password?" link
- Redirect to `/dashboard` on success

### 9.3 `src/pages/Register.tsx`
- Display Name + Email + Password
- Redirect to `/dashboard` on success

### 9.4 `src/pages/Dashboard.tsx`
- Fetch: `profiles`, `test_results` (last 30 days), `lesson_completions` count, `daily_streaks`
- Render: stats cards, Recharts line chart, recent activity list, quick action buttons

### 9.5 `src/pages/Lessons.tsx`
- Fetch: lesson list from `lessonData.ts`, completion status from `lesson_completions`
- 3 tabs: Beginner / Intermediate / Advanced
- Lesson cards grid with completion badges

### 9.6 `src/pages/LessonDetail.tsx` (`/lessons/:id`)
- Fetch lesson by ID from `lessonData.ts`
- Load `lesson_completions` for this lesson (best score)
- Typing session using `useTyping` + `useTimer`
- Result modal on completion → save to `lesson_completions` (upsert)

### 9.7 `src/pages/TypingTest.tsx`
- Duration selector: 1 min / 2 min / 5 min
- Countdown start
- Active test with `useTyping` + `useTimer (countdown mode)`
- Result screen → save to `test_results`

### 9.8 `src/pages/CustomLesson.tsx`
- Textarea for input
- Language selector
- Validation (min 50 chars)
- Typing session → save to `custom_sessions`

### 9.9 `src/pages/Leaderboard.tsx`
- Tabs: English / Urdu
- Sub-tabs: All Time / This Week
- Call `get_leaderboard()` DB function
- Podium display (top 3)
- Table (rank 4–100)
- Current user rank (call `get_user_rank()`)

### 9.10 `src/pages/Profile.tsx`
- Fetch profile data
- Edit display name + preferred language
- Save via UPDATE to `profiles`
- Password reset email trigger

---

## 10. Supabase-Ready Service Layer

Create `src/lib/` service files (Supabase calls, not raw in components):

- `testResultsService.ts`: `insertTestResult()`, `getUserTestHistory()`, `getUserBestWPM()`
- `lessonService.ts`: `upsertLessonCompletion()`, `getUserCompletions()`
- `profileService.ts`: `getProfile()`, `updateProfile()`
- `leaderboardService.ts`: `getLeaderboard()`, `getUserRank()`
- `streakService.ts`: `getStreak()`, `updateStreak()`

All functions use `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` via the shared client. Database/tables don't exist yet — services are written and ready; they will work once ChatGPT creates the Supabase database.

---

## 11. App Router Setup (`App.tsx`)

```
Routes:
/ → Home
/login → Login (redirect if logged in)
/register → Register (redirect if logged in)
/dashboard → Dashboard (PrivateRoute)
/lessons → Lessons (PrivateRoute)
/lessons/:id → LessonDetail (PrivateRoute)
/test → TypingTest (PrivateRoute)
/custom → CustomLesson (PrivateRoute)
/leaderboard → Leaderboard (public)
/profile → Profile (PrivateRoute)
* → redirect /
```

---

## 12. Final Polish & QA Checklist

- [ ] Language toggle works on all pages (EN ↔ Urdu, RTL switch, font switch)
- [ ] Dark/Light theme toggle works, preference persists
- [ ] All routes protected correctly (PrivateRoute)
- [ ] Typing engine: correct/error highlighting accurate
- [ ] WPM + Accuracy calculation correct
- [ ] Timer countdown works for 1/2/5 min tests
- [ ] Results save to Supabase (code ready, DB pending)
- [ ] Leaderboard renders correctly (uses DB function)
- [ ] Dashboard chart renders with Recharts
- [ ] Custom lesson validation (min 50 chars)
- [ ] All loading states: skeleton loaders visible
- [ ] All empty states: friendly messages shown
- [ ] All error states: toast notifications shown
- [ ] Mobile responsive: tested at 375px, 768px, 1280px
- [ ] Navbar mobile drawer opens/closes
- [ ] Language toggle visible and functional on mobile
- [ ] No hardcoded Supabase keys (env vars used everywhere)
- [ ] `public/_redirects` present (SPA fallback)
- [ ] `.npmrc` with `legacy-peer-deps=true` at root
- [ ] No `bun.lock` file in repo
- [ ] `npm run build` completes without errors
- [ ] `dist/` folder generated correctly

---

## 13. Environment Variables Reference

| Variable | Where to Get |
|----------|-------------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Project Settings → API → Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Project Settings → API → anon/public key |

Set in Cloudflare Pages → Settings → Environment Variables before deploying.

---
