import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import { useColorMode } from '@docusaurus/theme-common';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../css/style.module.css';

const defineEditorThemes = (monaco) => {
  monaco.editor.defineTheme('site-dark', {
    base: 'vs-dark', inherit: true, rules: [],
    colors: {
      'editor.background': '#0d1117',
      'editor.lineHighlightBackground': '#161b22',
      'editorLineNumber.foreground': '#4a5568',
      'editorLineNumber.activeForeground': '#6fa3ff',
    },
  });
  monaco.editor.defineTheme('site-light', {
    base: 'vs', inherit: true, rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.lineHighlightBackground': '#f0f4ff',
    },
  });
};

/* ── Deep diff ── */
function deepDiff(a, b, path = '') {
  const out = [];
  if (Array.isArray(a) && Array.isArray(b)) {
    const len = Math.max(a.length, b.length);
    for (let i = 0; i < len; i++) {
      const p = `${path}[${i}]`;
      if (i >= a.length)      out.push({ path: p, type: 'added',   leftVal: undefined, rightVal: b[i] });
      else if (i >= b.length) out.push({ path: p, type: 'removed', leftVal: a[i],      rightVal: undefined });
      else                    out.push(...deepDiff(a[i], b[i], p));
    }
  } else if (a && b && typeof a === 'object' && typeof b === 'object' && !Array.isArray(a) && !Array.isArray(b)) {
    const keys = new Set([...Object.keys(a), ...Object.keys(b)]);
    for (const key of keys) {
      const p = path ? `${path}.${key}` : key;
      if (!(key in a))      out.push({ path: p, type: 'added',   leftVal: undefined, rightVal: b[key] });
      else if (!(key in b)) out.push({ path: p, type: 'removed', leftVal: a[key],    rightVal: undefined });
      else                  out.push(...deepDiff(a[key], b[key], p));
    }
  } else if (JSON.stringify(a) !== JSON.stringify(b)) {
    out.push({ path: path || '(root)', type: 'changed', leftVal: a, rightVal: b });
  }
  return out;
}

const TYPE_STYLE = {
  added:   { border: '#16a34a', bg: 'rgba(34,197,94,0.07)',   badge: '#16a34a', badgeBg: 'rgba(34,197,94,0.12)',   label: 'added' },
  removed: { border: '#b91c1c', bg: 'rgba(239,68,68,0.07)',   badge: '#b91c1c', badgeBg: 'rgba(239,68,68,0.12)',   label: 'removed' },
  changed: { border: '#92400e', bg: 'rgba(234,179,8,0.07)',   badge: '#92400e', badgeBg: 'rgba(234,179,8,0.12)',   label: 'changed' },
};

function DiffResult({ diffs }) {
  if (diffs === null) return (
    <div style={{ padding: '1rem', opacity: 0.45, fontSize: '0.85rem' }}>
      Enter valid JSON in both editors to see the diff.
    </div>
  );
  if (diffs.length === 0) return (
    <div style={{ padding: '1rem', color: '#16a34a', fontWeight: 600, fontSize: '0.9rem' }}>
      ✓ Both JSONs are identical.
    </div>
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
              <code style={{ fontFamily: 'monospace', opacity: 0.8 }}>{d.path}</code>
            </div>
            {d.type === 'changed' && (
              <div style={{ fontFamily: 'monospace', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ color: '#b91c1c', textDecoration: 'line-through' }}>{JSON.stringify(d.leftVal)}</span>
                <span style={{ opacity: 0.5 }}>→</span>
                <span style={{ color: '#16a34a' }}>{JSON.stringify(d.rightVal)}</span>
              </div>
            )}
            {d.type === 'added'   && <span style={{ fontFamily: 'monospace', color: '#16a34a' }}>{JSON.stringify(d.rightVal)}</span>}
            {d.type === 'removed' && <span style={{ fontFamily: 'monospace', color: '#b91c1c', textDecoration: 'line-through' }}>{JSON.stringify(d.leftVal)}</span>}
          </div>
        );
      })}
    </div>
  );
}

const SAMPLE_LEFT  = `{\n  "full_name": "Ayah Refai",\n  "email": "alrefayayah@gmail.com",\n  "role": "admin"\n}`;
const SAMPLE_RIGHT = `{\n  "full_name": "Ayah Refai",\n  "email": "ayah@newdomain.com",\n  "role": "user",\n  "active": true\n}`;

function JsonFormatterContent() {
  const { colorMode } = useColorMode();
  const [input, setInput]         = useState(`{\n  "full_name": "Ayah Refai",\n  "email": "alrefayayah@gmail.com"\n}`);
  const [copied, setCopied]       = useState(false);
  const [diffMode, setDiffMode]   = useState(false);
  const [leftInput, setLeftInput] = useState(SAMPLE_LEFT);
  const [rightInput, setRightInput] = useState(SAMPLE_RIGHT);

  const lines = input ? input.split('\n').length : 0;
  const chars = input ? input.length : 0;
  const theme = colorMode === 'dark' ? 'site-dark' : 'site-light';

  const diffs = useMemo(() => {
    if (!diffMode) return null;
    try {
      return deepDiff(JSON.parse(leftInput), JSON.parse(rightInput));
    } catch { return null; }
  }, [diffMode, leftInput, rightInput]);

  const formatJSON = () => {
    try {
      if (input) setInput(JSON.stringify(JSON.parse(input), null, 2));
    } catch { toast.error('Invalid JSON — check your syntax and try again.'); }
  };

  const minifyJSON = () => {
    try {
      if (input) setInput(JSON.stringify(JSON.parse(input)));
    } catch { toast.error('Invalid JSON — check your syntax and try again.'); }
  };

  const copyToClipboard = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Copy failed — try selecting the text manually.'); }
  };

  const editorOptions = {
    fontSize: 14, minimap: { enabled: false }, lineNumbers: 'on',
    scrollBeyondLastLine: false, wordWrap: 'on',
    padding: { top: 12, bottom: 12 }, renderLineHighlight: 'gutter', smoothScrolling: true,
  };

  return (
    <div className={styles.toolPage}>
      {/* Toolbar */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>JSON Formatter</span>

        {!diffMode && <>
          <button className={`${styles.tBtn} ${styles.tBtnPrimary}`} onClick={formatJSON}>⇄ Format</button>
          <button className={`${styles.tBtn} ${styles.tBtnGhost}`} onClick={minifyJSON}>⊟ Minify</button>
          <div className={styles.toolBarDivider} />
          <button className={`${styles.tBtn} ${styles.tBtnGhost} ${copied ? styles.tBtnSuccess : ''}`} onClick={copyToClipboard} disabled={!input}>
            {copied ? '✓ Copied!' : '⎘ Copy'}
          </button>
          <div className={styles.toolBarDivider} />
          <span className={styles.toolBarMeta}>{lines > 0 ? `${lines} lines · ${chars} chars` : 'Paste JSON below'}</span>
          <div className={styles.toolBarDivider} />
        </>}

        <button
          className={`${styles.tBtn} ${diffMode ? styles.tBtnDanger : styles.tBtnGhost}`}
          onClick={() => setDiffMode(m => !m)}
        >
          {diffMode ? '✕ Close Diff' : '⇄ Diff'}
        </button>
      </div>

      {/* Normal editor */}
      {!diffMode && (
        <div className={styles.paneWide}>
          <div className={styles.paneHeader}><span>●</span> editor</div>
          <div className={styles.paneBody}>
            <Editor language="json" value={input} theme={theme} beforeMount={defineEditorThemes}
              onChange={(v) => setInput(v ?? '')} options={editorOptions} />
          </div>
        </div>
      )}

      {/* Diff mode */}
      {diffMode && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, gap: '0.75rem', minHeight: 0 }}>
          <div className={styles.splitPane} style={{ flex: '1 1 0' }}>
            <div className={styles.pane}>
              <div className={styles.paneHeader}><span style={{ color: '#f87171' }}>●</span> left (original)</div>
              <div className={styles.paneBody}>
                <Editor language="json" value={leftInput} theme={theme} beforeMount={defineEditorThemes}
                  onChange={(v) => setLeftInput(v ?? '')} options={editorOptions} />
              </div>
            </div>
            <div className={styles.pane}>
              <div className={styles.paneHeader}><span style={{ color: '#4ade80' }}>●</span> right (changed)</div>
              <div className={styles.paneBody}>
                <Editor language="json" value={rightInput} theme={theme} beforeMount={defineEditorThemes}
                  onChange={(v) => setRightInput(v ?? '')} options={editorOptions} />
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

export default function JsonFormatter() {
  return (
    <Layout title="JSON Formatter" description="Format, minify and diff JSON in your browser">
      <JsonFormatterContent />
    </Layout>
  );
}
