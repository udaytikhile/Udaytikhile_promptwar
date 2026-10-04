# Blind Spot — Requirements

- User inputs decision details + reasons driving their thinking
- AI surfaces blind spots, assumptions, overlooked factors, conflicts
- AI NEVER recommends, decides, or leans toward any option
- Gemini API (JSON mode) for analysis
- No-advice guard scans output, retries if needed
- Rate limiting: 10 req/min per IP (in-memory, per-instance on serverless)
- Zod validation on all request bodies and Gemini responses
- Security headers (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy)
- One-click example: student choosing a 6-month internship
- Static sample result as fallback when API is unavailable
- Copy-to-clipboard of full reflection
- Follow-up endpoint for deeper reflection after user answers questions
- 8-10 Vitest tests covering guard, schemas, API routes
- WCAG AA accessible, semantic HTML, aria-live regions
- Responsive clean light theme with custom paper/studio design (not template look)
