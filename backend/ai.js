import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

// ─── System Prompt ───────────────────────────────────────────────────────────
export const SYSTEM_PROMPT = `You are a senior web strategist at a digital marketing agency specialising in SEO, conversion optimisation, content clarity, and UX. Your job is to audit a single webpage and produce a structured JSON report.

You will receive:
- A JSON object of factual metrics extracted from the page (word count, headings, CTAs, links, images, meta tags).
- A sample of visible page text and heading structures.

Your analysis MUST:
1. Be grounded in the factual metrics — cite specific numbers.
2. Be non-generic — no filler advice like "improve your content".
3. Return ONLY valid JSON in the exact schema below. No markdown fences. No preamble.

Required JSON schema:
{
  "seo": {
    "score": <1-10 integer>,
    "summary": "<2-3 sentence analysis>",
    "issues": ["<specific issue>", ...]
  },
  "messaging": {
    "score": <1-10 integer>,
    "summary": "<2-3 sentence analysis>",
    "issues": ["<specific issue>", ...]
  },
  "cta": {
    "score": <1-10 integer>,
    "summary": "<2-3 sentence analysis>",
    "issues": ["<specific issue>", ...]
  },
  "contentDepth": {
    "score": <1-10 integer>,
    "summary": "<2-3 sentence analysis>",
    "issues": ["<specific issue>", ...]
  },
  "ux": {
    "score": <1-10 integer>,
    "summary": "<2-3 sentence analysis>",
    "issues": ["<specific issue>", ...]
  },
  "recommendations": [
    {
      "priority": <1-5 integer, 1=highest>,
      "title": "<short title>",
      "reasoning": "<tie back to a specific metric>",
      "action": "<concrete next step>"
    }
  ]
}`;

// ─── Build User Prompt ────────────────────────────────────────────────────────
export function buildUserPrompt(scraped) {
  const { url, metrics, aiContext } = scraped;

  return `Audit this webpage: ${url}

## Factual Metrics (extracted by scraper – treat as ground truth)
${JSON.stringify(metrics, null, 2)}

## H1 Headings
${aiContext.h1Texts.length ? aiContext.h1Texts.map((t) => `- ${t}`).join('\n') : '(none found)'}

## H2 Headings (first 10)
${aiContext.h2Texts.length ? aiContext.h2Texts.map((t) => `- ${t}`).join('\n') : '(none found)'}

## Visible Page Text Sample (first 3000 characters)
${aiContext.pageTextSample}

Now produce the structured JSON audit. Be specific. Reference exact metric values in your summaries.`;
}

// ─── Call Claude & Parse ─────────────────────────────────────────────────────
export async function generateInsights(scraped) {
  const userPrompt = buildUserPrompt(scraped);

  // Log the full prompt exchange for the prompt-logs deliverable
  const promptLog = {
    model: 'claude-sonnet-4-20250514',
    systemPrompt: SYSTEM_PROMPT,
    userPrompt,
    timestamp: new Date().toISOString(),
    inputMetrics: scraped.metrics,
  };

  const response = await client.messages.create({
    model: 'claude-sonnet-4-20250514',
    max_tokens: 2000,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  });

  const rawOutput = response.content[0].type === 'text' ? response.content[0].text : '';

  // Parse JSON — strip any accidental markdown fences
  let parsed;
  try {
    const clean = rawOutput.replace(/```json|```/g, '').trim();
    parsed = JSON.parse(clean);
  } catch (err) {
    throw new Error(`AI returned invalid JSON: ${err.message}\nRaw: ${rawOutput.slice(0, 500)}`);
  }

  return {
    insights: parsed,
    promptLog: {
      ...promptLog,
      rawModelOutput: rawOutput,
      usage: response.usage,
    },
  };
}
