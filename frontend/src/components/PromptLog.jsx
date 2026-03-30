import { useState } from 'react';

const styles = {
  wrapper: { marginBottom: '8px' },
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
    background: 'rgba(110,240,200,0.06)',
    border: '1px solid rgba(110,240,200,0.15)',
    borderRadius: '100px',
    padding: '2px 10px',
    fontSize: '11px',
    fontFamily: 'var(--font-mono)',
    color: 'var(--text-dim)',
  },
  block: {
    background: 'var(--bg2)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius)',
    marginBottom: '10px',
    overflow: 'hidden',
  },
  blockHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '12px 18px',
    cursor: 'pointer',
    userSelect: 'none',
    gap: '12px',
  },
  blockTitle: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    letterSpacing: '0.05em',
  },
  chevron: {
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-dim)',
    transition: 'transform 0.2s',
  },
  pre: {
    padding: '16px 18px',
    borderTop: '1px solid var(--border)',
    margin: 0,
    fontFamily: 'var(--font-mono)',
    fontSize: '12px',
    color: 'var(--text-muted)',
    lineHeight: 1.7,
    overflowX: 'auto',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    background: 'var(--bg)',
    maxHeight: '400px',
    overflowY: 'auto',
  },
  usageRow: {
    display: 'flex',
    gap: '24px',
    padding: '12px 18px',
    borderTop: '1px solid var(--border)',
    background: 'var(--bg)',
  },
  usageStat: {
    fontFamily: 'var(--font-mono)',
    fontSize: '11px',
    color: 'var(--text-dim)',
  },
  usageNum: {
    color: 'var(--accent)',
    fontWeight: '500',
  },
};

function Collapsible({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div style={styles.block}>
      <div style={styles.blockHeader} onClick={() => setOpen(!open)}>
        <span style={styles.blockTitle}>{title}</span>
        <span style={{ ...styles.chevron, transform: open ? 'rotate(180deg)' : 'none' }}>▼</span>
      </div>
      {open && children}
    </div>
  );
}

export default function PromptLog({ log }) {
  if (!log) return null;
  return (
    <div style={styles.wrapper} className="fade-in">
      <div style={styles.heading}>
        Prompt Log
        <span style={styles.badge}>transparency layer</span>
      </div>

      <Collapsible title="system_prompt">
        <pre style={styles.pre}>{log.systemPrompt}</pre>
      </Collapsible>

      <Collapsible title="user_prompt  (metrics injected)">
        <pre style={styles.pre}>{log.userPrompt}</pre>
      </Collapsible>

      <Collapsible title="raw_model_output  (before parsing)">
        <pre style={styles.pre}>{log.rawModelOutput}</pre>
        {log.usage && (
          <div style={styles.usageRow}>
            <span style={styles.usageStat}>input tokens: <span style={styles.usageNum}>{log.usage.input_tokens}</span></span>
            <span style={styles.usageStat}>output tokens: <span style={styles.usageNum}>{log.usage.output_tokens}</span></span>
            <span style={styles.usageStat}>model: <span style={styles.usageNum}>{log.model}</span></span>
          </div>
        )}
      </Collapsible>

      <Collapsible title="input_metrics  (ground truth passed to AI)">
        <pre style={styles.pre}>{JSON.stringify(log.inputMetrics, null, 2)}</pre>
      </Collapsible>
    </div>
  );
}
