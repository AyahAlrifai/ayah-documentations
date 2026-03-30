import React, { useState, useMemo, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import ShortcutHint from '../components/ShortcutHint';
import styles from '../css/style.module.css';

/* ── Preset patterns ────────────────────────────────────────── */
const PRESETS = [
  { name: 'Email',
    pat: '[a-zA-Z0-9._%+\\-]+@[a-zA-Z0-9.\\-]+\\.[a-zA-Z]{2,}', fl: 'gi',
    txt: 'Reach us at hello@example.com, support@company.org\nBad: @nodomain.com, missing@' },
  { name: 'URL',
    pat: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._+~#=]{1,256}\\.[a-zA-Z]{2,6}\\b([-a-zA-Z0-9()@:%_+.~#?&/=]*)', fl: 'gi',
    txt: 'Docs: https://example.com\nBlog: http://blog.site.io/posts/hello?ref=home#section' },
  { name: 'IPv4',
    pat: '\\b(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)(?:\\.(?:25[0-5]|2[0-4]\\d|[01]?\\d\\d?)){3}\\b', fl: 'g',
    txt: 'LAN: 192.168.1.1  Gateway: 10.0.0.1  Public: 203.0.113.42\nBad: 999.0.0.1  256.1.1.1' },
  { name: 'UUID',
    pat: '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}', fl: 'gi',
    txt: 'User:    550e8400-e29b-41d4-a716-446655440000\nSession: 6ba7b810-9dad-11d1-80b4-00c04fd430c8' },
  { name: 'Date (YYYY-MM-DD)',
    pat: '\\b(\\d{4})-(0[1-9]|1[0-2])-(0[1-9]|[12]\\d|3[01])\\b', fl: 'g',
    txt: 'Start: 2024-01-15  End: 2024-12-31  Birthday: 1997-05-21\nBad: 2024-13-01  2024-00-10' },
  { name: 'Phone (intl)',
    pat: '\\+?[1-9]\\d{0,2}[\\s.\\-]?\\(?\\d{1,4}\\)?[\\s.\\-]?\\d{1,4}[\\s.\\-]?\\d{1,9}', fl: 'g',
    txt: 'US: +1 (555) 123-4567\nUK: +44 20 7946 0958\nJO: +962 79 123 4567' },
  { name: 'JWT Token',
    pat: 'eyJ[A-Za-z0-9_-]+\\.eyJ[A-Za-z0-9_-]+\\.[A-Za-z0-9_-]+', fl: 'g',
    txt: 'Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIn0.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c' },
  { name: 'Semver',
    pat: 'v?(0|[1-9]\\d*)\\.(0|[1-9]\\d*)\\.(0|[1-9]\\d*)(?:-((?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\\.(?:0|[1-9]\\d*|\\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\\+([0-9a-zA-Z-]+(?:\\.[0-9a-zA-Z-]+)*))?', fl: 'g',
    txt: 'Released: v1.0.0  v2.3.1-beta.1  3.0.0-rc.2+build.123\nBad: 1.0  v1.2.x' },
  { name: 'Hex Color',
    pat: '#(?:[A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})\\b', fl: 'gi',
    txt: 'Primary: #4f80ff  Purple: #c77dff  Red: #f00  White: #FFFFFF\nBad: #gg0000  #1234567' },
  { name: 'URL Slug',
    pat: '(?<![a-zA-Z])[a-z0-9]+(?:-[a-z0-9]+)*(?![a-zA-Z])', fl: 'g',
    txt: 'Valid: hello-world  my-blog-post-2024  product-v2\nBad: Hello-World  my__slug  -starts-with-dash' },
];

/* ── Cheatsheet ─────────────────────────────────────────────── */
const CHEAT = [
  ['.', 'Any char except newline'],
  ['\\d / \\D', 'Digit / non-digit'],
  ['\\w / \\W', 'Word char / non-word'],
  ['\\s / \\S', 'Whitespace / non-whitespace'],
  ['^', 'Start of string (or line with m)'],
  ['$', 'End of string (or line with m)'],
  ['*', 'Zero or more (greedy)'],
  ['+', 'One or more (greedy)'],
  ['?', 'Zero or one'],
  ['*?  +?  ??', 'Lazy (non-greedy) versions'],
  ['{n}', 'Exactly n repetitions'],
  ['{n,m}', 'Between n and m repetitions'],
  ['(group)', 'Capturing group'],
  ['(?:...)', 'Non-capturing group'],
  ['(?=...)', 'Positive lookahead'],
  ['(?!...)', 'Negative lookahead'],
  ['[abc]', 'Character class'],
  ['[^abc]', 'Negated character class'],
  ['a|b', 'Alternation — a or b'],
  ['\\b / \\B', 'Word boundary / non-boundary'],
  ['\\1  \\2', 'Backreference to group n'],
  ["$&  $1  $`  $'", 'Replace: full, group, before, after'],
];

const INITIAL_TEXT = `The Quick Brown Fox jumps over the Lazy Dog.
Contact: hello@example.com  |  Visit: https://example.com
Release: v2.4.1  |  Color: #4f80ff  |  Date: 2024-03-26
IP: 192.168.1.1  |  UUID: 550e8400-e29b-41d4-a716-446655440000`;

/* ── Helpers ─────────────────────────────────────────────────── */
function escHtml(s) {
  return String(s)
    .replace(/&/g, '&amp;').replace(/</g, '&lt;')
    .replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function compute(pattern, flagsStr, text, replaceStr, replaceMode) {
  if (!pattern) {
    return { matches: [], error: null, hlHtml: escHtml(text), replaceResult: '' };
  }
  let regex;
  try { regex = new RegExp(pattern, flagsStr); }
  catch (e) {
    return { matches: [], error: e.message, hlHtml: escHtml(text), replaceResult: '' };
  }
  const matches = [];
  if (flagsStr.includes('g') || flagsStr.includes('y')) {
    const re2 = new RegExp(pattern, flagsStr);
    let m;
    while ((m = re2.exec(text)) !== null) {
      matches.push({ val: m[0], start: m.index, end: m.index + m[0].length, groups: [...m].slice(1) });
      if (m[0].length === 0) re2.lastIndex++;
      if (matches.length > 5000) break;
    }
  } else {
    const m = regex.exec(text);
    if (m) matches.push({ val: m[0], start: m.index, end: m.index + m[0].length, groups: [...m].slice(1) });
  }
  let hlHtml = '', cursor = 0;
  matches.forEach((m, i) => {
    if (m.start > cursor) hlHtml += escHtml(text.slice(cursor, m.start));
    hlHtml += `<mark data-i="${i}">${escHtml(m.val || '\u200b')}</mark>`;
    cursor = m.end;
  });
  if (cursor < text.length) hlHtml += escHtml(text.slice(cursor));
  if (!hlHtml) hlHtml = escHtml(text);
  let replaceResult = '';
  if (replaceMode) {
    try { replaceResult = text.replace(new RegExp(pattern, flagsStr), replaceStr); } catch {}
  }
  return { matches, error: null, hlHtml, replaceResult };
}

/* ── Main component ──────────────────────────────────────────── */
function RegexTesterContent() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';

  const [pattern, setPattern]       = useState('\\b[A-Z][a-z]+\\b');
  const [flagsArr, setFlagsArr]     = useState(['g']);
  const [testText, setTestText]     = useState(INITIAL_TEXT);
  const [replaceMode, setReplaceMode] = useState(false);
  const [replaceStr, setReplaceStr] = useState('');
  const [activeIdx, setActiveIdx]   = useState(-1);
  const [presetsOpen, setPresetsOpen] = useState(true);
  const [cheatOpen, setCheatOpen]   = useState(false);

  const flagsStr = ['g', 'i', 'm', 's'].filter(f => flagsArr.includes(f)).join('');

  const { matches, error, hlHtml, replaceResult } = useMemo(
    () => compute(pattern, flagsStr, testText, replaceStr, replaceMode),
    [pattern, flagsStr, testText, replaceStr, replaceMode]
  );

  const hlRef   = useRef(null);
  const listRef = useRef(null);

  // Reset active when matches change
  useEffect(() => { setActiveIdx(-1); }, [hlHtml]);

  // Sync .active class on marks
  useEffect(() => {
    if (!hlRef.current) return;
    hlRef.current.querySelectorAll('mark').forEach(el => {
      el.classList.toggle('active', +el.dataset.i === activeIdx);
    });
    if (activeIdx >= 0) {
      const mark = hlRef.current.querySelector(`mark[data-i="${activeIdx}"]`);
      if (mark) mark.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    }
  }, [activeIdx, hlHtml]);

  // Scroll match list item into view
  useEffect(() => {
    if (!listRef.current || activeIdx < 0) return;
    const item = listRef.current.querySelector(`[data-i="${activeIdx}"]`);
    if (item) item.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
  }, [activeIdx]);

  const toggleFlag = (f) =>
    setFlagsArr(prev => prev.includes(f) ? prev.filter(x => x !== f) : [...prev, f]);

  const applyPreset = (p) => {
    setPattern(p.pat);
    setTestText(p.txt);
    setFlagsArr(p.fl.split(''));
  };

  /* ── Derived styles ── */
  const surface  = dark ? '#161b22' : '#ffffff';
  const surface2 = dark ? '#0d1117' : '#f8faff';
  const border   = dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)';
  const textC    = dark ? 'rgba(255,255,255,0.82)' : '#1f2937';
  const text2C   = dark ? '#8b949e' : '#6b7280';
  const accentC  = dark ? '#6fa3ff' : '#4f80ff';

  const cardStyle = {
    background: surface,
    border: `1px solid ${border}`,
    borderRadius: 14,
    padding: '1rem',
    flexShrink: 0,
  };

  const labelStyle = {
    fontSize: '0.67rem', fontWeight: 700, letterSpacing: '0.14em',
    textTransform: 'uppercase', color: text2C, marginBottom: '0.6rem',
  };

  const FLAG_META = [
    { f: 'g', label: 'global',      desc: 'Find all matches' },
    { f: 'i', label: 'ignore case', desc: 'Case-insensitive matching' },
    { f: 'm', label: 'multiline',   desc: '^ and $ match line boundaries' },
    { f: 's', label: 'dotall',      desc: '. matches newlines too' },
  ];

  return (
    <div className={styles.toolPage}>

      {/* ── Toolbar ── */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>Regex Tester</span>

        {matches.length > 0 && !error && (
          <span style={{
            fontSize: '0.77rem', fontWeight: 700, padding: '2px 10px',
            borderRadius: 999,
            background: dark ? 'rgba(245,158,11,0.15)' : 'rgba(245,158,11,0.12)',
            color: dark ? '#fbbf24' : '#b45309',
            border: `1px solid rgba(245,158,11,0.3)`,
          }}>
            {matches.length} match{matches.length !== 1 ? 'es' : ''}
          </span>
        )}

        {error && (
          <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
            ⚠ {error}
          </span>
        )}

        <label style={{
          display: 'flex', alignItems: 'center', gap: '0.45rem',
          fontSize: '0.8rem', color: text2C, cursor: 'pointer',
          userSelect: 'none', marginLeft: 'auto',
        }}>
          <input
            type="checkbox"
            checked={replaceMode}
            onChange={e => setReplaceMode(e.target.checked)}
            style={{ accentColor: accentC, width: 14, height: 14, cursor: 'pointer' }}
          />
          Replace mode
        </label>

        <button
          className={`${styles.tBtn} ${styles.tBtnDanger}`}
          onClick={() => { setPattern(''); setTestText(''); }}
          disabled={!pattern && !testText}>
          ✕ Clear
        </button>
        <ShortcutHint shortcuts={[
          { note: 'Type a pattern — matches are highlighted automatically as you type.' },
        ]} />
      </div>

      {/* ── Scrollable content ── */}
      <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', paddingBottom: '1rem' }}>

        {/* Pattern card */}
        <div style={cardStyle}>
          <div style={labelStyle}>Pattern</div>

          {/* /pattern/flags input row */}
          <div style={{
            display: 'flex', alignItems: 'center',
            background: surface2,
            border: `1.5px solid ${error ? '#ef4444' : pattern ? `${accentC}66` : border}`,
            borderRadius: 9, padding: '0 0.85rem',
          }}>
            <span style={{ fontFamily: 'Consolas,"Courier New",monospace', fontSize: '1.2rem', fontWeight: 300, color: text2C, userSelect: 'none' }}>/</span>
            <input
              type="text"
              value={pattern}
              onChange={e => setPattern(e.target.value)}
              placeholder="[a-z]+"
              spellCheck={false}
              autoComplete="off"
              style={{
                flex: 1, minWidth: 0, background: 'transparent', border: 'none', outline: 'none',
                fontFamily: 'Consolas,"Courier New",monospace', fontSize: '0.95rem',
                color: textC, padding: '0.62rem 0.35rem',
              }}
            />
            <span style={{ fontFamily: 'Consolas,"Courier New",monospace', fontSize: '1.2rem', fontWeight: 300, color: text2C, userSelect: 'none' }}>/</span>
            <span style={{ fontFamily: 'Consolas,"Courier New",monospace', fontSize: '0.85rem', color: accentC, minWidth: '2ch', marginLeft: 4 }}>{flagsStr}</span>
          </div>

          {/* Flag toggles */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', marginTop: '0.65rem', flexWrap: 'wrap' }}>
            {FLAG_META.map(({ f, label, desc }) => {
              const on = flagsArr.includes(f);
              return (
                <button key={f} title={desc} onClick={() => toggleFlag(f)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                    padding: '0.26rem 0.68rem', borderRadius: 6,
                    border: `1px solid ${on ? accentC : border}`,
                    background: on ? `${accentC}18` : surface,
                    color: on ? accentC : text2C,
                    fontFamily: 'Consolas,"Courier New",monospace',
                    fontSize: '0.78rem', fontWeight: 600, cursor: 'pointer',
                  }}>
                  <em>{f}</em> {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Two-column: test string + results */}
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>

          {/* Test string pane */}
          <div className={styles.pane} style={{ flex: 1, minWidth: 260 }}>
            <div className={styles.paneHeader}>
              <span style={{ color: '#4f80ff' }}>●</span> test string
            </div>
            <div className={styles.paneBody} style={{ padding: '0.75rem 1rem' }}>
              <textarea
                value={testText}
                onChange={e => setTestText(e.target.value)}
                placeholder="Enter text to test against…"
                spellCheck={false}
                style={{
                  width: '100%', height: '100%', minHeight: 180, resize: 'none',
                  outline: 'none', border: 'none', background: 'transparent',
                  fontFamily: 'Consolas,"Courier New",monospace', fontSize: '0.85rem',
                  lineHeight: 1.7, color: textC,
                }}
              />
            </div>
          </div>

          {/* Results pane */}
          <div className={styles.pane} style={{ flex: 1.5, minWidth: 260 }}>
            <div className={styles.paneHeader}>
              <span style={{ color: '#c77dff' }}>●</span> results
              {matches.length > 0 && (
                <span style={{
                  marginLeft: 'auto', fontSize: '0.68rem', fontWeight: 700,
                  color: dark ? '#fbbf24' : '#b45309',
                  background: 'rgba(245,158,11,0.12)', borderRadius: 999, padding: '1px 8px',
                }}>
                  {matches.length}
                </span>
              )}
            </div>
            <div className={styles.paneBody} style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.7rem' }}>

              {/* Highlighted output */}
              <div style={labelStyle}>highlighted output</div>
              <div
                ref={hlRef}
                className={styles.regexHL}
                dangerouslySetInnerHTML={{ __html: hlHtml }}
                onClick={e => {
                  const mark = e.target.closest('mark');
                  if (mark) setActiveIdx(+mark.dataset.i);
                }}
                style={{
                  fontFamily: 'Consolas,"Courier New",monospace', fontSize: '0.865rem',
                  whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.85,
                  minHeight: 56, padding: '0.7rem 0.9rem',
                  background: surface2, border: `1px solid ${border}`,
                  borderRadius: 9, color: textC, cursor: 'default',
                }}
              />

              {/* Match list */}
              {matches.length > 0 && (
                <>
                  <div style={labelStyle}>match list</div>
                  <div ref={listRef} style={{ display: 'flex', flexDirection: 'column', gap: '0.38rem', maxHeight: 240, overflowY: 'auto' }}>
                    {matches.map((m, i) => {
                      const active = i === activeIdx;
                      const hasG = m.groups.some(g => g !== undefined);
                      return (
                        <div key={i} data-i={i} onClick={() => setActiveIdx(i)}
                          style={{
                            display: 'flex', alignItems: 'flex-start', gap: '0.6rem',
                            padding: '0.5rem 0.72rem', borderRadius: 8, cursor: 'pointer',
                            border: `1px solid ${active ? '#f59e0b' : border}`,
                            background: active ? 'rgba(245,158,11,0.09)' : surface,
                          }}>
                          <span style={{ fontSize: '0.68rem', fontWeight: 700, color: text2C, minWidth: 22, textAlign: 'right', marginTop: 2, flexShrink: 0 }}>
                            #{i + 1}
                          </span>
                          <div style={{ flex: 1, minWidth: 0 }}>
                            <div style={{ fontFamily: 'Consolas,monospace', fontSize: '0.82rem', fontWeight: 600, color: textC, wordBreak: 'break-all' }}>
                              {m.val || '(empty)'}
                            </div>
                            {hasG && (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.28rem', marginTop: '0.28rem' }}>
                                {m.groups.map((g, gi) => (
                                  <span key={gi} style={{
                                    fontFamily: 'Consolas,monospace', fontSize: '0.67rem', fontWeight: 600,
                                    padding: '1px 6px', borderRadius: 4,
                                    background: `${accentC}18`, color: accentC,
                                    border: `1px solid ${accentC}40`,
                                  }}>
                                    {gi + 1}: {g ?? '—'}
                                  </span>
                                ))}
                              </div>
                            )}
                          </div>
                          <span style={{ fontSize: '0.71rem', color: text2C, whiteSpace: 'nowrap', flexShrink: 0, marginTop: 2 }}>
                            {m.start}–{m.end}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}

              {!matches.length && !error && (
                <p style={{ fontSize: '0.8rem', color: text2C, fontStyle: 'italic', margin: 0 }}>
                  {pattern ? 'No matches found.' : 'Enter a pattern to see matches.'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Replace card */}
        {replaceMode && (
          <div style={cardStyle}>
            <div style={labelStyle}>Replacement</div>
            <input
              type="text"
              value={replaceStr}
              onChange={e => setReplaceStr(e.target.value)}
              placeholder="Use $1…$9 for groups, $& for full match, $` before, $' after"
              spellCheck={false}
              style={{
                width: '100%', background: surface2,
                border: `1.5px solid ${border}`, borderRadius: 9,
                padding: '0.62rem 0.9rem',
                fontFamily: 'Consolas,"Courier New",monospace', fontSize: '0.875rem',
                color: textC, outline: 'none',
              }}
            />
            <div style={{ marginTop: '0.85rem' }}>
              <div style={labelStyle}>Result</div>
              <div style={{
                fontFamily: 'Consolas,"Courier New",monospace', fontSize: '0.865rem',
                whiteSpace: 'pre-wrap', wordBreak: 'break-all', lineHeight: 1.75,
                padding: '0.65rem 0.9rem', background: surface2,
                border: `1px solid ${border}`, borderRadius: 9, color: textC,
              }}>
                {replaceResult || '—'}
              </div>
            </div>
          </div>
        )}

        {/* Presets card */}
        <div style={cardStyle}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setPresetsOpen(v => !v)}>
            <div style={labelStyle}>Preset Patterns</div>
            <span style={{ fontSize: '0.75rem', color: text2C, transition: 'transform .2s', display: 'block', transform: presetsOpen ? 'none' : 'rotate(-90deg)' }}>▾</span>
          </div>
          {presetsOpen && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(160px, 100%), 1fr))', gap: '0.4rem', marginTop: '0.75rem' }}>
              {PRESETS.map(p => (
                <button key={p.name} onClick={() => applyPreset(p)}
                  style={{
                    padding: '0.5rem 0.75rem', borderRadius: 8,
                    border: `1px solid ${border}`, background: surface,
                    color: textC, fontSize: '0.8rem', textAlign: 'left',
                    cursor: 'pointer', display: 'flex', flexDirection: 'column', gap: 3,
                  }}>
                  <span style={{ fontWeight: 700, fontSize: '0.79rem' }}>{p.name}</span>
                  <span style={{ fontFamily: 'Consolas,monospace', fontSize: '0.65rem', color: text2C, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    /{p.pat.slice(0, 26)}{p.pat.length > 26 ? '…' : ''}/{p.fl}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Cheatsheet card */}
        <div style={cardStyle}>
          <div
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', cursor: 'pointer', userSelect: 'none' }}
            onClick={() => setCheatOpen(v => !v)}>
            <div style={labelStyle}>Quick Cheatsheet</div>
            <span style={{ fontSize: '0.75rem', color: text2C, transition: 'transform .2s', display: 'block', transform: cheatOpen ? 'none' : 'rotate(-90deg)' }}>▾</span>
          </div>
          {cheatOpen && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(190px, 100%), 1fr))', gap: '0.38rem', marginTop: '0.75rem' }}>
              {CHEAT.map(([sym, desc]) => (
                <div key={sym} style={{
                  display: 'flex', alignItems: 'flex-start', gap: '0.5rem',
                  padding: '0.38rem 0.6rem', borderRadius: 7,
                  background: surface2, border: `1px solid ${border}`,
                }}>
                  <span style={{ fontFamily: 'Consolas,monospace', fontSize: '0.8rem', fontWeight: 700, color: accentC, minWidth: 58, flexShrink: 0 }}>{sym}</span>
                  <span style={{ fontSize: '0.76rem', color: text2C, lineHeight: 1.4 }}>{desc}</span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
}

export default function RegexTester() {
  return (
    <Layout title="Regex Tester | Orbit" description="Free online regular expression tester. Test, debug, and visualize regex patterns with live match highlighting, replace mode, flag support, and a built-in cheatsheet.">
      <RegexTesterContent />
    </Layout>
  );
}
