# 03 — App Flow (User Experience)
## Project: TypeMaster Pro — Bilingual Typing Master

---

## 1. First Visit (Guest User)

```
Landing Page (/)
    │
    ├── See hero section: "Master Typing in English & Urdu"
    ├── See language toggle button (EN | UR) in navbar
    ├── See 3 feature highlights
    ├── CTA: "Start Typing Free" → Guest Sample Test
    │       └── After test completes → "Create Account to Save Progress" modal
    ├── CTA: "View Leaderboard" → /leaderboard (read-only)
    └── CTA: "Sign Up" → /register
```

---

## 2. Auth Flow

### Sign Up
```
/register
    │
    ├── Enter: Display Name, Email, Password
    ├── Submit → Supabase signUp()
    ├── Success → Auto-login → redirect /dashboard
    └── Error → Show inline error message
```

### Login
```
/login
    │
    ├── Enter: Email, Password
    ├── Submit → Supabase signInWithPassword()
    ├── Success → redirect /dashboard
    ├── Error → "Invalid credentials" message
    └── "Forgot Password?" → trigger resetPasswordForEmail() → "Check your email" toast
```

### Logout
```
Navbar → "Logout" button
    └── signOut() → redirect /
```

---

## 3. Main Navigation (Logged-in User)

**Navbar items:**
- Logo (→ `/`)
- Lessons (→ `/lessons`)
- Typing Test (→ `/test`)
- Custom (→ `/custom`)
- Leaderboard (→ `/leaderboard`)
- Dashboard (→ `/dashboard`)
- **[EN | UR] Toggle Button** ← always visible
- **[☀️ | 🌙] Theme Toggle**
- Profile Avatar (→ `/profile`)

---

## 4. Dashboard Flow (`/dashboard`)

```
/dashboard
    │
    ├── Welcome: "Hello, [Name]! 🔥 Day [X] Streak"
    ├── Stats Cards Row:
    │       ├── Best WPM
    │       ├── Average Accuracy %
    │       ├── Total Tests Taken
    │       └── Lessons Completed
    ├── Progress Chart (WPM over last 30 days — Recharts line chart)
    ├── Language Breakdown (English vs Urdu sessions — bar or donut)
    ├── Recent Activity (last 5 test results)
    └── Quick Actions:
            ├── "Start Quick Test" → /test
            ├── "Continue Lessons" → /lessons
            └── "Try Custom Lesson" → /custom
```

---

## 5. Lessons Flow (`/lessons` → `/lessons/:id`)

```
/lessons
    │
    ├── 3 Level Tabs: [Beginner] [Intermediate] [Advanced]
    ├── Each tab shows grid of lesson cards:
    │       Card shows: Lesson title, description, estimated time, completion status (✓ done / locked / available)
    │
    └── Click lesson card → /lessons/:id
            │
            ├── Lesson header: title, level badge, language badge
            ├── Instructions panel (what to focus on)
            ├── [Start Lesson] button
            │       └── Typing Area activates:
            │               ├── Text display (upcoming chars)
            │               ├── Current char highlighted
            │               ├── Correct = green, Wrong = red
            │               ├── Live stats bar: WPM | Accuracy | Errors | Time
            │               └── Optional: virtual keyboard hint
            │
            ├── On completion:
            │       ├── Result modal:
            │       │       ├── WPM, Accuracy %, Errors, Time
            │       │       ├── Star rating (1–3 based on accuracy + speed)
            │       │       └── Buttons: [Retry] [Next Lesson] [Back to Lessons]
            │       └── Progress saved to DB (lesson_completions table)
            │
            └── States:
                    ├── Loading: skeleton screen
                    ├── Error: "Could not load lesson" + retry button
                    └── Already completed: show best score + option to redo
```

---

## 6. Typing Test Flow (`/test`)

```
/test
    │
    ├── Test Settings Panel:
    │       ├── Duration: [1 min] [2 min] [5 min]
    │       └── Language: auto-set to current EN/UR (can override here)
    │
    ├── [Start Test] button
    │       └── Countdown: 3... 2... 1... GO!
    │
    ├── Active Test:
    │       ├── Full-width typing area with passage text
    │       ├── Live stats bar (top): WPM | Accuracy % | Errors | Time Remaining
    │       ├── Progress bar (% of text completed)
    │       └── [End Test Early] button (bottom right)
    │
    ├── On completion (time up or text finished):
    │       └── Results Screen:
    │               ├── Final WPM (large, prominent)
    │               ├── Accuracy %
    │               ├── Errors Count
    │               ├── Characters Typed
    │               ├── Time Taken
    │               ├── Comparison: "▲ +12 WPM vs your last test"
    │               ├── Rank on leaderboard (if top 100)
    │               └── Buttons: [Try Again] [View Leaderboard] [Go to Dashboard]
    │
    └── Result saved to test_results table in Supabase
```

---

## 7. Custom Lesson Flow (`/custom`)

```
/custom
    │
    ├── Page header: "Create Your Own Lesson"
    ├── Language selector: [English] [Urdu]
    ├── Large textarea: "Paste your text here (min 50 characters)"
    ├── Character count display
    ├── [Start Typing] button (disabled if < 50 chars)
    │       └── Typing area activates with pasted text
    │
    ├── On completion:
    │       └── Result modal (same as test result)
    │               └── Saved to custom_sessions table
    │
    └── Errors:
            ├── < 50 chars → inline warning
            └── Empty → "Please enter some text first"
```

---

## 8. Leaderboard Flow (`/leaderboard`)

```
/leaderboard
    │
    ├── Tabs: [🌍 English] [اردو Urdu]
    ├── Sub-tabs: [All Time] [This Week]
    ├── Top 3 users: special podium display (Gold / Silver / Bronze cards)
    ├── Table (rank 4–100): Rank | Avatar | Name | Best WPM | Accuracy | Tests Taken
    ├── Current user's row highlighted (even if below top 100, shown at bottom)
    └── Pagination: 20 per page
```

---

## 9. Profile Flow (`/profile`)

```
/profile
    │
    ├── Avatar (initials-based, color auto-generated from name)
    ├── Editable: Display Name
    ├── Email (read-only)
    ├── Preferred Language (EN / UR)
    ├── Account created date
    ├── [Save Changes] button
    ├── [Change Password] section → triggers resetPasswordForEmail()
    └── Stats summary (read-only): Total tests, Best WPM, Accuracy avg
```

---

## 10. Language Toggle Behavior

```
User clicks [EN | UR] toggle in navbar
    │
    ├── Language state updates in Zustand store
    ├── Saved to localStorage + user profile (if logged in)
    ├── <html dir="..."> updated (rtl for Urdu, ltr for English)
    ├── Font family switched globally
    ├── Current page content re-renders in selected language
    └── If mid-typing session → language toggle is DISABLED (greyed out)
```

---

## 11. Empty / Error / Loading States

| State | Behavior |
|-------|----------|
| Loading (data fetch) | Skeleton loaders (not spinners) |
| No test history | "You haven't taken any tests yet. Start now!" CTA |
| No lessons completed | Progress shows 0%, encourage first lesson |
| Leaderboard empty | "Be the first on the leaderboard!" |
| Network error | Toast: "Connection error. Please try again." |
| Auth error | Inline field error messages (not alerts) |
| Session expired | Auto redirect to `/login` with toast "Session expired" |

---
