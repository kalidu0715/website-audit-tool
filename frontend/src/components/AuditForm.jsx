import { useState } from 'react';

const styles = {
  wrapper: {
    marginBottom: '48px',
  },
  label: {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
    letterSpacing: '0.15em',
    textTransform: 'uppercase',
    marginBottom: '12px',
  },
  inputRow: {
    display: 'flex',
    gap: '12px',
    alignItems: 'stretch',
  },
  input: {
    flex: 1,
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    padding: '14px 18px',
    fontSize: '15px',
    color: 'var(--text)',
    fontFamily: 'var(--font-mono)',
    outline: 'none',
    transition: 'border-color 0.2s',
  },
  button: {
    background: 'var(--accent)',
    color: 'var(--bg)',
    border: 'none',
    borderRadius: 'var(--radius)',
    padding: '14px 28px',
    fontFamily: 'var(--font-display)',
    fontWeight: '700',
    fontSize: '14px',
    cursor: 'pointer',
    letterSpacing: '0.03em',
    transition: 'opacity 0.2s, transform 0.15s',
    whiteSpace: 'nowrap',
  },
  buttonLoading: {
    opacity: 0.6,
    cursor: 'not-allowed',
  },
  spinner: {
    display: 'inline-block',
    width: '14px',
    height: '14px',
    border: '2px solid var(--bg)',
    borderTopColor: 'transparent',
    borderRadius: '50%',
    animation: 'spin 0.7s linear infinite',
    marginRight: '8px',
    verticalAlign: 'middle',
  },
};

// Inject spinner keyframes once
const spinStyle = document.createElement('style');
spinStyle.textContent = `@keyframes spin { to { transform: rotate(360deg); } }`;
document.head.appendChild(spinStyle);

export default function AuditForm({ onSubmit, loading }) {
  const [url, setUrl] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (url.trim()) onSubmit(url.trim());
  };

  return (
    <div style={styles.wrapper}>
      <label style={styles.label}>Enter URL to audit</label>
      <form onSubmit={handleSubmit}>
        <div style={styles.inputRow}>
          <input
            style={styles.input}
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            disabled={loading}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border)')}
          />
          <button
            type="submit"
            style={{ ...styles.button, ...(loading ? styles.buttonLoading : {}) }}
            disabled={loading || !url.trim()}
          >
            {loading && <span style={styles.spinner} />}
            {loading ? 'Analysing…' : 'Run Audit'}
          </button>
        </div>
      </form>
    </div>
  );
}
