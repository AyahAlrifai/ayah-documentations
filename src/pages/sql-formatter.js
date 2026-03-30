import React, { useState, useCallback, useEffect, useRef, useMemo } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import { useColorMode } from '@docusaurus/theme-common';
import { format } from 'sql-formatter';
import ShortcutHint from '../components/ShortcutHint';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../css/style.module.css';

const defineEditorThemes = (monaco) => {
  monaco.editor.defineTheme('site-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#0d1117',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#4a5568',
      'editorLineNumber.activeForeground': '#6fa3ff',
    },
  });
  monaco.editor.defineTheme('site-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.lineHighlightBackground': '#f0f4ff',
    },
  });
};

/* ── SQL line diff ── */
function sqlDiff(a, b) {
  const linesA = a.split('\n');
  const linesB = b.split('\n');
  const results = [];
  const maxLen = Math.max(linesA.length, linesB.length);
  for (let i = 0; i < maxLen; i++) {
    const la = linesA[i];
    const lb = linesB[i];
    if (la === undefined)      results.push({ line: i + 1, type: 'added',   val: lb });
    else if (lb === undefined) results.push({ line: i + 1, type: 'removed', val: la });
    else if (la.trim() !== lb.trim()) results.push({ line: i + 1, type: 'changed', leftVal: la, rightVal: lb });
  }
  return results;
}

const TYPE_STYLE = {
  added:   { border: '#16a34a', bg: 'rgba(34,197,94,0.07)',  badge: '#16a34a', badgeBg: 'rgba(34,197,94,0.12)',  label: 'added' },
  removed: { border: '#b91c1c', bg: 'rgba(239,68,68,0.07)',  badge: '#b91c1c', badgeBg: 'rgba(239,68,68,0.12)',  label: 'removed' },
  changed: { border: '#92400e', bg: 'rgba(234,179,8,0.07)',  badge: '#92400e', badgeBg: 'rgba(234,179,8,0.12)',  label: 'changed' },
};

function DiffResult({ diffs }) {
  if (diffs === null) return (
    <div style={{ padding: '1rem', opacity: 0.45, fontSize: '0.85rem' }}>Enter SQL in both editors.</div>
  );
  if (diffs.length === 0) return (
    <div style={{ padding: '1rem', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>✓ Both SQLs are identical.</div>
  );
  const counts = diffs.reduce((acc, d) => { acc[d.type] = (acc[d.type] || 0) + 1; return acc; }, {});
  return (
    <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.25rem', flexWrap: 'wrap' }}>
        {Object.entries(counts).map(([type, n]) => (
          <span key={type} style={{ fontSize: '0.75rem', fontWeight: 700, padding: '2px 8px', borderRadius: '999px', background: TYPE_STYLE[type].badgeBg, color: TYPE_STYLE[type].badge }}>
            {n} {TYPE_STYLE[type].label}
          </span>
        ))}
      </div>
      {diffs.map((d, i) => {
        const s = TYPE_STYLE[d.type];
        return (
          <div key={i} style={{ border: `1px solid ${s.border}30`, background: s.bg, borderRadius: '8px', padding: '0.5rem 0.75rem', fontSize: '0.83rem', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ background: s.badgeBg, color: s.badge, fontWeight: 700, fontSize: '0.7rem', padding: '1px 6px', borderRadius: '4px' }}>{s.label}</span>
              <code style={{ fontFamily: 'monospace', opacity: 0.7 }}>line {d.line}</code>
            </div>
            {d.type === 'changed' && (
              <div style={{ fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                <span style={{ color: '#b91c1c', textDecoration: 'line-through' }}>{d.leftVal}</span>
                <span style={{ color: '#16a34a' }}>{d.rightVal}</span>
              </div>
            )}
            {d.type === 'added'   && <span style={{ fontFamily: 'monospace', color: '#16a34a' }}>{d.val}</span>}
            {d.type === 'removed' && <span style={{ fontFamily: 'monospace', color: '#b91c1c', textDecoration: 'line-through' }}>{d.val}</span>}
          </div>
        );
      })}
    </div>
  );
}

const INITIAL_SQL = `SELECT
  o.id AS order_id,
  c.full_name,
  c.email,
  p.name AS product_name,
  oi.quantity,
  oi.unit_price,
  (oi.quantity * oi.unit_price) AS line_total
FROM orders o
JOIN customers c ON c.id = o.customer_id
JOIN order_items oi ON oi.order_id = o.id
JOIN products p ON p.id = oi.product_id
WHERE o.status = 'CONFIRMED'
  AND o.created_at >= '2024-01-01'
  AND c.country = 'JO'
ORDER BY o.created_at DESC, line_total DESC;`;

function SqlFormatterContent() {
  const { colorMode } = useColorMode();
  const [input, setInput]           = useState(INITIAL_SQL);
  const [copied, setCopied]         = useState(false);
  const [diffMode, setDiffMode]     = useState(false);
  const [leftSQL, setLeftSQL]       = useState('');
  const [rightSQL, setRightSQL]     = useState('');
  const editorRef = useRef(null);

  const diffs = useMemo(() => {
    if (!diffMode) return null;
    if (!leftSQL.trim() || !rightSQL.trim()) return null;
    return sqlDiff(leftSQL, rightSQL);
  }, [diffMode, leftSQL, rightSQL]);

  const lines = input ? input.split('\n').length : 0;

  const formatSQL = useCallback(() => {
    if (!input || !input.trim()) return;
    try {
      const result = format(input, {
        language: 'sql',
        tabWidth: 2,
        keywordCase: 'upper',
      });
      setInput(result);
    } catch {
      toast.error('Invalid SQL — check your syntax and try again.');
    }
  }, [input]);

  const copyToClipboard = async () => {
    const text = input;
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — try selecting the text manually.');
    }
  };

  // Ctrl+Enter triggers format
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') {
        e.preventDefault();
        formatSQL();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [formatSQL]);

  // Suppress the benign "ResizeObserver loop" error that Monaco triggers
  // when its container is resized — it is not a real error.
  useEffect(() => {
    const suppress = (e) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', suppress);
    return () => window.removeEventListener('error', suppress);
  }, []);

  const editorTheme = colorMode === 'dark' ? 'site-dark' : 'site-light';

  const sharedOptions = {
    fontSize: 14,
    minimap: { enabled: false },
    lineNumbers: 'on',
    scrollBeyondLastLine: false,
    wordWrap: 'on',
    padding: { top: 12, bottom: 12 },
    renderLineHighlight: 'gutter',
    smoothScrolling: true,
    automaticLayout: true,
  };

  return (
    <div className={styles.toolPage}>
      {/* Toolbar */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>SQL Formatter</span>

        {!diffMode && <>
          <button className={`${styles.tBtn} ${styles.tBtnPrimary}`} onClick={formatSQL} title="Format SQL (Ctrl+Enter)">
            ⚡ Format
          </button>
          <button className={`${styles.tBtn} ${styles.tBtnGhost} ${copied ? styles.tBtnSuccess : ''}`} onClick={copyToClipboard} disabled={!input}>
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
          <button className={`${styles.tBtn} ${styles.tBtnDanger}`} onClick={() => setInput('')} disabled={!input}>
            ✕ Clear
          </button>
          <div className={styles.toolBarDivider} />
          <span className={styles.toolBarMeta}>{lines > 0 ? `${lines} lines` : 'Paste SQL below'}</span>
          <div className={styles.toolBarDivider} />
        </>}

        <button
          className={`${styles.tBtn} ${diffMode ? styles.tBtnDanger : styles.tBtnGhost}`}
          onClick={() => {
            if (!diffMode) {
              const formatted = (() => { try { return format(input, { language: 'sql', tabWidth: 2, keywordCase: 'upper' }); } catch { return input; } })();
              setLeftSQL(formatted);
              setRightSQL('');
            }
            setDiffMode(m => !m);
          }}
        >
          {diffMode ? '✕ Close Diff' : '⇄ Diff'}
        </button>
        <ShortcutHint shortcuts={[
          { keys: ['Ctrl', 'Enter'], label: 'Format SQL' },
        ]} />
      </div>

      {/* Normal mode — single editor, format in place */}
      {!diffMode && (
        <div className={styles.paneWide}>
          <div className={styles.paneHeader}><span>●</span> editor</div>
          <div className={styles.paneBody}>
            <Editor language="sql" value={input} theme={editorTheme} beforeMount={defineEditorThemes}
              onChange={(v) => setInput(v ?? '')} options={sharedOptions} />
          </div>
        </div>
      )}

      {/* Diff mode */}
      {diffMode && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem', minHeight: 0 }}>
          <div className={styles.splitPane} style={{ flex: '1 1 0' }}>
            <div className={styles.pane}>
              <div className={styles.paneHeader}>
                <span style={{ color: '#f87171' }}>●</span> left (original)
                <button className={`${styles.tBtn} ${styles.tBtnPrimary}`} style={{ marginLeft: 'auto', padding: '1px 8px', fontSize: '0.72rem' }}
                  onClick={() => { try { setLeftSQL(format(leftSQL, { language: 'sql', tabWidth: 2, keywordCase: 'upper' })); } catch { toast.error('Invalid SQL in left editor.'); } }}>
                  ⚡ Format
                </button>
              </div>
              <div className={styles.paneBody}>
                <Editor language="sql" value={leftSQL} theme={editorTheme} beforeMount={defineEditorThemes}
                  onChange={(v) => setLeftSQL(v ?? '')} options={sharedOptions} />
              </div>
            </div>
            <div className={styles.pane}>
              <div className={styles.paneHeader}>
                <span style={{ color: '#4ade80' }}>●</span> right (changed)
                <button className={`${styles.tBtn} ${styles.tBtnPrimary}`} style={{ marginLeft: 'auto', padding: '1px 8px', fontSize: '0.72rem' }}
                  onClick={() => { try { setRightSQL(format(rightSQL, { language: 'sql', tabWidth: 2, keywordCase: 'upper' })); } catch { toast.error('Invalid SQL in right editor.'); } }}>
                  ⚡ Format
                </button>
              </div>
              <div className={styles.paneBody}>
                <Editor language="sql" value={rightSQL} theme={editorTheme} beforeMount={defineEditorThemes}
                  onChange={(v) => setRightSQL(v ?? '')} options={sharedOptions} />
              </div>
            </div>
          </div>
          <div className={styles.pane} style={{ flex: '0 0 220px', overflow: 'auto' }}>
            <div className={styles.paneHeader}>
              <span>◉</span> diff result
              {diffs !== null && (
                <span style={{ marginLeft: '0.5rem', fontSize: '0.75rem', fontWeight: 700, padding: '1px 8px', borderRadius: '999px',
                  background: diffs.length === 0 ? 'rgba(34,197,94,0.12)' : 'rgba(234,179,8,0.12)',
                  color: diffs.length === 0 ? '#16a34a' : '#92400e' }}>
                  {diffs.length === 0 ? 'identical' : `${diffs.length} difference${diffs.length !== 1 ? 's' : ''}`}
                </span>
              )}
            </div>
            <div className={styles.paneBody}><DiffResult diffs={diffs} /></div>
          </div>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default function SqlFormatter() {
  return (
    <Layout title="SQL Formatter" description="Format and beautify SQL queries in your browser">
      <SqlFormatterContent />
    </Layout>
  );
}
