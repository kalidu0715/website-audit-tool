# PageLens — AI-Powered Website Audit Tool

> Built as a 24-hour take-home assessment for EIGHT25MEDIA's AI-Native Software Engineer role.

**Live demo:** https://website-audit-tool-ashy.vercel.app  
**API endpoint:** `POST https://website-audit-tool-production-a.up.railway.app/api/audit`  
**GitHub:** [https://github.com/kalidu0715/website-audit-tool](https://github.com/kalidu0715/website-audit-tool)

---

## Quick Start (Local)

### Prerequisites
- Node.js 20+
- A free Groq API key → [console.groq.com](https://console.groq.com)

### 1. Clone & install

```bash
git clone https://github.com/kalidu0711/website-audit-tool
cd website-audit-tool

# Backend
cd backend && npm install

# Frontend
cd ../frontend && npm install
```

### 2. Set your API key

```bash
# Create backend/.env
GROQ_API_KEY=gsk_...
```

### 3. Run

```bash
# Terminal 1 — backend
cd backend
node server.js
# → http://localhost:8080

# Terminal 2 — frontend
cd frontend
npm run dev
# → http://localhost:5173
```

Open `http://localhost:5173`, enter any URL, click **Run Audit**.

---

## API Usage (CLI / direct)

```bash
curl -X POST https://website-audit-tool-production-a.up.railway.app/api/audit \
  -H "Content-Type: application/json" \
  -d '{"url": "https://eight25media.com"}'
```

Response shape:
```json
{
  "success": true,
  "url": "https://eight25media.com",
  "auditedAt": "2026-03-31T00:00:00.000Z",
  "metrics": { ... },
  "insights": { ... },
  "promptLog": { ... }
}
```

---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                    React Frontend (Vercel)               │
│  AuditForm → MetricsPanel │ InsightsPanel │ PromptLog   │
└───────────────────────┬─────────────────────────────────┘
                        │ POST /api/audit
┌───────────────────────▼─────────────────────────────────┐
│             Express Backend (Railway)                    │
│                                                         │
│  ┌────────────────┐      ┌──────────────────────────┐  │
│  │  scraper.js    │      │        ai.js             │  │
│  │                │      │                          │  │
│  │  node-fetch    │      │  buildUserPrompt()       │  │
│  │  cheerio       │ ───► │  SYSTEM_PROMPT (const)   │  │
│  │                │      │  generateInsights()      │  │
│  │  Returns:      │      │  → Groq API              │  │
│  │  metrics +     │      │  → parse JSON output     │  │
│  │  aiContext     │      │  → return + promptLog    │  │
│  └────────────────┘      └──────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
```

### Key separation: scraper ≠ AI

`scraper.js` imports only `node-fetch` and `cheerio`. It has no concept of AI.  
`ai.js` imports only `groq-sdk`. It has no concept of HTTP or DOM parsing.  
`server.js` orchestrates both — it's the only file that knows both exist.

This makes each layer independently testable and replaceable.

---

## AI Design Decisions

### 1. Metrics-grounded prompting

All factual data (word count, heading counts, CTA count, etc.) is injected verbatim into the user prompt as a JSON block labeled "Factual Metrics (extracted by scraper — treat as ground truth)". The AI is explicitly instructed to reference specific numbers in every summary.

This prevents hallucination of fake stats and ensures insights are audit-specific, not generic.

### 2. JSON-only output enforced at system level

The system prompt ends with:
> "Return ONLY valid JSON in the exact schema below. No markdown fences. No preamble."

A full schema is provided inline so the model has zero ambiguity about expected structure. Groq's `response_format: { type: 'json_object' }` parameter further enforces this. The response is then `JSON.parse()`d with graceful error handling.

### 3. Page text sample as qualitative signal

The first 3,000 characters of visible body text are included alongside headings (H1s and first 10 H2s). This gives the model enough signal to evaluate messaging clarity and content depth without sending entire pages (which would be expensive and noisy).

### 4. Scores are 1–10 integers

Scores are integers, not floats, to avoid false precision. Integer constraints are enforced in the schema definition within the system prompt.

### 5. Recommendations are priority-ranked

The AI is instructed to return `priority: 1–5` where 1 = highest. The frontend sorts by this and renders colour-coded P1–P5 badges, giving the user an immediately scannable action list.

### 6. Full prompt log returned in API response

Every API response includes a `promptLog` object containing the exact `systemPrompt`, `userPrompt`, `rawModelOutput`, `usage`, and `inputMetrics` that were used. This satisfies the assignment's prompt logs deliverable and makes the tool fully transparent and debuggable.

---

## Trade-offs

| Decision | Why | What I gave up |
|---|---|---|
| `cheerio` for scraping | Fast, simple, zero browser overhead | Can't scrape JS-rendered SPAs (React, Vue apps) |
| Single `/api/audit` endpoint | Simple API surface, easy to test | No streaming / partial results while waiting |
| JSON enforced via system prompt + response_format | Reliable structure, easy to parse | Slightly increases token count |
| No database / caching | Keeps the tool stateless and simple | Re-auditing the same URL costs tokens each time |
| Vite + React (no Next.js) | Faster setup, lighter toolchain | No SSR, no built-in routing for multi-page needs |
| Single-page audit only | In scope, avoids crawl complexity | Can't detect site-wide patterns |
| Groq (free tier) | Zero cost, fast inference | Rate limited at high usage vs paid providers |

---

## What I Would Improve With More Time

1. **Puppeteer / Playwright fallback** — Detect when `cheerio` returns minimal content (word count < 100) and re-scrape with a headless browser. This handles SPAs and JS-rendered pages.

2. **Streaming AI response** — Stream the model response to the frontend so the UI shows insights as they arrive rather than waiting 5–10 seconds for the full response.

3. **Result caching by URL hash** — Cache audit results (with a TTL) to avoid redundant API calls for the same URL. Redis or even a simple JSON file would work.

4. **PDF export** — Add a "Download Report" button that generates a formatted PDF of the audit using `@react-pdf/renderer`.

5. **Diff / comparison mode** — Re-audit the same URL and diff the metrics over time to track improvement across client iterations.

6. **Score weighting config** — Let the agency configure which categories matter most (e.g., SEO > CTA for a content site vs CTA > SEO for a landing page).

7. **CTA detection improvement** — Current selector-based approach misses inline text links used as CTAs. A hybrid approach using both CSS selectors and AI to identify CTAs from the text sample would be more reliable.

---

## Prompt Logs

Prompt logs are returned live in every API response under `promptLog`. They are also visible in the **Prompt Log** collapsible section at the bottom of the UI after every audit.

Sample structure:
```json
{
  "model": "llama-3.3-70b-versatile",
  "systemPrompt": "You are a senior web strategist...",
  "userPrompt": "Audit this webpage: https://example.com\n\n## Factual Metrics...",
  "timestamp": "2026-03-31T00:00:00.000Z",
  "inputMetrics": { "wordCount": 842, "headings": { "h1": 1 }, ... },
  "rawModelOutput": "{ \"seo\": { \"score\": 7, ... } }",
  "usage": { "input_tokens": 1240, "output_tokens": 680 }
}
```

---

## Stack

| Layer | Technology |
|---|---|
| Backend runtime | Node.js 20 (ESM) |
| HTTP server | Express 5 |
| Page scraping | node-fetch + cheerio |
| AI model | Llama 3.3 70B via Groq |
| AI SDK | groq-sdk |
| Frontend framework | React 18 + Vite |
| Frontend deployment | Vercel |
| Backend deployment | Railway |
| Styling | Inline styles + CSS variables |
| Fonts | Syne (display) · Inter (body) · JetBrains Mono |
