# SpeerCheck — Live Interview Scheduler

A frontend interview scheduling tool for Speer recruiters. Built with **React + TypeScript**, featuring a weekly calendar, availability overlap detection, engineer filtering, and session-locked slots.

---

## Features

### Core (Required)
- **Weekly calendar** — Mon–Fri, 9 AM–6 PM, 30-minute slot grid
- **3 engineers** with unique availability windows, color-coded
- **Candidate availability** fetched from [dummyjson.com/users](https://dummyjson.com/users) (real API)
- **Overlap highlighting** — green cells where candidate + ≥1 engineer are both free
- **Click-to-schedule** — opens a confirmation modal with engineer/candidate/time
- **Success toast** with full interview details after confirmation

### Senior-Level (All Optional Requirements Included)
- **Engineer filter** — sidebar buttons to narrow the calendar to a single engineer
- **Session-locked slots** — scheduled slots lock red for that candidate for the session
- **Duration selector** — 15, 30, or 60-minute slot lengths; logic recalculates live
- **API integration** — candidate list pulled from dummyjson REST API
- **37 passing tests** — unit tests covering all availability logic + integration tests

---

## Design Decisions

### Aesthetic
Dark editorial theme with deep navy/charcoal base (`#0f0f13`), purple accent (`#7c6bff`), green for overlap slots. Uses **DM Sans** (body) and **Syne** (headings) for a premium recruiter-tool feel.

### Architecture
```
src/
├── types/          # Shared TypeScript interfaces
├── data/           # Static engineer availability
├── utils/
│   ├── availability.ts       # Pure availability logic functions
│   └── availability.test.ts  # 29 unit tests
├── hooks/
│   └── useCandidates.ts      # dummyjson API fetch hook
└── components/
    ├── CalendarGrid.tsx
    ├── EngineerPanel.tsx
    ├── ConfirmModal.tsx
    └── SuccessToast.tsx
```

### Availability Overlap Logic
`computeOverlapSlots()` returns a `SlotStatus[]` for every slot in the week with `candidateAvailable`, `engineerIds[]`, `isOverlap`, and `isLocked` flags. Duration-awareness is built into `isSlotInRange`: a 60-min slot at 16:30 fails if the engineer window ends at 17:00 (16:30 + 60 = 17:30 > 17:00).

---

## Running Locally

```bash
npm install
npm start          # localhost:3000
npm test           # 37 tests
npm run build      # production build
```