# 🚀 PlacePrep: The Ultimate High-Density Learning Dashboard

[![Next.js](https://img.shields.io/badge/Next.js-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)](https://nextjs.org/)
[![React](https://img.shields.io/badge/React-20232A?style=for-the-badge&logo=react&logoColor=61DAFB)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-007ACC?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Framer Motion](https://img.shields.io/badge/Framer_Motion-0055FF?style=for-the-badge&logo=framer&logoColor=white)](https://www.framer.com/motion/)

**PlacePrep** is a high-performance, aesthetically stunning, and logically robust preparation dashboard. Built for high-density academic and professional tracking, it transforms chaotic study schedules into a systematic, gamified OS.

---

## 📽️ Preview

![Dashboard Preview](public/og-image.png)

---

## ✨ Signature Features

### 📊 The "Human Forgetting Curve" DSA Sheet
A true production-grade DSA tracker. When you complete a problem, the system automatically schedules your next review based on the **Ebbinghaus Forgetting Curve**:
- **Easy**: Revisit in 7 days.
- **Medium**: Revisit in 3 days.
- **Hard**: Revisit in 24 hours.
*Fully virtualized with `react-window` to handle 10,000+ problems with zero lag.*

### 🔐 Google Authentication
- **OAuth Integration**: Secure sign-in via Google.
- **Auto-Sync**: Your progress is automatically backed up to Supabase.

### 🛡️ Persistence Shield & Heatmap
A global streak calculator powered by a GitHub-style activity heatmap. Visualize your momentum and maintain your "Persistence Shield" to never miss a day of growth.

### 🎯 Mock Hub: High-Stakes Execution OS
The ultimate interview and assessment engine.
- **Assessment Portal**: Fullscreen, anti-cheat simulation environment for TCS NQT, Amazon OA, etc.
- **Collaborative Interview Room**: Real-time code syncing via **Yjs & WebRTC** with integrated video controls.
- **AI Feedback Engine**: Deep-performance analysis powered by **Google Gemini**, providing Placement IQ and communication debriefs.
- **Adaptive Roadmap**: Intelligence-driven revision plans based on performance gaps.

### 📝 Integrated NoteVault & Project Lab
- **NoteVault**: A centralized hub for core CS subjects (OOPs, DBMS, OS) with markdown-style notes.
- **Project Lab**: Track your development progress, tech stacks, and showcase-ready features.

### ⚡ Notion-Style Tactical UI
A high-density, "Tactical Overview" interface that gives you split-second awareness of your goals, tasks, and upcoming revisions.

---

## 🛠️ Performance & Security (Production Ready)

- **🚀 List Virtualization**: Optimized `react-window` integration for heavy data sets.
- **🔒 Hardened Security Headers**: Strict CSP, HSTS, and XSS protection configured in `next.config.js`.
- **✅ Rigorous Validation**: Fully type-safe infrastructure using **Zod** for environment and data schemas.
- **📉 Optimized Bundle**: Lazy loading and deferred value tracking for instantaneous UI responses.

---

## ⚙️ Quick Start

### 1. Requirements
- Node.js 18+
- NPM / PNPM / Bun

### 🚀 Quick Start

1. **Clone & Install**
   ```bash
   git clone https://github.com/AkashMani1/tcs-90-day.git
   cd tcs-90-day
   npm install
   ```

2. **Supabase Setup**
   - Create a project at [supabase.com](https://supabase.com).
   - Enable **Google OAuth** in Authentication > Providers.
   - Configure **Redirect URL** to `http://localhost:3000`.
   - Copy `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`.

3. **Environment Variables**
   ```bash
   cp .env.example .env.local
   # Fill in your Supabase credentials
   ```

---

## 🗺️ Roadmap
- [x] High-Density Bento Dashboard
- [x] Forgetful Curve DSA Logic
- [x] CSV Data Decoupling
- [x] Supabase/PostgreSQL Sync
- [x] AI-Powered Mock Feedback (Gemini)
- [x] Real-time Collaborative Rooms (WebRTC)
- [x] Fullscreen Assessment Portal

---

### Crafted with Precision. 🚀
Developed by [Akash Mani](https://github.com/AkashMani1)
