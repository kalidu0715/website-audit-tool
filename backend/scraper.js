import fetch from 'node-fetch';
import * as cheerio from 'cheerio';

/**
 * Fetches and parses a URL, returning structured factual metrics.
 * Clean separation: this module has zero AI logic.
 */
export async function scrapeUrl(url) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 15000);

  let html;
  try {
    const res = await fetch(url, {
      signal: controller.signal,
      headers: {
        'User-Agent':
          'Mozilla/5.0 (compatible; WebAuditBot/1.0; +https://audit.tool)',
      },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} for ${url}`);
    html = await res.text();
  } finally {
    clearTimeout(timeout);
  }

  const $ = cheerio.load(html);

  // ── Meta ──────────────────────────────────────────────────────────────
  const metaTitle = $('title').first().text().trim() || null;
  const metaDescription =
    $('meta[name="description"]').attr('content')?.trim() ||
    $('meta[property="og:description"]').attr('content')?.trim() ||
    null;

  // ── Headings ──────────────────────────────────────────────────────────
  const h1Count = $('h1').length;
  const h2Count = $('h2').length;
  const h3Count = $('h3').length;

  // ── Word count (visible text only) ────────────────────────────────────
  $('script, style, noscript, svg').remove();
  const bodyText = $('body').text().replace(/\s+/g, ' ').trim();
  const wordCount = bodyText.split(' ').filter((w) => w.length > 0).length;

  // ── Links ─────────────────────────────────────────────────────────────
  const parsedBase = new URL(url);
  let internalLinks = 0;
  let externalLinks = 0;

  $('a[href]').each((_, el) => {
    const href = $(el).attr('href') || '';
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) return;
    try {
      const parsed = new URL(href, url);
      if (parsed.hostname === parsedBase.hostname) {
        internalLinks++;
      } else {
        externalLinks++;
      }
    } catch {
      internalLinks++; // relative paths count as internal
    }
  });

  // ── Images ────────────────────────────────────────────────────────────
  const images = $('img');
  const imageCount = images.length;
  let missingAlt = 0;
  images.each((_, el) => {
    const alt = $(el).attr('alt');
    if (alt === undefined || alt === null || alt.trim() === '') missingAlt++;
  });
  const missingAltPercent =
    imageCount > 0 ? Math.round((missingAlt / imageCount) * 100) : 0;

  // ── CTAs (buttons + prominent action links) ───────────────────────────
  const ctaSelectors = [
    'button',
    'a.btn',
    'a.button',
    'a.cta',
    '[class*="cta"]',
    '[class*="btn"]',
    '[class*="button"]',
    'input[type="submit"]',
    'input[type="button"]',
  ];
  const ctaCount = $(ctaSelectors.join(', ')).length;

  // ── Collect heading texts for AI context ─────────────────────────────
  const h1Texts = $('h1')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean);
  const h2Texts = $('h2')
    .map((_, el) => $(el).text().trim())
    .get()
    .filter(Boolean)
    .slice(0, 10);

  // ── Page text sample for AI (first ~3000 chars) ───────────────────────
  const pageTextSample = bodyText.slice(0, 3000);

  return {
    url,
    scrapedAt: new Date().toISOString(),
    metrics: {
      wordCount,
      headings: { h1: h1Count, h2: h2Count, h3: h3Count },
      ctaCount,
      links: { internal: internalLinks, external: externalLinks },
      images: {
        total: imageCount,
        missingAlt,
        missingAltPercent,
      },
      meta: {
        title: metaTitle,
        titleLength: metaTitle ? metaTitle.length : 0,
        description: metaDescription,
        descriptionLength: metaDescription ? metaDescription.length : 0,
      },
    },
    aiContext: {
      h1Texts,
      h2Texts,
      pageTextSample,
    },
  };
}
