# KisanFlow

**Know Before You Go**  
*Team: Agri Agents*  
*B.Tech 3rd-Year Student Hackathon Project*

---

## Problem
Farmers frequently face long waiting times, severe lack of transparent information regarding procurement schedules, crowded centres, and complete uncertainty about crop consignment acceptance and DBT payment progress.

## Solution
**KisanFlow** brings all vital crop procurement information into one simple, farmer-friendly interface. Before travelling to a procurement centre, a farmer can check crop availability, current operational status, live queue token numbers, estimated waiting durations, and personalized visit scheduling.

## Main Value Proposition (USP): Smart Visit Planner
Existing government portals digitize internal backend records, but farmers still suffer waiting in physical queues without knowing what to expect. KisanFlow answers the critical question: **"When should I go?"**  
Using live queue counts and an average processing time per farmer, KisanFlow calculates a recommended arrival window (e.g., `10:36 AM – 11:06 AM`), eliminating unnecessary roadside wait times for rural and elderly farmers.

---

## Key Features
* **Search-First Centre Status**: Clean search experience that avoids displaying stale queue numbers before a farmer specifies their crop and centre.
* **Crop & Centre Validation**: Instant verification that the chosen centre actively procures the selected crop.
* **Smart Visit Planner**: Recommended visit window calculated directly from live queue metrics.
* **Token & Queue Tracking**: Live counter monitoring (Current serving vs. Farmer's token), interactive token editor, and progress bar.
* **Procurement Schedule**: Filterable schedule by crop with dates, operating hours, and centre locations.
* **Track Procurement**: Step-by-step visual progression (*Submitted* → *Quality & Moisture Check* → *Weighment & Processing* → *Settlement*).
* **Procurement History**: Dedicated record of past verified sales, weights, dates, and receipts.
* **Important Updates**: Live announcements, quota adjustments, and centre weather alerts with Supabase Realtime synchronization.
* **Background Live Video**: Agriculture-themed background video with high-contrast readable dark emerald overlay.
* **Elderly & Rural Accessibility**: Large touch targets, clear fonts, strong contrast, and zero horizontal scrolling on mobile viewports (360px – 390px+).

---

## Tech Stack
* **Frontend**: React 19 + Vite 8
* **Database & Realtime Backend**: Supabase (PostgreSQL with real-time websocket subscriptions)
* **Icons**: Lucide React
* **Routing**: React Router 7
* **Deployment**: Vercel

---

## Environment Variables Setup
Create a `.env` file in the project root with your Supabase credentials:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_PUBLISHABLE_KEY=your-supabase-publishable-key
```

> **Note**: `.env` is securely excluded from git version control via `.gitignore`. Frontend requests utilize only the anonymous/publishable key with Row-Level Security (RLS) support.

---

## Running Locally

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start local development server:
   ```bash
   npm run dev
   ```

3. Build for production (Vercel):
   ```bash
   npm run build
   ```

---

## Data Honesty Disclaimer
KisanFlow is an academic prototype built for hackathon demonstration. It currently queries realistic prototype procurement data hosted on Supabase PostgreSQL with real-time websockets (`supabase.channel`). In production, this data layer can be directly connected to official state agricultural civil supplies and APMC procurement APIs.

---

## AI Disclosure
AI coding assistance (Google Antigravity / AI Pair Programming) was used during development for debugging, implementation support, UI improvements, and code generation. The architecture, features, and final integration were designed, reviewed, and finalized by the student team (Agri Agents).
