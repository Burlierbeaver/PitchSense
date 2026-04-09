# PitchSense 🎯

> AI-powered startup pitch coaching. Upload your deck, get grilled by a VC persona, walk in ready.

## What it does

- **Pitch ingestion** — upload a PDF deck, drop an audio recording, or paste your script
- **Fundability scoring** — 0–100 score across 6 dimensions (narrative, market size, team, traction, financials, ask clarity)
- **AI feedback** — strengths, critical gaps, and detailed markdown coaching from Claude
- **VC simulator** — pick an investor archetype and get grilled in real-time Q&A

## Tech stack

| Layer | Technology |
|---|---|
| Frontend | Next.js 14 (App Router), Tailwind CSS, Clerk auth |
| Backend API | Express.js, TypeScript |
| AI | Claude (Anthropic) for feedback & simulation, Whisper (OpenAI) for transcription |
| Database | PostgreSQL via Prisma ORM |
| Vector DB | Pinecone (embeddings for comparable pitch search) |
| File storage | AWS S3 |
| Queue | BullMQ + Redis |
| Billing | Stripe |
| Email | Resend |
| Monorepo | Turborepo |

## Project structure

```
pitchsense/
├── apps/
│   ├── web/                  # Next.js frontend
│   │   └── src/
│   │       ├── app/          # App Router pages & API routes
│   │       └── components/   # UI, pitch, feedback, simulator components
│   └── api/                  # Express backend
│       ├── src/
│       │   ├── routes/       # pitches, users, webhooks
│       │   ├── services/     # feedback, simulator, transcription, processor
│       │   └── lib/          # prisma, s3, queue
│       └── prisma/           # schema + migrations
└── packages/
    └── shared/               # Shared TypeScript types
```

## Getting started

### Prerequisites

- Node.js 20+
- Docker (for local Postgres + Redis)

### 1. Clone and install

```bash
git clone https://github.com/YOUR_USERNAME/pitchsense.git
cd pitchsense
npm install
```

### 2. Start infrastructure

```bash
docker-compose up -d
```

### 3. Configure environment

```bash
cp .env.example .env
# Fill in your API keys (Anthropic, OpenAI, Clerk, Stripe, etc.)
```

### 4. Set up the database

```bash
npm run db:push
```

### 5. Run in dev mode

```bash
npm run dev
```

- Web app: http://localhost:3000  
- API: http://localhost:4000  
- DB studio: `npm run db:studio`

## Environment variables

See [`.env.example`](.env.example) for all required variables with descriptions.

**Minimum required to run locally:**
- `DATABASE_URL` — Postgres connection string
- `ANTHROPIC_API_KEY` — for pitch feedback and VC simulation
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` + `CLERK_SECRET_KEY` — for auth
- `REDIS_URL` — for job queue
- `API_SECRET` — any random string for internal service auth

## API overview

```
POST   /pitches              Create & enqueue a pitch for analysis
GET    /pitches?userId=...   List user's pitches
GET    /pitches/:id          Get full pitch result
POST   /pitches/:id/simulate Start or continue a VC simulator session
POST   /users/sync           Upsert a Clerk user
POST   /webhooks/stripe      Stripe billing webhooks
GET    /health               Health check
```

## Roadmap

- [ ] PDF text extraction (pdf-parse)
- [ ] Real-time status polling via SSE
- [ ] Comparable pitch benchmarking via Pinecone
- [ ] Pitch history timeline with score progression
- [ ] Team plan with shared pitch library
- [ ] Mobile app (React Native)

## License

MIT
