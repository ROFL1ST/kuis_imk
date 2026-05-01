# QuizzApp Indo — Architecture & Design System

## Overview

This document describes the Feature-Sliced Design (FSD) architecture and design system
implemented during the `refactor/redesign` sprint.

---

## Folder Structure

```
src/
├── app/                    # Root providers, router, global styles
├── pages/                  # Thin route wrappers only
├── features/               # Business logic + feature UI
│   ├── auth/
│   ├── quiz/               # ASAGTextArea, useASAGAnswer
│   ├── grading/            # SBERTScoreViz, useGrading
│   ├── dashboard/          # Dashboard bento layout
│   └── gamification/       # LevelUpModal, StreakHoverCard
├── entities/               # Pure data-shape UI (UserAvatar, UserHoverCard)
└── shared/                 # Zero business logic: cn, hooks, layout, ui primitives
```

## Dependency Rule

```
app → pages → features → entities → shared
```

A layer can ONLY import from layers **below** it. Never sideways, never upward.

---

## Design System

### Color Palette

| Token       | Value     | Usage                              |
|-------------|-----------|------------------------------------|
| `canvas`    | `#F4F3F0` | Page background                    |
| `surface`   | `#FAFAF8` | Cards, panels                      |
| `ring`      | `#E4E2DC` | Borders, dividers                  |
| `ink`       | `#18181B` | Primary text                       |
| `brand.500` | `#4F54D8` | Primary CTA, active nav            |
| `fire`      | `#F97316` | Streak gamification only           |
| `xp`        | `#8B5CF6` | XP / level gamification only       |
| `score.*`   | see config| SBERT score zones only             |

### Typography

- **Display**: DM Serif Display — headings (h1, h2, h3), level numbers, modal titles
- **Body**: Inter — all UI text, labels, body copy
- **Mono**: JetBrains Mono — score values, code, tabular numbers

### Key Component Classes (defined in tailwind.config.js plugin)

- `.card` — surface + border + shadow-card + rounded-xl
- `.card-lifted` — card + hover lift effect
- `.input-premium` — styled input with brand focus ring
- `.glass` — glassmorphism surface
- `.tabular` — tabular-nums for scores/timers
- `.text-gradient-brand` / `.text-gradient-xp` — gradient text

---

## Key Files Added

| File | Purpose |
|------|---------|
| `tailwind.config.js` | Complete design system tokens + plugin |
| `src/app/styles/base.css` | Global reset, font import, Tailwind layers |
| `src/shared/lib/cn.js` | clsx + tailwind-merge utility |
| `src/shared/hooks/useOnClickOutside.js` | Click outside detection |
| `src/features/quiz/model/useASAGAnswer.js` | ASAG word/char validation logic |
| `src/features/quiz/ui/ASAGTextArea.jsx` | Premium ASAG answer input |
| `src/features/grading/ui/SBERTScoreViz.jsx` | SBERT score data visualization |
| `src/features/grading/model/useGrading.js` | Grading state + API abstraction |
| `src/features/dashboard/ui/Dashboard.jsx` | Redesigned bento dashboard |
| `src/shared/ui/layout/AppShell.jsx` | Collapsible sidebar layout wrapper |
| `src/features/gamification/ui/LevelUpModal.jsx` | Polished level-up modal |
| `src/features/gamification/ui/StreakHoverCard.jsx` | Streak pill + popover |
