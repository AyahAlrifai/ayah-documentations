import React, { useState, useRef, useEffect } from "react";
import Layout from '@theme/Layout';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';

export default function RestAdapter() {
  const { siteConfig } = useDocusaurusContext(); // ✅ top-level hook
  console.log(siteConfig);

  const N8N_API_URL = siteConfig.customFields.REACT_APP_N8N_API_URL;

  const [input, setInput] = useState("");
  const [response, setResponse] = useState("");
  const [loading, setLoading] = useState(false);
  const responseRef = useRef(null);

  const sendRequest = async () => {
    setLoading(true);
    setResponse("");

    const myHeaders = new Headers();
    myHeaders.append("Content-Type", "application/json");

    const raw = JSON.stringify({
      userId: "12345",
      inputData: input
    });

    const requestOptions = {
      method: "POST",
      headers: myHeaders,
      body: raw,
      redirect: "follow"
    };

    try {
      const res = await fetch(
        `${N8N_API_URL}`,
        requestOptions
      );
      const textResult = await res.text();

      let output = textResult;

      try {
        const outer = JSON.parse(textResult);
        if (outer.output) output = outer.output;
      } catch { }

      output = output.replace(/^```json\s*/, "").replace(/```$/, "");

      try {
        output = JSON.stringify(JSON.parse(output), null, 2);
      } catch { }

      setResponse(output);
    } catch (err) {
      setResponse("❌ Error: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (responseRef.current) {
      responseRef.current.scrollTop = responseRef.current.scrollHeight;
    }
  }, [response]);

  return (
    <Layout>
      <div
        style={{
          minHeight: "100vh",
          padding: "40px",
          fontFamily: "Segoe UI, sans-serif",
          color: "var(--ifm-color-gray)",
        }}
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "15px",
            alignItems: "flex-start"
          }}
        >
          <h2 style={{ color: "var(--ifm-color-primary-dark)", marginBottom: "20px" }}>
            ✉️ Enter Your Message
            <span
              style={{ position: "relative", display: "inline-block", cursor: "pointer", marginTop: "5px" }}
              onMouseEnter={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip-text');
                if (tooltip) tooltip.style.visibility = 'visible';
              }}
              onMouseLeave={(e) => {
                const tooltip = e.currentTarget.querySelector('.tooltip-text');
                if (tooltip) tooltip.style.visibility = 'hidden';
              }}
            >
              <span style={{
                display: "inline-flex",
                justifyContent: "center",
                alignItems: "center",
                width: "18px",
                height: "18px",
                borderRadius: "50%",
                backgroundColor: "gray",
                color: "white",
                fontSize: "12px",
                fontWeight: "bold",
                userSelect: "none",
                marginLeft: "5px",
              }}> i</span>

              <span className="tooltip-text" style={{
                visibility: "hidden",
                width: "300px",
                backgroundColor: "var(--ifm-hero-background-color)",
                color: "var(--ifm-hero-text-color)",
                borderRadius: "4px",
                padding: "4px",
                fontSize: "12px",
                position: "absolute",
                zIndex: 1,
                top: "125%",
                left: "50%",
                opacity: 1,
              }}>
                <pre>
                  {`
i have this bank api

\`\`\`
curl -X POST <http://localhost:8080/api/users> \\
      -H "Content-Type: application/json" \\
      -d '{
        "name": "John Doe",
        "email": "john.doe@example.com"
      }'
\`\`\`

and this is the response:

\`\`\`json
{
  "id": 1,
  "name": "John Doe",
  "email": "john.doe@example.com"
}
\`\`\`

and i want to map it to this model

\`\`\`java
package com.example.demo.model;

public class User {
  private Long userId;
  private String userName;
  private String userEmail;
}
\`\`\`

and i have these inputs

\`\`\`json
{
  "data": {
    "name": "Ayah Refai",
    "email": "ayah@yopmail.com"
  }
}
\`\`\`
`}
                </pre>
              </span>
            </span>
          </h2>

          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Enter your Message here..."
            style={{
              width: "100%",
              height: "150px",
              marginBottom: "15px",
              padding: "12px",
              fontSize: "14px",
              border: "1px solid #3c3c3c",
              borderRadius: "12px",
              outline: "none",
              resize: "vertical",
              background: "var(--ifm-hero-background-color)",
              color: "var(--ifm-hero-text-color)",
            }}
          />

          <button
            onClick={sendRequest}
            disabled={loading}
            style={{
              background: "var(--ifm-color-primary-dark)",
              color: "white",
              border: "none",
              borderRadius: "10px",
              padding: "10px 20px",
              fontSize: "15px",
              cursor: loading ? "not-allowed" : "pointer",
              opacity: loading ? 0.7 : 1,
              transition: "background 0.3s ease",
            }}
            onMouseOver={(e) => !loading && (e.target.style.background = "var(--ifm-color-primary-dark)")}
            onMouseOut={(e) => !loading && (e.target.style.background = "var(--ifm-color-primary-darker)")}
          >
            {loading ? "⏳ Loading..." : "🚀 Send Request"}
          </button>

          {!loading && response && (
            <>
              <h3 style={{ marginBottom: "10px", color: "var(--ifm-color-primary-dark)" }}>
                🤖 AI Agent Message:
              </h3>

              <div
                ref={responseRef}
                style={{
                  height: "400px",
                  width: "100%",
                  overflow: "auto",
                  background: "var(--ifm-hero-background-color)",
                  color: "var(--ifm-hero-text-color)",
                  padding: "12px",
                  borderRadius: "12px",
                  border: "1px solid #3c3c3c",
                  fontFamily: "Consolas, 'Courier New', monospace",
                  whiteSpace: "pre-wrap",
                  wordBreak: "break-word"
                }}
              >
                <pre style={{
                  background: "var(--ifm-hero-background-color)",
                  color: "var(--ifm-hero-text-color)",
                }}>
                  {response}
                </pre>
              </div>
            </>
          )}
        </div>
      </div>
    </Layout>
  );
}
