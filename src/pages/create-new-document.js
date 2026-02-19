import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import ReactMarkdown from 'react-markdown';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../css/style.module.css';

const INIT_VALUE = `# Welcome to the Markdown Editor

Write your **markdown** on the left, see the *live preview* on the right.

## Code Example

\`\`\`javascript
const greet = (name) => \`Hello, \${name}!\`;
console.log(greet('World'));
\`\`\`

## Features

- Live preview as you type
- Syntax highlighting in the editor
- Supports tables, code blocks, lists, and more

| Column A | Column B |
|---|---|
| Value 1  | Value 2  |
| Value 3  | Value 4  |

> Start editing to see your changes reflected instantly.
`;

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

function MarkdownEditorContent() {
  const { colorMode } = useColorMode();
  const [value, setValue] = useState(INIT_VALUE);

  const words = value ? value.trim().split(/\s+/).filter(Boolean).length : 0;
  const lines = value ? value.split('\n').length : 0;

  return (
    <div className={styles.toolPage}>
      {/* Toolbar */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>Markdown Editor</span>
        <div className={styles.toolBarDivider} />
        <span className={styles.toolBarMeta}>{lines} lines · {words} words</span>
      </div>

      {/* Split pane */}
      <div className={styles.splitPane}>
        {/* Left — Monaco editor */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span>✏</span> editor
          </div>
          <div className={styles.paneBody}>
            <Editor
              language="markdown"
              value={value}
              theme={colorMode === 'dark' ? 'site-dark' : 'site-light'}
              beforeMount={defineEditorThemes}
              onChange={(v) => setValue(v ?? '')}
              options={{
                fontSize: 14,
                minimap: { enabled: false },
                lineNumbers: 'on',
                wordWrap: 'on',
                scrollBeyondLastLine: false,
                padding: { top: 12, bottom: 12 },
                renderLineHighlight: 'gutter',
                smoothScrolling: true,
              }}
            />
          </div>
        </div>

        {/* Right — Preview */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span>◉</span> preview
          </div>
          <div className={styles.mdPreview}>
            <ReactMarkdown>{value}</ReactMarkdown>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function CreateNewDocument() {
  return (
    <Layout title="Markdown Editor" description="Write and preview markdown in real time">
      <MarkdownEditorContent />
    </Layout>
  );
}
