import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import styles from '../css/style.module.css';
import ReactMarkdown from 'react-markdown';

export default function SNewDocumentql() {

  const initValue = `Basic Syntax
These are the elements outlined in John Gruber’s original design document. All Markdown applications support these elements.

Element	Markdown Syntax
Heading	
# H1
## H2
### H3
Bold	**bold text**
Italic	*italicized text*
Blockquote	> blockquote
Ordered List	
1. First item
2. Second item
3. Third item
Unordered List	
- First item
- Second item
- Third item
Code	\`code\`
Horizontal Rule	
---
Link	[title](https://www.example.com)
Image	![alt text](image.jpg)`;

  const [value, setValue] = useState(initValue);

  const options = {
    "theme": 'vs-dark',
  };

  return (
    <Layout>
      <Editor
        language="markdown"
        value={initValue}
        className={styles.monacoEditor}
        options={options}
        onChange={(newValue) => {
          setValue(newValue);
        }}
      />
      <div className={styles.reactMarkdown}>
        <ReactMarkdown children={value} />
      </div>
    </Layout>
  );

}