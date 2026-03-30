import { useState } from 'react';

const CATEGORIES = [
  { key: 'seo', label: 'SEO Structure' },
  { key: 'messaging', label: 'Messaging Clarity' },
  { key: 'cta', label: 'CTA Usage' },
  { key: 'contentDepth', label: 'Content Depth' },
  { key: 'ux', label: 'UX & Structure' },
];

const styles = {
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
    background: 'rgba(167,139,250,0.1)',
    border: '1px solid rgba(167,139,250,0.25)',
    borderRadius: '100px',
    padding: '2px 10px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent2)',
  },
  tabs: {
    display: 'flex',
    gap: '4px',
    marginBottom: '20px',
    flexWrap: 'wrap',
  },
  tab: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: '100px',
    padding: '6px 16px',
    fontSize: '13px',
    fontFamily: 'var(--font-display)',
    fontWeight: '600',
    cursor: 'pointer',
    color: 'var(--text-muted)',
    transition: 'all 0.15s',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  tabActive: {
    background: 'var(--bg3)',
    borderColor: 'var(--border-light)',
    color: 'var(--text)',
  },
  panel: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '24px',
    animation: 'fadeIn 0.3s ease',
  },
  scoreRow: {
    display: 'flex',
    alignItems: 'center',
    gap: '16px',
    marginBottom: '20px',
  },
  scoreCircle: {
    width: '64px',
    height: '64px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    fontSize: '22px',
    flexShrink: 0,
    position: 'relative',
  },
  scoreLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    marginTop: '2px',
  },
  summary: {
    fontSize: '14px',
    color: 'var(--text)',
    lineHeight: 1.7,
    marginBottom: '20px',
  },
  issuesLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  issue: {
    display: 'flex',
    gap: '10px',
    padding: '10px 0',
    borderTop: '1px solid var(--border)',
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.5,
  },
  issueDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent3)',
    marginTop: '6px',
    flexShrink: 0,
  },
};

function scoreColor(s) {
  if (s >= 8) return { color: 'var(--green)', bg: 'rgba(52,211,153,0.1)', border: 'rgba(52,211,153,0.25)' };
  if (s >= 5) return { color: 'var(--yellow)', bg: 'rgba(251,191,36,0.1)', border: 'rgba(251,191,36,0.25)' };
  return { color: 'var(--red)', bg: 'rgba(248,113,113,0.1)', border: 'rgba(248,113,113,0.25)' };
}

export default function InsightsPanel({ insights }) {
  const [active, setActive] = useState('seo');
  const current = insights[active];

  return (
    <div className="fade-in">
      <div style={styles.heading}>
        AI Insights
        <span style={styles.badge}>claude-powered</span>
      </div>

      <div style={styles.tabs}>
        {CATEGORIES.map(({ key, label }) => {
          const s = insights[key]?.score ?? 0;
          const { color } = scoreColor(s);
          return (
            <button
              key={key}
              style={{ ...styles.tab, ...(active === key ? styles.tabActive : {}) }}
              onClick={() => setActive(key)}
            >
              <span style={{ color, fontFamily: 'var(--font-mono)', fontSize: '12px' }}>{s}/10</span>
              {label}
            </button>
          );
        })}
      </div>

      {current && (
        <div style={styles.panel}>
          <div style={styles.scoreRow}>
            {(() => {
              const { color, bg, border } = scoreColor(current.score);
              return (
                <div style={{ ...styles.scoreCircle, color, background: bg, border: `2px solid ${border}` }}>
                  {current.score}
                </div>
              );
            })()}
            <div>
              <div style={{ fontFamily: 'var(--font-display)', fontWeight: '700', fontSize: '17px' }}>
                {CATEGORIES.find((c) => c.key === active)?.label}
              </div>
              <div style={styles.scoreLabel}>out of 10</div>
            </div>
          </div>

          <p style={styles.summary}>{current.summary}</p>

          {current.issues?.length > 0 && (
            <>
              <div style={styles.issuesLabel}>Issues found</div>
              {current.issues.map((issue, i) => (
                <div key={i} style={styles.issue}>
                  <div style={styles.issueDot} />
                  <span>{issue}</span>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}
