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

## Architecture

```
src/
├── app/
│   ├── layout.tsx          # Root layout, fonts, skip-to-content
│   ├── page.tsx            # Main client page (form → analysis → followup)
│   ├── globals.css         # Design tokens, card styles, accessibility
│   └── api/
│       ├── analyze/route.ts  # POST: decision analysis via Gemini
│       └── followup/route.ts # POST: deeper reflection via Gemini
├── components/
│   ├── DecisionForm.tsx      # Input form with one-click example
│   ├── AnalysisResults.tsx   # Color-coded analysis cards
│   ├── ClarifyingQuestions.tsx # Shown when input is too vague
│   ├── FollowupSection.tsx   # Answer questions → get deeper reflection
│   ├── CopyReflection.tsx    # Copy full reflection to clipboard
│   └── LoadingSkeleton.tsx   # Skeleton loading animation
├── lib/
│   ├── gemini.ts           # Gemini client, JSON mode, retry logic
│   ├── prompts.ts          # System/user prompts (verbatim)
│   ├── guard.ts            # No-advice guard (pure functions)
│   ├── schema.ts           # Zod schemas for all I/O
│   ├── ratelimit.ts        # In-memory IP rate limiter
│   └── sample-data.ts      # Static sample result (API fallback)
└── __tests__/
    ├── guard.test.ts         # 8 tests for advice detection
    ├── schema.test.ts        # 8 tests for Zod validation
    └── ratelimit.test.ts     # 3 tests for rate limiting
```

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

# Run tests
npm test

# Build for production
npm run build
```

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `GEMINI_API_KEY` | Yes | Google Gemini API key (server-side only) |
| `GEMINI_MODEL` | No | Gemini model name (default: `gemini-2.0-flash`) |

## Google Services Used

| Service | Purpose |
|---|---|
| **Gemini API** (`@google/genai`) | Core AI analysis — structured JSON output with response schemas for decision blind spot analysis and follow-up reflection |
| **Google Fonts** (Fraunces + Inter) | Typography via `next/font` for optimized loading |

## Security

- `GEMINI_API_KEY` is server-side only, never exposed to the client
- All request bodies validated with Zod schemas
- All Gemini responses validated with Zod schemas
- Input trimmed and length-limited (1500 chars decision, 600 chars reasons)
- In-memory IP rate limiting: 10 requests/minute (note: per-instance on serverless)
- Security headers: CSP, X-Frame-Options DENY, X-Content-Type-Options nosniff, strict Referrer-Policy
- Generic error messages — raw errors and API keys never leak to the client
- Gemini system prompt treats user text as data, rejecting prompt injection attempts

## Testing

```bash
npm test
```

**19 tests** across 3 test suites:
- `guard.test.ts`: Advice detection, neutral pass-through, question exemption, nested scanning, item stripping
- `schema.test.ts`: Valid/invalid request schemas, response validation, edge cases
- `ratelimit.test.ts`: Under limit, over limit, independent IP tracking

## Accessibility

- Semantic HTML (`main`, `section`, `header`, `footer`)
- Heading hierarchy (single `h1`, proper `h2`/`h3` nesting)
- Labels on all form inputs with descriptive `aria-describedby`
- Skip-to-content link
- Visible focus rings (`outline: 2px solid amber`)
- `aria-live="polite"` on loading and result regions
- `prefers-reduced-motion` respected (animations disabled)
- WCAG AA contrast ratios
- Color never used alone — icon + text label on every card type
- Full keyboard navigation

## Live Link

🔗 **[Live App](https://blind-spot.vercel.app)** *(placeholder — update after deployment)*

---

*Blind Spot helps you think. The decision is always yours.*
