import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import { toast, ToastContainer } from 'react-toastify';
import { useColorMode } from '@docusaurus/theme-common';
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

function JsonFormatterContent() {
  const { colorMode } = useColorMode();
  const [input, setInput] = useState(`
{
  "full_name":"Ayah Refai",
  "email":"alrefayayah@gmail.com"
}
    `);
  const [copied, setCopied] = useState(false);

  const lines = input ? input.split('\n').length : 0;
  const chars = input ? input.length : 0;

  const formatJSON = () => {
    try {
      if (input) {
        setInput(JSON.stringify(JSON.parse(input), null, 2));
      }
    } catch {
      toast.error('Invalid JSON — check your syntax and try again.');
    }
  };

  const minifyJSON = () => {
    try {
      if (input) {
        setInput(JSON.stringify(JSON.parse(input)));
      }
    } catch {
      toast.error('Invalid JSON — check your syntax and try again.');
    }
  };

  const copyToClipboard = async () => {
    if (!input) return;
    try {
      await navigator.clipboard.writeText(input);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error('Copy failed — try selecting the text manually.');
    }
  };

  return (
    <div className={styles.toolPage}>
      {/* Toolbar */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>JSON Formatter</span>

        <button className={`${styles.tBtn} ${styles.tBtnPrimary}`} onClick={formatJSON}>
          ⇄ Format
        </button>
        <button className={`${styles.tBtn} ${styles.tBtnGhost}`} onClick={minifyJSON}>
          ⊟ Minify
        </button>

        <div className={styles.toolBarDivider} />

        <button
          className={`${styles.tBtn} ${styles.tBtnGhost} ${copied ? styles.tBtnSuccess : ''}`}
          onClick={copyToClipboard}
          disabled={!input}
        >
          {copied ? '✓ Copied!' : '⎘ Copy'}
        </button>

        <div className={styles.toolBarDivider} />

        <span className={styles.toolBarMeta}>
          {lines > 0 ? `${lines} lines · ${chars} chars` : 'Paste JSON below'}
        </span>
      </div>

      {/* Editor pane */}
      <div className={styles.paneWide}>
        <div className={styles.paneHeader}>
          <span>●</span> editor
        </div>
        <div className={styles.paneBody}>
          <Editor
            language="json"
            value={input}
            theme={colorMode === 'dark' ? 'site-dark' : 'site-light'}
            beforeMount={defineEditorThemes}
            onChange={(v) => setInput(v ?? '')}
            options={{
              fontSize: 14,
              minimap: { enabled: false },
              lineNumbers: 'on',
              scrollBeyondLastLine: false,
              wordWrap: 'on',
              padding: { top: 12, bottom: 12 },
              renderLineHighlight: 'gutter',
              smoothScrolling: true,
            }}
          />
        </div>
      </div>

      <ToastContainer position="bottom-right" autoClose={3000} />
    </div>
  );
}

export default function JsonFormatter() {
  return (
    <Layout title="JSON Formatter" description="Format and minify JSON in your browser">
      <JsonFormatterContent />
    </Layout>
  );
}
