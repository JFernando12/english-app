# Copilot Instructions

## ⚠️ Next.js version notice

This project uses **Next.js 16** with React 19. APIs and conventions differ significantly from earlier versions. Before writing any Next.js code, check `node_modules/next/dist/docs/` for the current API. Route `params` are now a `Promise` — always `await params` in async server components.

## Commands

```bash
npm run dev      # Start dev server (http://localhost:3000)
npm run build    # Production build — run this to verify TypeScript and catch errors
npm run start    # Serve the production build
```

There is no test or lint script configured yet.

## Architecture

The app is an English learning tool. Users see Spanish sentence prompts and must produce the English translation. Content lives in `sentences/*.txt` (two books of lessons).

### Data flow

```
sentences/*.txt  →  FileSentencesRepository (server)  →  Server components  →  Client components
localStorage     ←  LocalStorageProgressRepository (client)  ←  PracticeSession
```

**Server side — lesson data:**
`lib/repositories/impl/file-sentences-repository.ts` parses the `.txt` files at runtime using `fs`. It is marked `server-only` and caches parsed results in module scope (one parse per process). Access it exclusively through the singleton factory:

```ts
import { getSentencesRepository } from '@/lib/repositories';
const lessons = await getSentencesRepository().getAllLessons();
```

Never import `FileSentencesRepository` directly in app code.

**Client side — progress:**
`lib/repositories/impl/local-storage-progress-repository.ts` stores progress under the key `english-app-progress`. Client components instantiate it directly (no factory):

```ts
const repo = new LocalStorageProgressRepository();
repo.saveProgress(lessonId, { ... });
```

### Adding a database later

Create `lib/repositories/impl/db-sentences-repository.ts` and `db-progress-repository.ts` implementing the same interfaces (`ISentencesRepository`, `IProgressRepository`). Update `lib/repositories/index.ts` to return the new implementation. No other files need to change.

### Route structure

| Route | Type | Description |
|---|---|---|
| `/` | Static server | Home — mode selection |
| `/basic` | Static server | Lesson list grouped by book |
| `/basic/[lessonId]` | Dynamic server | Passes `Lesson` to `<PracticeSession>` client component |

The mode that was historically called "Free Mode" is now **Basic Mode** at `/basic`. Do not create a `/free` route.

## Key conventions

**Lesson IDs** follow the pattern `{bookId}-{lessonNumber}` (e.g., `oraciones-1`, `oraciones-v2-7`). The two book IDs are `oraciones` and `oraciones-v2`.

**Server vs. client boundary:** Server components fetch lesson data; client components handle interactivity and progress. `PracticeSession` is the main client component — it receives a fully-loaded `Lesson` prop from its server page wrapper.

**Sentence file parsing:** The `.txt` files have a BOM, use `Lección N` as lesson headers, `Español` / `English` as section markers, and numbered sentences (`1. text`). Lines that don't start with `\d+\.` are continuations of the previous sentence. Do not hand-edit the parsed data — modify the parser in `FileSentencesRepository`.

**Design system:** Apple/iOS-inspired, **mobile-first**. Design for small screens (≤390px) by default; only enhance for larger viewports with `sm:` / `md:` breakpoints when needed. Touch targets must be at least 44px tall. Avoid hover-only interactions. Use these exact color tokens (not Tailwind named colors):
- Background: `#F2F2F7`
- Cards: `bg-white shadow-sm rounded-2xl`
- Primary action: `#007AFF`
- Success: `#34C759`
- Destructive: `#FF3B30`
- Warning/score: `#FF9500`
- Secondary text: `#6C6C70`
- Touch feedback: `active:opacity-80 transition-opacity`

**Answer scoring** (`lib/utils/answer-checker.ts`): positional word-by-word comparison after lowercasing and stripping punctuation (except apostrophes). Score ≥ 70 is considered correct. The result shape is `{ score: number, isClose: boolean, words: WordResult[] }`.

**AI Mode** is planned but not yet implemented. The home page shows it as disabled with a "Soon" badge. When implementing it, add routes under `/ai` and reuse the same repository interfaces.
