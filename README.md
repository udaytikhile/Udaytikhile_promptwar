# Blind Spot

**See what you're missing.** A thinking companion that helps you find blind spots in your decision-making — without ever telling you what to choose.

## The Problem

When facing important decisions, people naturally focus on what's most visible and overlook the rest. We seek advice, but advice comes with someone else's biases. What we actually need is a mirror — something that reflects our own reasoning back, surfaces what we're assuming, and asks the questions we haven't thought to ask.

## How Blind Spot Solves This

Blind Spot is an AI-powered thinking companion that:

1. **Reflects back** what you're focusing on, so you see your own priorities clearly
2. **Surfaces assumptions** you're making — with evidence from your own words, and ways to test each one
3. **Identifies overlooked factors** specific to your situation (including upsides, not just downsides)
4. **Points out conflicts** and tensions within your own reasoning
5. **Asks sharp, specific questions** to help you examine your thinking

**It never recommends, ranks options, or tells you what to do.** The decision is always yours.

### How this avoids deciding for you

- The system prompt explicitly forbids directive language (`you should`, `I recommend`, `best option`)
- A no-advice guard (`lib/guard.ts`) regex-scans all output for advice patterns, retries with a stricter prompt on violation, and strips offending items as a last resort
- Questions containing "should" are exempted (they're reflective, not directive)
- All language uses tentative phrasing: "might", "may", "could"

## Architecture & Folder Map

All files follow strict modularity with no file exceeding 150 lines:

```
src/
├── app/
│   ├── layout.tsx              # Root layout, fonts, skip-to-content
│   ├── page.tsx                # Main client page with dynamic lazy-loading
│   ├── globals.css             # Design tokens, card styles, accessibility
│   └── api/
│       ├── analyze/route.ts    # POST: decision analysis (cached, regional bom1, 30s)
│       └── followup/route.ts   # POST: deeper reflection (cached, regional bom1, 30s)
├── components/
│   ├── DecisionForm.tsx        # Memoized form with debounced counters
│   ├── AnalysisResults.tsx     # Color-coded analysis cards
│   ├── EvidenceQuote.tsx       # Accessible evidence quotation component
│   ├── ClarifyingQuestions.tsx # Shown when input is too vague (lazy loaded)
│   ├── FollowupSection.tsx     # Answer questions → get deeper reflection (lazy loaded)
│   ├── CopyReflection.tsx      # Copy full reflection to clipboard (lazy loaded)
│   ├── LoadingSkeleton.tsx     # Accessible skeleton loading animation
│   ├── PageHeader.tsx          # Memoized header branding
│   ├── PageFooter.tsx          # Memoized footer
│   └── ErrorAlert.tsx          # Accessible error card with retry/sample fallback
├── lib/
│   ├── constants.ts            # Centralized limits, models, timeouts, and tokens
│   ├── cache.ts                # In-memory LRU-style cache with input normalization
│   ├── errors.ts               # Centralized sanitized error responses
│   ├── fallback.ts             # Graceful advice-free fallback reflections
│   ├── gemini.ts               # Gemini client, retry, model fallback, cached queries
│   ├── gemini-config.ts        # Structured OpenAPI JSON schemas
│   ├── prompts.ts              # System and user prompts (verbatim)
│   ├── guard.ts                # Advice-detection guard and cleaner (pure functions)
│   ├── schema.ts               # Zod schemas for all I/O (single source of truth)
│   ├── ratelimit.ts            # In-memory IP rate limiter (10 req/min)
│   └── sample-data.ts          # Static sample result for instant demonstration
└── __tests__/
    ├── guard.test.ts           # 8 tests for advice detection
    ├── schema.test.ts          # 10 tests for Zod validation & bounds
    ├── ratelimit.test.ts       # 3 tests for rate limiting
    ├── cache.test.ts           # 7 tests for input normalization & cache eviction
    └── api.test.ts             # 6 tests for routes, injection defense & fallbacks
```

## Performance & Efficiency Optimizations

- **Prompt & Token Efficiency**: Tightened `maxOutputTokens` (1200 for analysis, 600 for followup) to minimize latency and token expenditure.
- **In-Memory Cache**: Identical normalized inputs (whitespace-collapsed, case-insensitive) are served in < 1ms from an LRU-style size-capped cache (`src/lib/cache.ts`).
- **Dynamic Lazy Loading**: Below-the-fold and conditional components (`FollowupSection`, `ClarifyingQuestions`, `CopyReflection`) are code-split using `next/dynamic`.
- **Render Optimization**: Heavy components (`DecisionForm`, `AnalysisResults`, `PageHeader`) are memoized with `React.memo`; character count indicators are debounced to prevent typing re-render churn.
- **Regional Edge Function**: Serverless functions configured for `bom1` (Mumbai) in `vercel.json` with a 30s execution ceiling.
- **Bundle Efficiency**: Main initial JS bundle is under 230 KB uncompressed (~60 KB gzipped) with zero unused dependencies.

## Key Design Decisions

1. **Single Source of Truth**: All server and client data contracts are inferred directly from Zod schemas (`z.infer<typeof ...>`) in `src/lib/schema.ts`.
2. **Graceful Degradation**: If Google Gemini services experience temporary upstream demand or rate limits, the app seamlessly falls back to a curated reflection (`src/lib/fallback.ts`), ensuring zero user-facing 503 errors.
3. **Defense in Depth**: Zero advice is enforced by a three-layer mechanism: strict system prompts, automated regex-based advice parsing with retry, and programmatic item-level stripping.

## Setup

```bash
# Clone and install
git clone <repo-url>
cd blind-spot
npm install

# Configure environment
cp .env.example .env
# Edit .env with your Gemini API key

# Run development server
npm run dev

# Run typecheck
npm run typecheck

# Run linting
npm run lint

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-3.5-flash-lite`, with auto-fallback) |

## Google Services Used

| Service | Purpose |
|---|---|
| **Gemini API** (`@google/genai`) | Core AI analysis — structured JSON output with response schemas for decision blind spot analysis and follow-up reflection |
| **Google Fonts** (Inter) | Typography via `next/font/google` for zero-layout-shift, preloaded font delivery |

## Security

- `GEMINI_API_KEY` is server-side only, never exposed to the client
- All request bodies validated with Zod schemas
- All Gemini responses validated with Zod schemas
- Input trimmed and length-limited (1500 chars decision, 600 chars reasons)
- In-memory IP rate limiting: 10 requests/minute
- Security headers: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, strict Referrer-Policy
- Generic, sanitized error messages via `src/lib/errors.ts` — raw errors and internal keys never leak
- Gemini system prompt treats user text as data, mitigating prompt injection attempts

## Testing

```bash
npm test
```

**34 tests** across 5 test suites:
- `guard.test.ts`: Advice detection, neutral pass-through, question exemption, nested scanning, item stripping
- `schema.test.ts`: Valid/invalid request schemas, response validation, boundary edge cases
- `ratelimit.test.ts`: Under limit, over limit, independent IP tracking
- `cache.test.ts`: Text normalization, deterministic cache keys, TTL expiration, capacity pruning
- `api.test.ts`: API route handling, empty input rejection, prompt injection resilience, vague input handling, graceful fallback

## Accessibility

- Semantic HTML (`main`, `section`, `header`, `footer`)
- Heading hierarchy (single `h1`, proper `h2`/`h3` nesting)
- Labels on all form inputs with descriptive `aria-describedby`
- Skip-to-content link
- Visible focus rings (`focus-visible:ring-2 focus-visible:ring-amber-500`)
- `aria-live="polite"` on loading and result regions
- `prefers-reduced-motion` respected (animations disabled)
- WCAG AA contrast ratios
- Color never used alone — icon + text label on every card type
- Full keyboard navigation

## Live Link

🔗 **[Live App](https://blind-spot.vercel.app)** *(deployed on Vercel)*

---

*Blind Spot helps you think. The decision is always yours.*
