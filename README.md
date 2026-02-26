# 🧮 Countly
**Your life, measured in moments.**  
Track anything with one tap — haircuts, workouts, oil changes. Countly remembers so you don’t have to.

> Solo-built with Expo + React Native. Local-first, private by default, with an optional “forgettable” Pro tier later.

---

## ✨ MVP Features (v0.x)
- One-tap counters (add / edit / delete / reset)
- “Days since” display with due/overdue states
- Local persistence via SQLite (offline-first)
- Local notifications (target days + quiet hours)
- JSON export / import (data ownership)
- Polished dark UI (header, FAB, 2-column list)
- Optional, opt-in anonymous analytics (PostHog/Amplitude)

---
## ✨ Current State(v1.4.1)

## 🛠 Tech Stack
- **App:** Expo (React Native, TypeScript)
- **Routing:** `expo-router`
- **Storage:** `expo-sqlite` (local-first)
- **UI:** React Native, vector icons, haptics
- **Notifications:** `expo-notifications` (local)
- **Analytics (opt-in):** PostHog/Amplitude (free tier)
- **Release tooling:** `standard-version` (semver + CHANGELOG + tags)

---

## 🚀 Getting Started

### Prereqs
- Node LTS (≥ 18), npm
- Git
- Expo Go app on your phone (iOS/Android) — for instant preview

### Install & Run
```bash
# clone and enter
git clone https://github.com/<you>/countly.git
cd countly

# install deps
npm install

# start dev server
npm start
# press 'w' for web, or scan the QR in Expo Go on your phone
