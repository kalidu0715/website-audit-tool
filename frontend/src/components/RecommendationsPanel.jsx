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
    background: 'rgba(249,115,22,0.1)',
    border: '1px solid rgba(249,115,22,0.25)',
    borderRadius: '100px',
    padding: '2px 10px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--accent3)',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  card: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '20px 24px',
    display: 'flex',
    gap: '20px',
    alignItems: 'flex-start',
    transition: 'border-color 0.2s',
  },
  priorityBadge: {
    fontFamily: 'var(--font-display)',
    fontWeight: '800',
    fontSize: '13px',
    width: '36px',
    height: '36px',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    flexShrink: 0,
    marginTop: '2px',
  },
  body: { flex: 1 },
  title: {
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '15px',
    marginBottom: '6px',
    color: 'var(--text)',
  },
  reasoning: {
    fontSize: '13px',
    color: 'var(--text-muted)',
    lineHeight: 1.6,
    marginBottom: '10px',
  },
  actionRow: {
    display: 'flex',
    gap: '8px',
    alignItems: 'flex-start',
  },
  actionLabel: {
    fontFamily: 'var(--font-mono)',
    fontSize: '10px',
    color: 'var(--accent)',
    letterSpacing: '0.1em',
    textTransform: 'uppercase',
    paddingTop: '1px',
    flexShrink: 0,
  },
  action: {
    fontSize: '13px',
    color: 'var(--text)',
    lineHeight: 1.5,
  },
};

const priorityColors = [
  { color: '#ef4444', bg: 'rgba(239,68,68,0.1)' },
  { color: '#f97316', bg: 'rgba(249,115,22,0.1)' },
  { color: '#fbbf24', bg: 'rgba(251,191,36,0.1)' },
  { color: '#34d399', bg: 'rgba(52,211,153,0.1)' },
  { color: '#60a5fa', bg: 'rgba(96,165,250,0.1)' },
];

export default function RecommendationsPanel({ recommendations = [] }) {
  const sorted = [...recommendations].sort((a, b) => a.priority - b.priority);

  return (
    <div className="fade-in">
      <div style={styles.heading}>
        Recommendations
        <span style={styles.badge}>prioritised</span>
      </div>

      <div style={styles.list}>
        {sorted.map((rec, i) => {
          const pc = priorityColors[Math.min(rec.priority - 1, 4)];
          return (
            <div key={i} style={{ ...styles.card, borderLeftWidth: '3px', borderLeftColor: pc.color }}>
              <div style={{ ...styles.priorityBadge, color: pc.color, background: pc.bg }}>
                P{rec.priority}
              </div>
              <div style={styles.body}>
                <div style={styles.title}>{rec.title}</div>
                <p style={styles.reasoning}>{rec.reasoning}</p>
                <div style={styles.actionRow}>
                  <span style={styles.actionLabel}>→ action</span>
                  <span style={styles.action}>{rec.action}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
