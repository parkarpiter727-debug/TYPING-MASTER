# 05 — Backend Schema
## Project: TypeMaster Pro — Bilingual Typing Master

> **Note:** This is a planning document only. The actual database will be created by ChatGPT using the Supabase plugin after the frontend is built. All table/column names here must exactly match the frontend code.

---

## 1. Database: Supabase (PostgreSQL)

---

## 2. Tables

---

### 2.1 `profiles`
Extends Supabase `auth.users`. Created automatically on user sign-up via trigger.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, FK → `auth.users.id`, ON DELETE CASCADE | Same as auth user ID |
| `display_name` | `text` | NOT NULL | User's chosen display name |
| `preferred_language` | `text` | DEFAULT `'english'` | `'english'` or `'urdu'` |
| `created_at` | `timestamptz` | DEFAULT `now()` | Account creation time |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last profile update |

**Indexes:** `id` (PK, auto)

**RLS Policies:**
- `SELECT`: user can read own row + all rows (for leaderboard display_name lookups)
- `UPDATE`: user can update only own row
- `INSERT`: blocked (handled by trigger)
- `DELETE`: blocked

---

### 2.2 `test_results`
Stores every completed typing test.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Unique result ID |
| `user_id` | `uuid` | FK → `profiles.id`, ON DELETE CASCADE, NOT NULL | Test owner |
| `language` | `text` | NOT NULL | `'english'` or `'urdu'` |
| `duration_seconds` | `integer` | NOT NULL | Test duration (60, 120, 300) |
| `wpm` | `numeric(6,2)` | NOT NULL | Words per minute |
| `accuracy` | `numeric(5,2)` | NOT NULL | Accuracy percentage |
| `errors` | `integer` | NOT NULL | Total error count |
| `characters_typed` | `integer` | NOT NULL | Total chars typed |
| `correct_characters` | `integer` | NOT NULL | Correct chars typed |
| `created_at` | `timestamptz` | DEFAULT `now()` | When test was taken |

**Indexes:**
- `(user_id)` — for dashboard/history queries
- `(language, wpm DESC)` — for leaderboard queries
- `(user_id, created_at DESC)` — for recent activity

**RLS Policies:**
- `SELECT`: user can read own rows; leaderboard view uses a DB function (see Section 4)
- `INSERT`: user can insert own row (user_id must match auth.uid())
- `UPDATE`: blocked
- `DELETE`: user can delete own rows

---

### 2.3 `lesson_completions`
Tracks which lessons a user has completed and their best score.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Unique record ID |
| `user_id` | `uuid` | FK → `profiles.id`, ON DELETE CASCADE, NOT NULL | User |
| `lesson_id` | `text` | NOT NULL | Lesson identifier (e.g. `'en-beginner-01'`) |
| `language` | `text` | NOT NULL | `'english'` or `'urdu'` |
| `level` | `text` | NOT NULL | `'beginner'`, `'intermediate'`, `'advanced'` |
| `wpm` | `numeric(6,2)` | NOT NULL | WPM achieved in this completion |
| `accuracy` | `numeric(5,2)` | NOT NULL | Accuracy % |
| `errors` | `integer` | NOT NULL | Errors |
| `stars` | `integer` | DEFAULT `1` | Star rating 1–3 |
| `completed_at` | `timestamptz` | DEFAULT `now()` | Completion time |

**Unique constraint:** `(user_id, lesson_id)` — UPSERT on replay (keep best score)

**Indexes:**
- `(user_id)` — for dashboard counts
- `(user_id, language, level)` — for lesson list completion status

**RLS Policies:**
- `SELECT`: user can read own rows
- `INSERT / UPDATE`: user can insert/update own rows (upsert pattern)
- `DELETE`: blocked

---

### 2.4 `custom_sessions`
Stores results from custom lesson sessions.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `id` | `uuid` | PK, DEFAULT `gen_random_uuid()` | Session ID |
| `user_id` | `uuid` | FK → `profiles.id`, ON DELETE CASCADE, NOT NULL | User |
| `language` | `text` | NOT NULL | `'english'` or `'urdu'` |
| `text_length` | `integer` | NOT NULL | Character count of custom text |
| `wpm` | `numeric(6,2)` | NOT NULL | WPM achieved |
| `accuracy` | `numeric(5,2)` | NOT NULL | Accuracy % |
| `errors` | `integer` | NOT NULL | Errors |
| `time_taken_seconds` | `integer` | NOT NULL | Actual time taken |
| `created_at` | `timestamptz` | DEFAULT `now()` | Session time |

**Note:** Custom text itself is NOT stored (privacy + storage reasons)

**Indexes:** `(user_id, created_at DESC)`

**RLS Policies:**
- `SELECT / INSERT`: user can read/insert own rows
- `UPDATE / DELETE`: blocked

---

### 2.5 `daily_streaks`
Tracks user's daily practice streak.

| Column | Type | Constraints | Description |
|--------|------|-------------|-------------|
| `user_id` | `uuid` | PK, FK → `profiles.id`, ON DELETE CASCADE | User (one row per user) |
| `current_streak` | `integer` | DEFAULT `0` | Consecutive days |
| `longest_streak` | `integer` | DEFAULT `0` | All-time best streak |
| `last_active_date` | `date` | | Date of last test/lesson |
| `updated_at` | `timestamptz` | DEFAULT `now()` | Last update |

**RLS Policies:**
- `SELECT`: user can read own row
- `INSERT / UPDATE`: user can insert/update own row
- `DELETE`: blocked

---

## 3. Database Functions / Triggers

### 3.1 `handle_new_user()` — Trigger on auth.users INSERT
Automatically creates a `profiles` row and `daily_streaks` row when a new user signs up.

```sql
-- Trigger: after INSERT on auth.users
-- Creates: profiles row (id, display_name from metadata, preferred_language = 'english')
-- Creates: daily_streaks row (user_id, current_streak = 0)
```

### 3.2 `update_streak()` — Called after test_result or lesson_completion INSERT
Updates `daily_streaks` for the user:
- If `last_active_date` = yesterday → increment `current_streak`
- If `last_active_date` = today → no change
- If `last_active_date` < yesterday → reset `current_streak` to 1
- Update `longest_streak` if `current_streak` exceeds it

### 3.3 `get_leaderboard(lang text, period text)` — Security Definer Function
Returns top 100 users by best WPM for given language and period (all_time / this_week).
Used to bypass RLS for leaderboard display while still being safe.

```sql
-- Returns: rank, user_id, display_name, best_wpm, avg_accuracy, tests_count
-- Parameters: lang ('english'|'urdu'), period ('all_time'|'this_week')
```

### 3.4 `get_user_rank(uid uuid, lang text)` — Security Definer Function
Returns a single user's rank position for the leaderboard.

---

## 4. Storage Buckets

No file uploads required for MVP. Avatar is initials-based (no image upload).  
**Storage buckets: none needed for v1.**

---

## 5. Auth Settings (Supabase Dashboard)

- Email + Password: **Enabled**
- Email confirmation: **Disabled** (allow immediate login after signup for better UX)
- Password reset: **Enabled**
- Session duration: 7 days (auto-refresh)

---

## 6. Row Level Security Summary

| Table | SELECT | INSERT | UPDATE | DELETE |
|-------|--------|--------|--------|--------|
| `profiles` | Own + public display_name | Via trigger only | Own row | Blocked |
| `test_results` | Own rows | Own rows | Blocked | Own rows |
| `lesson_completions` | Own rows | Own rows (upsert) | Own rows (upsert) | Blocked |
| `custom_sessions` | Own rows | Own rows | Blocked | Blocked |
| `daily_streaks` | Own row | Own row | Own row | Blocked |

---

## 7. Key Relationships Diagram

```
auth.users (Supabase managed)
    │
    └──► profiles (1:1)
              │
              ├──► test_results (1:many)
              ├──► lesson_completions (1:many)
              ├──► custom_sessions (1:many)
              └──► daily_streaks (1:1)
```

---
