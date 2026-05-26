<div align="center">

<br />

<img src="public/og-image.png" alt="PlacePrep Banner" width="100%" style="border-radius: 16px;" />

<br />
<br />

# PlacePrep

**The premium, all-in-one placement preparation OS.**  
Built for engineers who refuse to leave their interview readiness to chance.

<br />

[![Live Demo](https://img.shields.io/badge/Live%20Demo-placeprep.vercel.app-6366f1?style=for-the-badge&logo=vercel&logoColor=white)](https://placeprep-three.vercel.app/)
&nbsp;
[![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
&nbsp;
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
&nbsp;
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3-38BDF8?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)

<br />

</div>

---

## What is PlacePrep?

PlacePrep is a **high-performance, full-stack placement preparation dashboard** engineered for top-tier technical interview readiness. It replaces scattered spreadsheets, sticky notes, and ad-hoc revision cycles with a single, beautiful, intelligent system.

It is not a tutorial platform. It is an **execution environment**.

- **Spaced Repetition Engine** — Problems reviewed at scientifically optimal intervals via the Ebbinghaus Forgetting Curve.
- **Live Mock Interviews** — Real-time collaborative coding rooms with WebRTC, Monaco Editor, and AI feedback.
- **Premium Mobile UX** — Native iOS/Android feel with 48px touch targets, haptic feedback, and gesture-driven flashcards.
- **Zero-Latency UI** — Optimistic updates, skeleton loaders, and hardware-accelerated animations throughout.

---

## Feature Overview

<br />

| Module | Description |
|---|---|
| **Dashboard** | High-density bento grid — streak, solved count, sprint progress, SRS queue |
| **Must Do List** | Virtualized DSA & Aptitude tracker with SRS scheduling and topic hierarchy |
| **Mock Hub** | Assessment portal, collaborative interview room, and AI performance debrief |
| **Roadmap** | Adaptive 90-day revision plan driven by performance gaps |
| **Knowledge Vault** | Centralized CS theory notes — OOPs, DBMS, OS, CN |
| **Project Lab** | Track dev projects, tech stacks, and showcase-ready features |
| **Daily Checklist** | Habit tracking, biometrics, and tomorrow's plan — all in one commit log |

---

## Tech Stack

```
Frontend          Next.js 14 · React 18 · TypeScript 5 · Tailwind CSS 3
Animation         Framer Motion 12 · CSS View Transitions
State             React Context · Zustand · localStorage persistence
Backend / Auth    Supabase (PostgreSQL + Google OAuth)
Real-time         Yjs · y-webrtc · y-monaco (CRDT-based collaboration)
AI                Google Gemini API (@google/generative-ai)
Editor            Monaco Editor
Performance       react-window (list virtualization) · next/dynamic (code splitting)
```

---

## Mobile Architecture

PlacePrep ships a **premium native-grade mobile layer** built to Apple HIG and Material Design standards:

- `100dvh` dynamic viewport — immune to Safari toolbar resize jumps
- `VisualViewport` API — bottom nav auto-hides when the software keyboard opens
- `navigator.vibrate` haptic feedback on flashcard swipe gestures
- `overscroll-behavior: none` — eliminates rubber-band bounce
- `-webkit-tap-highlight-color: transparent` + `touch-action: manipulation` — zero tap delay, no gray flash
- FOUC prevention — blocking script reads theme from `localStorage` before React hydrates
- Optimistic UI with full rollback — cards dismiss at 0ms, state persists async

---

## Quick Start

**Requirements:** Node.js 18+

```bash
# 1. Clone
git clone https://github.com/AkashMani1/PlacePrep.git
cd PlacePrep

# 2. Install dependencies
npm install

# 3. Configure environment
cp .env.example .env.local
# Fill in your Supabase and Gemini API keys

# 4. Run locally
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## Environment Variables

```bash
# .env.local

NEXT_PUBLIC_SUPABASE_URL=           # Your Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=      # Your Supabase anon key
NEXT_PUBLIC_GEMINI_API_KEY=         # Google Gemini API key
```

**Supabase Setup:**
1. Create a project at [supabase.com](https://supabase.com)
2. Enable **Google OAuth** under Authentication → Providers
3. Set redirect URL to `http://localhost:3000`

---

## Roadmap

- [x] Bento dashboard with real-time stats
- [x] Ebbinghaus SRS scheduling engine
- [x] Virtualized DSA & Aptitude tracker (react-window)
- [x] CSV data import pipeline
- [x] Supabase / PostgreSQL sync
- [x] Google OAuth authentication
- [x] AI-powered mock debrief (Gemini)
- [x] Real-time collaborative interview rooms (WebRTC + Yjs)
- [x] Fullscreen anti-cheat assessment portal
- [x] Premium native mobile UX (gesture swiper, haptics, keyboard-aware nav)
- [ ] Push notifications for SRS review reminders
- [ ] Offline-first PWA support
- [ ] Interview question bank with community contributions

---

## License

MIT © [Akash Mani](https://github.com/AkashMani1)

---

<div align="center">

Crafted with precision. Built for placement season.

**[Live Demo →](https://placeprep-three.vercel.app/)**

</div>
