import React, { useState, useMemo } from 'react';
import Layout from '@theme/Layout';
import { toast, ToastContainer } from 'react-toastify';
import { useColorMode } from '@docusaurus/theme-common';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../css/style.module.css';

/* ── Base64url decode ───────────────────────────────────────── */
function b64urlDecode(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/');
  const pad = b64.padEnd(b64.length + (4 - (b64.length % 4)) % 4, '=');
  try   { return JSON.parse(atob(pad)); }
  catch { return atob(pad); }
}

function parseJWT(token) {
  const t = token.trim();
  const parts = t.split('.');
  if (parts.length !== 3)
    throw new Error('Invalid JWT — must have exactly 3 dot-separated parts');
  let header, payload;
  try { header  = b64urlDecode(parts[0]); } catch { throw new Error('Header is not valid base64url'); }
  try { payload = b64urlDecode(parts[1]); } catch { throw new Error('Payload is not valid base64url'); }
  return { header, payload, signature: parts[2], rawParts: parts };
}

/* ── Time helpers ───────────────────────────────────────────── */
function fmtTime(ts) {
  if (!ts) return null;
  return new Date(ts * 1000).toLocaleString();
}

function getExpStatus(exp) {
  if (!exp) return null;
  const diff = exp - Date.now() / 1000;
  if (diff < 0)   return { label: 'Expired',      color: '#f87171', bg: 'rgba(248,113,113,0.12)' };
  if (diff < 300) return { label: 'Expires soon', color: '#fbbf24', bg: 'rgba(251,191,36,0.12)'  };
  return           { label: 'Valid',               color: '#4ade80', bg: 'rgba(74,222,128,0.12)'  };
}

/* ── JSON syntax renderer ───────────────────────────────────── */
const KNOWN_CLAIMS = {
  iss: 'Issuer', sub: 'Subject', aud: 'Audience', exp: 'Expiry',
  nbf: 'Not Before', iat: 'Issued At', jti: 'JWT ID',
};

function JsonValue({ v, dark, claimKey }) {
  const isTimestamp = ['exp', 'nbf', 'iat'].includes(claimKey) && typeof v === 'number';
  const strColor  = dark ? '#86efac' : '#15803d';
  const numColor  = dark ? '#fbbf24' : '#b45309';
  const boolColor = dark ? '#f9a8d4' : '#9d174d';
  const nullColor = dark ? '#94a3b8' : '#6b7280';

  if (v === null)             return <span style={{ color: nullColor }}>null</span>;
  if (typeof v === 'boolean') return <span style={{ color: boolColor }}>{String(v)}</span>;
  if (typeof v === 'number') {
    return (
      <span>
        <span style={{ color: numColor }}>{v}</span>
        {isTimestamp && (
          <span style={{ color: nullColor, fontSize: '0.75em', marginLeft: 6 }}>
            ({fmtTime(v)})
          </span>
        )}
      </span>
    );
  }
  if (typeof v === 'string')  return <span style={{ color: strColor }}>"{v}"</span>;
  if (Array.isArray(v))       return <span style={{ color: nullColor }}>[{v.length > 0 ? v.join(', ') : 'empty'}]</span>;
  return <span style={{ color: nullColor }}>{'{...}'}</span>;
}

function JsonBlock({ obj, dark }) {
  if (!obj || typeof obj !== 'object') return <code>{String(obj)}</code>;
  const keyColor  = dark ? '#93b4ff' : '#1d4ed8';
  const divider   = dark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const claimHint = dark ? 'rgba(255,255,255,0.28)' : '#9ca3af';

  return (
    <div style={{ fontFamily: 'Consolas, "Courier New", monospace', fontSize: '0.84rem', lineHeight: 1.6 }}>
      {Object.entries(obj).map(([k, v]) => (
        <div key={k} style={{ display: 'flex', alignItems: 'baseline', gap: '0.5rem', padding: '0.28rem 0', borderBottom: `1px solid ${divider}`, flexWrap: 'wrap' }}>
          <span style={{ color: keyColor, fontWeight: 600, flexShrink: 0 }}>"{k}":</span>
          <JsonValue v={v} dark={dark} claimKey={k} />
          {KNOWN_CLAIMS[k] && (
            <span style={{ fontSize: '0.72em', color: claimHint, marginLeft: 'auto' }}>{KNOWN_CLAIMS[k]}</span>
          )}
        </div>
      ))}
    </div>
  );
}

/* ── Info chips ─────────────────────────────────────────────── */
const INFO_FIELDS = [
  { label: 'ALG',     get: d => d.header?.alg },
  { label: 'TYPE',    get: d => d.header?.typ },
  { label: 'ISSUER',  get: d => d.payload?.iss },
  { label: 'SUBJECT', get: d => d.payload?.sub },
  { label: 'ISSUED',  get: d => fmtTime(d.payload?.iat) },
  { label: 'EXPIRES', get: d => fmtTime(d.payload?.exp) },
];

/* ── Main component ─────────────────────────────────────────── */
const DEFAULT_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJ1c3ItMTIzNDU2IiwibmFtZSI6IkF5YWggQWwtUmVmYWkiLCJlbWFpbCI6ImFscmVmYXlheWFoQGdtYWlsLmNvbSIsInJvbGVzIjpbIkRFVkVMT1BFUiIsIlRFQU1fTEVBRCJdLCJpYXQiOjE3NDMwMDAwMDAsImV4cCI6MTc0MzA4NjQwMH0.dummy_signature_for_testing';

const PART_COLORS = ['#4f80ff', '#c77dff', '#6b7280'];
const PART_LABELS = ['header', 'payload', 'signature'];

function JwtDecoderContent() {
  const { colorMode } = useColorMode();
  const dark = colorMode === 'dark';
  const [token, setToken]               = useState(DEFAULT_TOKEN);
  const [copiedSection, setCopiedSection] = useState(null);

  const decoded = useMemo(() => {
    if (!token.trim()) return null;
    try   { return { ok: true,  ...parseJWT(token) }; }
    catch (e) { return { ok: false, error: e.message }; }
  }, [token]);

  const expStatus = decoded?.ok ? getExpStatus(decoded.payload?.exp) : null;
  const rawParts  = token.trim() ? token.trim().split('.') : [];

  const copy = async (text, key) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedSection(key);
      setTimeout(() => setCopiedSection(null), 2000);
    } catch { toast.error('Copy failed — try selecting manually.'); }
  };

  const paneStyle = {
    background: dark ? '#161b22' : '#ffffff',
    border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.07)'}`,
  };

  const chipStyle = (color) => ({
    background: dark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.03)',
    border:     `1px solid ${dark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)'}`,
    borderRadius: 10,
    padding: '0.45rem 0.85rem',
    display: 'flex',
    flexDirection: 'column',
    gap: '2px',
  });

  return (
    <div className={styles.toolPage}>

      {/* ── Toolbar ── */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>JWT Decoder</span>

        {expStatus && (
          <span style={{ fontSize: '0.77rem', fontWeight: 700, padding: '2px 10px',
            borderRadius: 999, background: expStatus.bg, color: expStatus.color,
            border: `1px solid ${expStatus.color}35` }}>
            ● {expStatus.label}
          </span>
        )}
        {decoded?.ok === false && (
          <span style={{ fontSize: '0.78rem', color: '#f87171', fontWeight: 600 }}>
            ⚠ {decoded.error}
          </span>
        )}

        <button className={`${styles.tBtn} ${styles.tBtnGhost}`}
          onClick={() => setToken('')} disabled={!token}>
          ✕ Clear
        </button>
      </div>

      {/* ── Token input ── */}
      <div style={{ ...paneStyle, borderRadius: 14, flexShrink: 0, maxHeight: '45%', overflow: 'auto' }}>
        <div className={styles.paneHeader}>
          <span style={{ color: '#c77dff' }}>●</span> jwt token
        </div>
        <div style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.55rem' }}>
          <textarea
            value={token}
            onChange={e => setToken(e.target.value)}
            placeholder="Paste your JWT here — e.g. eyJhbGciOi..."
            spellCheck={false}
            autoComplete="off"
            style={{
              width: '100%', height: 78, resize: 'none', outline: 'none',
              fontFamily: 'Consolas, "Courier New", monospace', fontSize: '0.82rem',
              lineHeight: 1.65, padding: '0.65rem 0.9rem', borderRadius: 8,
              background: dark ? '#0d1117' : '#f8faff',
              color: dark ? 'rgba(255,255,255,0.82)' : '#1f2937',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.09)' : 'rgba(0,0,0,0.1)'}`,
            }}
          />

          {/* Color-coded token breakdown */}
          {rawParts.length === 3 && (
            <div style={{
              display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 1,
              fontFamily: 'Consolas, monospace', fontSize: '0.7rem', lineHeight: 1.5,
              padding: '0.4rem 0.75rem', borderRadius: 8,
              background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
              border: `1px solid ${dark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.06)'}`,
              wordBreak: 'break-all',
              maxHeight: 80, overflow: 'hidden',
            }}>
              {rawParts.map((p, i) => (
                <React.Fragment key={i}>
                  {i > 0 && <span style={{ color: dark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)', margin: '0 1px' }}>.</span>}
                  <span style={{ color: PART_COLORS[i] }}>{p}</span>
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ── Decoded view ── */}
      {decoded?.ok && (
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minHeight: 0, gap: '1rem' }}>
          {/* Info chips */}
          <div style={{ display: 'flex', gap: '0.6rem', flexWrap: 'wrap', flexShrink: 0 }}>
            {INFO_FIELDS.map(f => {
              const val = f.get(decoded);
              if (!val) return null;
              return (
                <div key={f.label} style={chipStyle()}>
                  <span style={{ fontSize: '0.6rem', fontWeight: 700, letterSpacing: '0.12em',
                    textTransform: 'uppercase', color: '#528dff' }}>{f.label}</span>
                  <span style={{ fontSize: '0.8rem', fontWeight: 600,
                    color: dark ? 'rgba(255,255,255,0.85)' : '#1f2937' }}>{val}</span>
                </div>
              );
            })}
          </div>

          {/* Three decode panes */}
          <div className={styles.splitPane}>

            {/* Header */}
            <div className={styles.pane}>
              <div className={styles.paneHeader}>
                <span style={{ color: PART_COLORS[0] }}>●</span> {PART_LABELS[0]}
                <button
                  className={`${styles.tBtn} ${styles.tBtnGhost} ${copiedSection === 'hdr' ? styles.tBtnSuccess : ''}`}
                  style={{ marginLeft: 'auto', padding: '1px 8px', fontSize: '0.7rem' }}
                  onClick={() => copy(JSON.stringify(decoded.header, null, 2), 'hdr')}>
                  {copiedSection === 'hdr' ? '✓' : '⎘'}
                </button>
              </div>
              <div className={styles.paneBody} style={{ padding: '0.6rem 1rem' }}>
                <JsonBlock obj={decoded.header} dark={dark} />
              </div>
            </div>

            {/* Payload */}
            <div className={styles.pane} style={{ flex: 2 }}>
              <div className={styles.paneHeader}>
                <span style={{ color: PART_COLORS[1] }}>●</span> {PART_LABELS[1]}
                <button
                  className={`${styles.tBtn} ${styles.tBtnGhost} ${copiedSection === 'pld' ? styles.tBtnSuccess : ''}`}
                  style={{ marginLeft: 'auto', padding: '1px 8px', fontSize: '0.7rem' }}
                  onClick={() => copy(JSON.stringify(decoded.payload, null, 2), 'pld')}>
                  {copiedSection === 'pld' ? '✓' : '⎘'}
                </button>
              </div>
              <div className={styles.paneBody} style={{ padding: '0.6rem 1rem' }}>
                <JsonBlock obj={decoded.payload} dark={dark} />
              </div>
            </div>

            {/* Signature */}
            <div className={styles.pane}>
              <div className={styles.paneHeader}>
                <span style={{ color: PART_COLORS[2] }}>●</span> {PART_LABELS[2]}
                <button
                  className={`${styles.tBtn} ${styles.tBtnGhost} ${copiedSection === 'sig' ? styles.tBtnSuccess : ''}`}
                  style={{ marginLeft: 'auto', padding: '1px 8px', fontSize: '0.7rem' }}
                  onClick={() => copy(decoded.signature, 'sig')}>
                  {copiedSection === 'sig' ? '✓' : '⎘'}
                </button>
              </div>
              <div className={styles.paneBody} style={{ padding: '0.75rem 1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                <p style={{ fontSize: '0.78rem', color: '#6b7280', margin: 0, lineHeight: 1.6 }}>
                  The signature is used to verify the token hasn't been tampered with.
                  It cannot be validated client-side without the secret key.
                </p>
                <code style={{
                  display: 'block', wordBreak: 'break-all', fontSize: '0.76rem',
                  padding: '0.7rem', borderRadius: 8, lineHeight: 1.65, color: '#6b7280',
                  background: dark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.03)',
                  border: `1px solid ${dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)'}`,
                }}>
                  {decoded.signature}
                </code>
              </div>
            </div>

          </div>
        </div>
      )}

      {/* ── Empty state ── */}
      {!decoded && (
        <div className={styles.emptyState} style={{ flex: 1 }}>
          <div className={styles.emptyStateIcon}>🔑</div>
          <p style={{ fontSize: '0.92rem', fontWeight: 600 }}>Paste a JWT token above to decode it</p>
          <p style={{ fontSize: '0.82rem', opacity: 0.55 }}>
            Supports HS256, RS256, ES256 and all standard JWT formats
          </p>
        </div>
      )}

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default function JwtDecoder() {
  return (
    <Layout title="JWT Decoder" description="Decode and inspect JWT tokens instantly in your browser">
      <JwtDecoderContent />
    </Layout>
  );
}
