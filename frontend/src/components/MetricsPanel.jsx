const styles = {
  section: { marginBottom: '8px' },
  sectionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '16px',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
    gap: '12px',
    marginBottom: '12px',
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    position: 'relative',
    overflow: 'hidden',
  },
  cardLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '8px',
    display: 'block',
  },
  cardValue: {
    fontFamily: 'var(--font-display)',
    fontSize: '28px',
    fontWeight: '800',
    color: 'var(--text)',
    lineHeight: 1,
    marginBottom: '4px',
  },
  cardSub: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  accent: { color: 'var(--accent)' },
  warn: { color: 'var(--yellow)' },
  danger: { color: 'var(--red)' },
  metaRow: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    marginBottom: '12px',
  },
  metaLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-muted)',
    marginBottom: '4px',
  },
  metaValue: {
    fontSize: '14px',
    color: 'var(--text)',
    wordBreak: 'break-word',
  },
  metaLength: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    marginTop: '4px',
  },
  notFound: { color: 'var(--text-dim)', fontStyle: 'italic' },
  heading: {
    fontFamily: 'var(--font-display)',
    fontSize: '20px',
    fontWeight: '700',
    marginBottom: '20px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
  },
  badge: {
    background: 'rgba(110,240,200,0.1)',
    border: '1px solid rgba(110,240,200,0.2)',
    borderRadius: '100px',
    padding: '2px 10px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent)',
  },
};

function MetricCard({ label, value, sub, colorStyle }) {
  return (
    <div style={styles.card}>
      <span style={styles.cardLabel}>{label}</span>
      <div style={{ ...styles.cardValue, ...(colorStyle || {}) }}>{value}</div>
      {sub && <div style={styles.cardSub}>{sub}</div>}
    </div>
  );
}

export default function MetricsPanel({ metrics }) {
  const { wordCount, headings, ctaCount, links, images, meta } = metrics;
  const missingAltColor =
    images.missingAltPercent > 50
      ? styles.danger
      : images.missingAltPercent > 20
      ? styles.warn
      : {};

  return (
    <div style={styles.section} className="fade-in">
      <div style={styles.heading}>
        Factual Metrics
        <span style={styles.badge}>scraped · no AI</span>
      </div>

      <div style={styles.sectionLabel}>Content & Structure</div>
      <div style={styles.grid}>
        <MetricCard label="Word Count" value={wordCount.toLocaleString()} sub="visible body text" />
        <MetricCard label="H1 Tags" value={headings.h1} sub={headings.h1 === 1 ? '✓ ideal' : headings.h1 === 0 ? '✗ missing' : '⚠ multiple'} colorStyle={headings.h1 === 1 ? styles.accent : styles.warn} />
        <MetricCard label="H2 Tags" value={headings.h2} />
        <MetricCard label="H3 Tags" value={headings.h3} />
        <MetricCard label="CTAs" value={ctaCount} sub="buttons & action links" />
      </div>

      <div style={styles.sectionLabel}>Links & Images</div>
      <div style={styles.grid}>
        <MetricCard label="Internal Links" value={links.internal} />
        <MetricCard label="External Links" value={links.external} />
        <MetricCard label="Total Images" value={images.total} />
        <MetricCard
          label="Missing Alt Text"
          value={`${images.missingAltPercent}%`}
          sub={`${images.missingAlt} of ${images.total} images`}
          colorStyle={missingAltColor}
        />
      </div>

      <div style={styles.sectionLabel}>Meta Tags</div>
      <div style={styles.metaRow}>
        <div style={styles.metaLabel}>Meta Title</div>
        <div style={styles.metaValue}>
          {meta.title ? (
            <>
              <span>{meta.title}</span>
              <div style={{ ...styles.metaLength, color: meta.titleLength > 60 ? 'var(--yellow)' : 'var(--text-dim)' }}>
                {meta.titleLength} chars {meta.titleLength > 60 ? '(too long)' : meta.titleLength < 30 ? '(too short)' : '(good)'}
              </div>
            </>
          ) : (
            <span style={styles.notFound}>Not found</span>
          )}
        </div>
      </div>
      <div style={styles.metaRow}>
        <div style={styles.metaLabel}>Meta Description</div>
        <div style={styles.metaValue}>
          {meta.description ? (
            <>
              <span>{meta.description}</span>
              <div style={{ ...styles.metaLength, color: meta.descriptionLength > 160 ? 'var(--yellow)' : 'var(--text-dim)' }}>
                {meta.descriptionLength} chars {meta.descriptionLength > 160 ? '(too long)' : meta.descriptionLength < 100 ? '(short)' : '(good)'}
              </div>
            </>
          ) : (
            <span style={styles.notFound}>Not found</span>
          )}
        </div>
      </div>
    </div>
  );
}
