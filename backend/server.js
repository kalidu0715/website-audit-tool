import express from 'express';
import cors from 'cors';
import { scrapeUrl } from './scraper.js';
import { generateInsights } from './ai.js';

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// ─── Health check ─────────────────────────────────────────────────────────────
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

// ─── Main audit endpoint ──────────────────────────────────────────────────────
app.post('/api/audit', async (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== 'string') {
    return res.status(400).json({ error: 'A valid "url" string is required in the request body.' });
  }

  // Normalize URL
  let normalizedUrl = url.trim();
  if (!/^https?:\/\//i.test(normalizedUrl)) {
    normalizedUrl = `https://${normalizedUrl}`;
  }

  try {
    new URL(normalizedUrl);
  } catch {
    return res.status(400).json({ error: `Invalid URL: ${normalizedUrl}` });
  }

  console.log(`[audit] Starting audit for: ${normalizedUrl}`);

  try {
    // Step 1: Scrape — pure factual extraction, no AI
    console.log(`[scraper] Fetching page...`);
    const scraped = await scrapeUrl(normalizedUrl);
    console.log(`[scraper] Done. Word count: ${scraped.metrics.wordCount}`);

    // Step 2: AI insights — grounded in scraped metrics
    console.log(`[ai] Sending to Claude...`);
    const { insights, promptLog } = await generateInsights(scraped);
    console.log(`[ai] Done. Tokens used: ${JSON.stringify(promptLog.usage)}`);

    // Return full structured response
    res.json({
      success: true,
      url: normalizedUrl,
      auditedAt: scraped.scrapedAt,
      metrics: scraped.metrics,
      insights,
      promptLog, // Full transparency — satisfies prompt-logs deliverable
    });
  } catch (err) {
    console.error(`[error]`, err.message);
    const status = err.message.includes('HTTP') ? 502 : 500;
    res.status(status).json({ error: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`\n🔍 Website Audit Tool backend running on http://localhost:${PORT}`);
  console.log(`   POST /api/audit  { "url": "https://example.com" }\n`);
});
