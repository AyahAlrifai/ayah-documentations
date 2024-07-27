import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import styles from '../css/style.module.css';
import ReactMarkdown from 'react-markdown';

export default function JsonFormatter() {

  const [input, setInput] = useState('');

  const handleInputChange = (e) => {
      setInput(e.target.value);
  };

  const formatJSON = () => {
      try {
          const parsedJSON = JSON.parse(input);
          const prettyJSON = JSON.stringify(parsedJSON, null, 2);
          setInput(prettyJSON);
      } catch (error) {
          setInput('Invalid JSON');
      }
  };

  return (
      <Layout>
          <div className={`${styles.jsonFormatter}`}>
            <textarea
                value={input}
                onChange={handleInputChange}
                placeholder="Paste your JSON here"
                rows="10"
                cols="50"
                className={`${styles.textarea}`}
            />
            <br />
            <button className={`${styles.btn} ${styles.colorBtn}`} onClick={formatJSON}>Format JSON</button>
          </div>
      </Layout>
  );
}