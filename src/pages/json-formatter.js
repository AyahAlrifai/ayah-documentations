import React, { useState } from 'react';
import Layout from '@theme/Layout';
import Editor from '@monaco-editor/react';
import 'react-toastify/dist/ReactToastify.css';
import styles from '../css/style.module.css';
import { toast } from 'react-toastify';
import { ToastContainer } from 'react-toastify';

export default function JsonFormatter() {

  const [input, setInput] = useState('');

  const formatJSON = () => {
    try {
      if (input != null && input != undefined && input !== "") {
        const parsedJSON = JSON.parse(input);
        const prettyJSON = JSON.stringify(parsedJSON, null, 2);
        setInput(prettyJSON);
      }
    } catch (error) {
      toast.error("Invalid JSON")
    }
  };

  const jsonOneLine = () => {
    try {
      if (input != null && input != undefined && input !== "") {

        const jsonObject = JSON.parse(input);
        const singleLineJsonString = JSON.stringify(jsonObject);
        setInput(singleLineJsonString);
      }
    } catch (error) {
      toast.error("Invalid JSON")
    }
  };

  return (
    <Layout>
      <div className={`${styles.jsonFormatter}`}>
        <div>
          <button className={`${styles.btn} ${styles.colorBtn}`} onClick={formatJSON}>Format JSON</button>
          <button className={`${styles.btn} ${styles.colorBtn}`} onClick={jsonOneLine}>One Line JSON</button>
        </div>
        <br />
        <Editor
          language="json"
          value={input}
          className={`${styles.textarea}`}
          onChange={(newValue) => {
            setInput(newValue);
          }}
          theme='vs-dark'
        />
      </div>
      <ToastContainer />
    </Layout>
  );
}