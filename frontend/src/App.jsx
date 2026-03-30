import { useState } from 'react';
import AuditForm from './components/AuditForm.jsx';
import MetricsPanel from './components/MetricsPanel.jsx';
import InsightsPanel from './components/InsightsPanel.jsx';
import RecommendationsPanel from './components/RecommendationsPanel.jsx';
import PromptLog from './components/PromptLog.jsx';

const styles = {
  app: {
    maxWidth: '1100px',
    margin: '0 auto',
    padding: '0 24px 80px',
  },
  header: {
    paddingTop: '60px',
    paddingBottom: '56px',
    borderBottom: '1px solid var(--border)',
    marginBottom: '48px',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    marginBottom: '16px',
  },
  logoDot: {
    width: '10px',
    height: '10px',
    borderRadius: '50%',
    background: 'var(--accent)',
    boxShadow: '0 0 12px var(--accent)',
  },
  logoText: {
    fontFamily: 'var(--font-display)',
    fontSize: '22px',
    fontWeight: '800',
    letterSpacing: '-0.5px',
    color: 'var(--text)',
  },
  tagline: {
    color: 'var(--text-muted)',
    fontSize: '14px',
    fontFamily: 'var(--font-mono)',
    letterSpacing: '0.05em',
  },
  auditedBadge: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: '8px',
    background: 'var(--bg3)',
    border: '1px solid var(--border)',
    borderRadius: '100px',
    padding: '6px 14px',
    fontSize: '12px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-muted)',
    marginBottom: '32px',
  },
  auditedDot: {
    width: '6px',
    height: '6px',
    borderRadius: '50%',
    background: 'var(--accent)',
  },
  errorBox: {
    background: 'rgba(248,113,113,0.08)',
    border: '1px solid rgba(248,113,113,0.3)',
    borderRadius: 'var(--radius)',
    padding: '16px 20px',
    color: 'var(--red)',
    fontFamily: 'var(--font-mono)',
    fontSize: '13px',
    marginTop: '24px',
  },
  divider: {
    height: '1px',
    background: 'var(--border)',
    margin: '40px 0',
  },
};

export default function App() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const handleAudit = async (url) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Audit failed');
      setResult(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.logo}>
          <div style={styles.logoDot} />
          <span style={styles.logoText}>PageLens</span>
        </div>
        <p style={styles.tagline}>// AI-powered website audit tool · built for EIGHT25MEDIA</p>
      </header>

      <AuditForm onSubmit={handleAudit} loading={loading} />

      {error && (
        <div style={styles.errorBox}>
          ✗ {error}
        </div>
      )}

      {result && (
        <div className="stagger">
          <div style={styles.auditedBadge}>
            <div style={styles.auditedDot} />
            audited · {result.url} · {new Date(result.auditedAt).toLocaleString()}
          </div>

          <MetricsPanel metrics={result.metrics} />
          <div style={styles.divider} />
          <InsightsPanel insights={result.insights} />
          <div style={styles.divider} />
          <RecommendationsPanel recommendations={result.insights.recommendations} />
          <div style={styles.divider} />
          <PromptLog log={result.promptLog} />
        </div>
      )}
    </div>
  );
}
