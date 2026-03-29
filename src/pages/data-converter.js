import React, { useState, useCallback, useEffect } from 'react';
import Layout from '@theme/Layout';
import { toast, ToastContainer } from 'react-toastify';
import { useColorMode } from '@docusaurus/theme-common';
import Editor from '@monaco-editor/react';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../css/style.module.css';

/* ─────────────────────────────────────────────
   Monaco theme helpers
───────────────────────────────────────────── */
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

/* ─────────────────────────────────────────────
   Format definitions
───────────────────────────────────────────── */
const FORMATS = ['JSON', 'YAML', 'Properties', 'TOML', 'XML'];

const FORMAT_META = {
  JSON:       { ext: 'json',       monaco: 'json',  label: 'JSON',       color: '#c77dff' },
  YAML:       { ext: 'yaml',       monaco: 'yaml',  label: 'YAML',       color: '#4ade80' },
  Properties: { ext: 'properties', monaco: 'ini',   label: '.properties',color: '#f59e42' },
  TOML:       { ext: 'toml',       monaco: 'ini',   label: 'TOML',       color: '#f87171' },
  XML:        { ext: 'xml',        monaco: 'xml',   label: 'XML',        color: '#38bdf8' },
};

/* ─────────────────────────────────────────────
   JSON ↔ Plain Object  (native)
───────────────────────────────────────────── */
function parseJSON(text) {
  return JSON.parse(text);
}
function serializeJSON(obj) {
  return JSON.stringify(obj, null, 2);
}

/* ─────────────────────────────────────────────
   YAML  (pure-JS, handles common subset)
───────────────────────────────────────────── */
function parseYAML(text) {
  const lines = text.split('\n');
  const root = {};
  const stack = [{ indent: -1, obj: root }];

  function setValue(obj, key, val) {
    obj[key] = val;
  }

  let i = 0;
  while (i < lines.length) {
    const raw = lines[i];
    i++;
    const trimmed = raw.trimEnd();
    if (!trimmed || trimmed.trimStart().startsWith('#')) continue;

    const indent = trimmed.length - trimmed.trimStart().length;
    const content = trimmed.trimStart();

    // Pop stack to matching indent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop();
    }
    const parent = stack[stack.length - 1].obj;

    // Sequence item
    if (content.startsWith('- ')) {
      const keyInParent = Object.keys(parent)[Object.keys(parent).length - 1];
      if (!Array.isArray(parent[keyInParent])) parent[keyInParent] = [];
      const val = parseYAMLValue(content.slice(2).trim());
      parent[keyInParent].push(val);
      continue;
    }

    // Key: value
    const colonIdx = content.indexOf(':');
    if (colonIdx === -1) continue;
    const key = content.slice(0, colonIdx).trim();
    const rest = content.slice(colonIdx + 1).trim();

    if (rest === '' || rest === '|' || rest === '>') {
      // Nested object or multiline — create child object
      const child = {};
      setValue(parent, key, child);
      stack.push({ indent, obj: child });
    } else {
      setValue(parent, key, parseYAMLValue(rest));
    }
  }
  return root;
}

function parseYAMLValue(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v === 'null' || v === '~') return null;
  if (!isNaN(v) && v !== '') return Number(v);
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    return v.slice(1, -1);
  }
  return v;
}

function serializeYAML(obj, indent = 0) {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return 'null';
  if (typeof obj !== 'object') {
    if (typeof obj === 'string') {
      if (/[:#\[\]{},&*?|<>=!%@`]/.test(obj) || obj.includes('\n') || obj === '' || /^(true|false|null|~)$/i.test(obj)) {
        return `"${obj.replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`;
      }
      return obj;
    }
    return String(obj);
  }
  if (Array.isArray(obj)) {
    if (obj.length === 0) return '[]';
    return obj.map(item => {
      const val = serializeYAML(item, indent + 1);
      return `${pad}- ${val}`;
    }).join('\n');
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return '{}';
  return keys.map(key => {
    const val = obj[key];
    if (val !== null && typeof val === 'object') {
      const nested = serializeYAML(val, indent + 1);
      if (Array.isArray(val) && val.length > 0) {
        return `${pad}${key}:\n${nested}`;
      }
      if (!Array.isArray(val) && Object.keys(val).length > 0) {
        return `${pad}${key}:\n${nested}`;
      }
      return `${pad}${key}: ${nested}`;
    }
    return `${pad}${key}: ${serializeYAML(val, indent)}`;
  }).join('\n');
}

/* ─────────────────────────────────────────────
   .properties  (Java / Spring Boot style)
   Only works for flat key=value objects
───────────────────────────────────────────── */
function flatten(obj, prefix = '') {
  const out = {};
  for (const [k, v] of Object.entries(obj)) {
    const key = prefix ? `${prefix}.${k}` : k;
    if (v !== null && typeof v === 'object' && !Array.isArray(v)) {
      Object.assign(out, flatten(v, key));
    } else if (Array.isArray(v)) {
      v.forEach((item, idx) => {
        if (item !== null && typeof item === 'object') {
          Object.assign(out, flatten(item, `${key}[${idx}]`));
        } else {
          out[`${key}[${idx}]`] = item;
        }
      });
    } else {
      out[key] = v;
    }
  }
  return out;
}

function unflatten(flat) {
  const result = {};
  for (const [key, value] of Object.entries(flat)) {
    const parts = key.replace(/\[(\d+)\]/g, '.$1').split('.');
    let cur = result;
    for (let i = 0; i < parts.length - 1; i++) {
      const part = parts[i];
      const nextPart = parts[i + 1];
      if (!(part in cur)) {
        cur[part] = /^\d+$/.test(nextPart) ? [] : {};
      }
      cur = cur[part];
    }
    const last = parts[parts.length - 1];
    cur[last] = value;
  }
  return result;
}

function parseProperties(text) {
  const flat = {};
  for (const line of text.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('!')) continue;
    const eqIdx = trimmed.indexOf('=');
    const colonIdx = trimmed.indexOf(':');
    let sepIdx = -1;
    if (eqIdx !== -1 && colonIdx !== -1) sepIdx = Math.min(eqIdx, colonIdx);
    else if (eqIdx !== -1) sepIdx = eqIdx;
    else if (colonIdx !== -1) sepIdx = colonIdx;
    if (sepIdx === -1) continue;
    const key = trimmed.slice(0, sepIdx).trim();
    const val = trimmed.slice(sepIdx + 1).trim();
    flat[key] = parseYAMLValue(val);
  }
  return unflatten(flat);
}

function serializeProperties(obj) {
  const flat = flatten(obj);
  return Object.entries(flat).map(([k, v]) => {
    const val = v === null ? '' : String(v);
    return `${k}=${val}`;
  }).join('\n');
}

/* ─────────────────────────────────────────────
   TOML  (common subset)
───────────────────────────────────────────── */
function parseTOML(text) {
  const lines = text.split('\n');
  const root = {};
  let current = root;
  let currentPath = [];

  for (const raw of lines) {
    const line = raw.trim();
    if (!line || line.startsWith('#')) continue;

    // Table header [section] or [[array-of-tables]]
    if (line.startsWith('[[') && line.endsWith(']]')) {
      const path = line.slice(2, -2).trim().split('.');
      currentPath = path;
      // Navigate/create path, push new object to array
      let obj = root;
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) obj[path[i]] = {};
        obj = obj[path[i]];
      }
      const last = path[path.length - 1];
      if (!obj[last]) obj[last] = [];
      const newItem = {};
      obj[last].push(newItem);
      current = newItem;
      continue;
    }
    if (line.startsWith('[') && line.endsWith(']')) {
      const path = line.slice(1, -1).trim().split('.');
      currentPath = path;
      let obj = root;
      for (const part of path) {
        if (!obj[part]) obj[part] = {};
        obj = obj[part];
      }
      current = obj;
      continue;
    }

    // key = value
    const eqIdx = line.indexOf('=');
    if (eqIdx === -1) continue;
    const key = line.slice(0, eqIdx).trim();
    const valStr = line.slice(eqIdx + 1).trim();
    current[key] = parseTOMLValue(valStr);
  }
  return root;
}

function parseTOMLValue(v) {
  if (v === 'true') return true;
  if (v === 'false') return false;
  if (v.startsWith('"') && v.endsWith('"')) return v.slice(1, -1).replace(/\\n/g, '\n').replace(/\\t/g, '\t').replace(/\\"/g, '"');
  if (v.startsWith("'") && v.endsWith("'")) return v.slice(1, -1);
  if (v.startsWith('[') && v.endsWith(']')) {
    const inner = v.slice(1, -1).trim();
    if (!inner) return [];
    return inner.split(',').map(s => parseTOMLValue(s.trim()));
  }
  if (!isNaN(v) && v !== '') return Number(v);
  return v;
}

function serializeTOML(obj, prefix = '') {
  const scalars = [];
  const tables = [];
  const arrayTables = [];

  for (const [key, val] of Object.entries(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key;
    if (Array.isArray(val) && val.length > 0 && typeof val[0] === 'object' && val[0] !== null) {
      arrayTables.push({ key, fullKey, val });
    } else if (val !== null && typeof val === 'object' && !Array.isArray(val)) {
      tables.push({ key, fullKey, val });
    } else {
      scalars.push({ key, val });
    }
  }

  let out = '';

  if (prefix && (scalars.length > 0)) {
    out += `[${prefix}]\n`;
  }
  for (const { key, val } of scalars) {
    out += `${key} = ${serializeTOMLValue(val)}\n`;
  }
  if (scalars.length > 0) out += '\n';

  for (const { fullKey, val } of tables) {
    out += serializeTOML(val, fullKey);
  }

  for (const { fullKey, val } of arrayTables) {
    for (const item of val) {
      out += `[[${fullKey}]]\n`;
      for (const [k, v] of Object.entries(item)) {
        if (v !== null && typeof v === 'object') continue; // skip nested for simplicity
        out += `${k} = ${serializeTOMLValue(v)}\n`;
      }
      out += '\n';
    }
  }

  return out;
}

function serializeTOMLValue(v) {
  if (v === null || v === undefined) return '""';
  if (typeof v === 'boolean') return String(v);
  if (typeof v === 'number') return String(v);
  if (Array.isArray(v)) {
    return `[${v.map(serializeTOMLValue).join(', ')}]`;
  }
  const s = String(v);
  return `"${s.replace(/\\/g, '\\\\').replace(/"/g, '\\"').replace(/\n/g, '\\n').replace(/\t/g, '\\t')}"`;
}

/* ─────────────────────────────────────────────
   XML  (simple recursive)
───────────────────────────────────────────── */
function parseXML(text) {
  // Use browser DOMParser
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/xml');
  const errorNode = doc.querySelector('parsererror');
  if (errorNode) throw new Error(errorNode.textContent);
  function nodeToObj(node) {
    if (node.nodeType === Node.TEXT_NODE) {
      const t = node.textContent.trim();
      return t || undefined;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
      const children = Array.from(node.childNodes).filter(n =>
        n.nodeType === Node.ELEMENT_NODE || (n.nodeType === Node.TEXT_NODE && n.textContent.trim())
      );
      if (children.length === 0) {
        const t = node.textContent.trim();
        return t === '' ? null : parseYAMLValue(t);
      }
      if (children.every(c => c.nodeType === Node.TEXT_NODE)) {
        const t = node.textContent.trim();
        return t === '' ? null : parseYAMLValue(t);
      }
      const obj = {};
      for (const child of children) {
        if (child.nodeType !== Node.ELEMENT_NODE) continue;
        const key = child.tagName;
        const val = nodeToObj(child);
        if (key in obj) {
          if (!Array.isArray(obj[key])) obj[key] = [obj[key]];
          obj[key].push(val);
        } else {
          obj[key] = val;
        }
      }
      return obj;
    }
    return undefined;
  }
  const root = doc.documentElement;
  return { [root.tagName]: nodeToObj(root) };
}

function serializeXML(obj, rootTag = 'root', indent = 0) {
  const pad = '  '.repeat(indent);
  if (obj === null || obj === undefined) return `${pad}<${rootTag}/>`;
  if (typeof obj !== 'object') {
    return `${pad}<${rootTag}>${escapeXML(String(obj))}</${rootTag}>`;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => serializeXML(item, rootTag, indent)).join('\n');
  }
  const keys = Object.keys(obj);
  if (keys.length === 0) return `${pad}<${rootTag}/>`;
  const inner = keys.map(key => serializeXML(obj[key], key, indent + 1)).join('\n');
  return `${pad}<${rootTag}>\n${inner}\n${pad}</${rootTag}>`;
}

function escapeXML(s) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function buildXMLDoc(obj) {
  const keys = Object.keys(obj);
  if (keys.length === 1) {
    const rootTag = keys[0];
    const inner = obj[rootTag];
    if (inner !== null && typeof inner === 'object' && !Array.isArray(inner)) {
      const innerKeys = Object.keys(inner);
      const innerXML = innerKeys.map(k => serializeXML(inner[k], k, 1)).join('\n');
      return `<?xml version="1.0" encoding="UTF-8"?>\n<${rootTag}>\n${innerXML}\n</${rootTag}>`;
    }
    return `<?xml version="1.0" encoding="UTF-8"?>\n${serializeXML(inner, rootTag, 0)}`;
  }
  const inner = Object.keys(obj).map(k => serializeXML(obj[k], k, 1)).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<root>\n${inner}\n</root>`;
}

/* ─────────────────────────────────────────────
   Master parse / serialize
───────────────────────────────────────────── */
function parse(format, text) {
  switch (format) {
    case 'JSON':       return parseJSON(text);
    case 'YAML':       return parseYAML(text);
    case 'Properties': return parseProperties(text);
    case 'TOML':       return parseTOML(text);
    case 'XML':        return parseXML(text);
    default: throw new Error(`Unknown format: ${format}`);
  }
}

function serialize(format, obj) {
  switch (format) {
    case 'JSON':       return serializeJSON(obj);
    case 'YAML':       return serializeYAML(obj);
    case 'Properties': return serializeProperties(obj);
    case 'TOML':       return serializeTOML(obj);
    case 'XML':        return buildXMLDoc(obj);
    default: throw new Error(`Unknown format: ${format}`);
  }
}

/* ─────────────────────────────────────────────
   Component
───────────────────────────────────────────── */
const SAMPLE_JSON = `{
  "app": {
    "name": "DevDocs",
    "version": "2.0.0",
    "debug": false
  },
  "server": {
    "host": "localhost",
    "port": 8080,
    "ssl": true
  },
  "tags": ["tools", "formatter", "converter"],
  "author": null
}`;

function DataConverterContent() {
  const { colorMode } = useColorMode();
  const [input, setInput]     = useState(SAMPLE_JSON);
  const [output, setOutput]   = useState('');
  const [fromFmt, setFromFmt] = useState('JSON');
  const [toFmt, setToFmt]     = useState('YAML');
  const [copied, setCopied]   = useState(false);
  const [error, setError]     = useState('');

  const editorTheme = colorMode === 'dark' ? 'site-dark' : 'site-light';

  const editorOptions = {
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

  const convert = useCallback(() => {
    if (!input.trim()) { toast.error('Input is empty.'); return; }
    try {
      const obj = parse(fromFmt, input.trim());
      const result = serialize(toFmt, obj);
      setOutput(result);
      setError('');
    } catch (e) {
      setError(e.message);
      toast.error(`Conversion failed: ${e.message}`);
    }
  }, [input, fromFmt, toFmt]);

  // Auto-convert when format or input changes
  useEffect(() => {
    if (!input.trim()) { setOutput(''); setError(''); return; }
    try {
      const obj = parse(fromFmt, input.trim());
      const result = serialize(toFmt, obj);
      setOutput(result);
      setError('');
    } catch (e) {
      setError(e.message);
      setOutput('');
    }
  }, [input, fromFmt, toFmt]);

  // Initial sample conversion
  useEffect(() => { convert(); }, []); // eslint-disable-line

  const swap = () => {
    setFromFmt(toFmt);
    setToFmt(fromFmt);
    setInput(output || input);
    setOutput('');
  };

  const copyOutput = async () => {
    if (!output) return;
    try {
      await navigator.clipboard.writeText(output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch { toast.error('Copy failed.'); }
  };

  const clearAll = () => { setInput(''); setOutput(''); setError(''); };

  const downloadOutput = () => {
    if (!output) return;
    const ext = FORMAT_META[toFmt].ext;
    const blob = new Blob([output], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `converted.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Suppress ResizeObserver noise from Monaco
  useEffect(() => {
    const suppress = (e) => {
      if (e.message === 'ResizeObserver loop completed with undelivered notifications.') {
        e.stopImmediatePropagation();
      }
    };
    window.addEventListener('error', suppress);
    return () => window.removeEventListener('error', suppress);
  }, []);

  const inputMeta  = FORMAT_META[fromFmt];
  const outputMeta = FORMAT_META[toFmt];

  return (
    <div className={styles.toolPage}>
      {/* ── Toolbar ── */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>Data Converter</span>

        {/* From selector */}
        <span className={styles.toolBarMeta} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ opacity: 0.55, fontSize: '0.75rem' }}>from</span>
          {FORMATS.map(f => (
            <button
              key={f}
              className={`${styles.tBtn} ${fromFmt === f ? styles.tBtnPrimary : styles.tBtnGhost}`}
              style={fromFmt === f ? { color: '#fff', background: inputMeta.color, borderColor: inputMeta.color } : {}}
              onClick={() => { if (f !== toFmt) setFromFmt(f); }}
              disabled={f === toFmt}
            >
              {FORMAT_META[f].label}
            </button>
          ))}
        </span>

        <div className={styles.toolBarDivider} />

        {/* Swap */}
        <button className={`${styles.tBtn} ${styles.tBtnGhost}`} onClick={swap} title="Swap input ↔ output">
          ⇄ Swap
        </button>

        <div className={styles.toolBarDivider} />

        {/* To selector */}
        <span className={styles.toolBarMeta} style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ opacity: 0.55, fontSize: '0.75rem' }}>to</span>
          {FORMATS.map(f => (
            <button
              key={f}
              className={`${styles.tBtn} ${toFmt === f ? styles.tBtnPrimary : styles.tBtnGhost}`}
              style={toFmt === f ? { color: '#fff', background: outputMeta.color, borderColor: outputMeta.color } : {}}
              onClick={() => { if (f !== fromFmt) setToFmt(f); }}
              disabled={f === fromFmt}
            >
              {FORMAT_META[f].label}
            </button>
          ))}
        </span>

        <div className={styles.toolBarDivider} />

        <button className={`${styles.tBtn} ${styles.tBtnGhost}`} onClick={clearAll}>✕ Clear</button>
        <button className={`${styles.tBtn} ${styles.tBtnGhost} ${copied ? styles.tBtnSuccess : ''}`} onClick={copyOutput} disabled={!output}>
          {copied ? '✓ Copied!' : '⎘ Copy'}
        </button>
        <button className={`${styles.tBtn} ${styles.tBtnGhost}`} onClick={downloadOutput} disabled={!output} title="Download output">
          ↓ Download
        </button>
      </div>

      {/* ── Split pane ── */}
      <div className={styles.splitPane}>
        {/* Input pane */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span style={{ color: inputMeta.color }}>●</span>
            <span style={{ fontWeight: 700, color: inputMeta.color }}>{inputMeta.label}</span>
            <span style={{ opacity: 0.5, fontSize: '0.72rem', marginLeft: '0.25rem' }}>input</span>
          </div>
          <div className={styles.paneBody}>
            <Editor
              language={inputMeta.monaco}
              value={input}
              theme={editorTheme}
              beforeMount={defineEditorThemes}
              onChange={(v) => setInput(v ?? '')}
              options={editorOptions}
            />
          </div>
        </div>

        {/* Output pane */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span style={{ color: outputMeta.color }}>●</span>
            <span style={{ fontWeight: 700, color: outputMeta.color }}>{outputMeta.label}</span>
            <span style={{ opacity: 0.5, fontSize: '0.72rem', marginLeft: '0.25rem' }}>output</span>
            {error && (
              <span style={{
                marginLeft: 'auto', fontSize: '0.72rem', color: '#b91c1c', fontWeight: 600,
                background: 'rgba(239,68,68,0.1)', borderRadius: '4px', padding: '1px 6px',
                maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap'
              }} title={error}>
                ✕ {error}
              </span>
            )}
          </div>
          <div className={styles.paneBody}>
            <Editor
              language={outputMeta.monaco}
              value={output}
              theme={editorTheme}
              beforeMount={defineEditorThemes}
              options={{ ...editorOptions, readOnly: true }}
            />
          </div>
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default function DataConverter() {
  return (
    <Layout title="Data Converter" description="Convert between JSON, YAML, Properties, TOML, and XML in your browser">
      <DataConverterContent />
    </Layout>
  );
}
