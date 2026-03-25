import React, { useState, useRef, useEffect } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import Editor from '@monaco-editor/react';
import styles from '../css/style.module.css';

const defineEditorThemes = (monaco) => {
  monaco.editor.defineTheme('api-dark', {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#161b22',
      'editor.lineHighlightBackground': '#1f2937',
      'editorLineNumber.foreground': '#4a5568',
      'editorLineNumber.activeForeground': '#6fa3ff',
    },
  });
  monaco.editor.defineTheme('api-light', {
    base: 'vs',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': '#ffffff',
      'editor.lineHighlightBackground': '#f0f4ff',
    },
  });
};

const INITIAL_INPUT =
  "@PostMapping(Paths.OnboardingProcess.ROOT)\n" +
  "@PreAuthorize(\"hasAnyRole('COB_ADD_CUSTOMER_ONBOARDING','CUSTOMER_ONBOARDING_ADMIN','SUPER_ADMIN')\")\n" +
  "@Audit(actionType = \"COB_ADD_CUSTOMER_ONBOARDING\", objectName = \"CUSTOMER_ONBOARDING\",\n" +
  "\t\tdocumentIdJsonPath = \"data.idNumber\", httpMethod = Request.HttpMethod.POST)\n" +
  "@Operation(summary = \"start OnBoarding Application\", description = \"start OnBoarding Application.\")\n" +
  "@ApiResponses(value = {\n" +
  "\t\t@ApiResponse(responseCode = \"200\", content = {\n" +
  "\t\t\t\t@Content(mediaType = \"application/json\", schema = @Schema(implementation = OnBoarding.class))}),\n" +
  "\t\t@ApiResponse(responseCode = \"400\", content = {\n" +
  "\t\t\t\t@Content(mediaType = \"application/json\", schema = @Schema(implementation = ResponseModel.class))})})\n" +
  "public ResponseEntity<ResponseModel<OnBoardingModel>> startOnBoardingApplication(\n" +
  "\t\t@RequestBody @Valid final CreateOnBoardingModel createOnBoardingModel, \n" +
  "\t\t@PathVariable() @Mask final Long referenceId, \n" +
  "\t\t@PathVariable(value = sss) String test,\n" +
  "\t\t@RequestParam(required = false, defaultValue = \"20\") @Valid int pageSize,\n" +
  "\t\t@RequestParam(required = false, defaultValue = \"0\") final int pageNumber,\n" +
  "\t\t@RequestParam(defaultValue = \"desc\") final String sortOrder,\n" +
  "\t\t@RequestParam(required = false) final String searchKey,\n" +
  "\t\t@PathVariable final String searchKey) {\n" +
  "\n" +
  "\treturn ResponseEntity.ok().body(this.onboardingService.startOnBoardingApplication(createOnBoardingModel));\n" +
  "}";

/* ── Parsing helpers ── */
function extractAuditInfo(input) {
  const auditInfo = {};
  const match = input.match(/@Audit\(([\s\S]*?)\)/);
  if (match?.[1]) {
    match[1].split(',').forEach(prop => {
      const [key, value] = prop.split('=').map(s => s.trim().replace(/"/g, ''));
      if (key && value) auditInfo[key] = value;
    });
  }
  return auditInfo;
}

function extractPathVariables(input) {
  const result = [];
  const regex = /@PathVariable(?:\s*(\(.*\)))?(?:\s+[\w@]+)*/g;
  let m;
  while ((m = regex.exec(input)) !== null) {
    const words = m[0].split(/\s+/);
    result.push({ type: words[words.length - 2], variable: words[words.length - 1] });
  }
  return result;
}

function extractQueryParams(input) {
  const result = [];
  const regex = /@RequestParam\s*(\(.*?\))?(?:\s+[\w@]+)*/g;
  let m;
  while ((m = regex.exec(input)) !== null) {
    const words = m[0].split(/\s+/);
    const annotation = m[1] || '';
    const requiredM = annotation.match(/required\s*=\s*(\w+)/);
    const defaultM = annotation.match(/defaultValue\s*=\s*"([^"]+)"/);
    result.push({
      parameter: words[words.length - 1],
      type: words[words.length - 2],
      required: requiredM ? requiredM[1] : 'true',
      defaultValue: defaultM ? defaultM[1] : null,
    });
  }
  return result;
}

/* ── Method badge helper ── */
function MethodBadge({ method }) {
  const cls = {
    GET: styles.mGET,
    POST: styles.mPOST,
    PUT: styles.mPUT,
    PATCH: styles.mPATCH,
    DELETE: styles.mDELETE,
  }[method] || styles.mGET;
  return <span className={`${styles.methodBadge} ${cls}`}>{method}</span>;
}

/* ── Section wrapper ── */
function Section({ title, children }) {
  return (
    <div className={styles.apiSection}>
      <div className={styles.apiSectionHeading}>{title}</div>
      <div className={styles.apiSectionBody}>{children}</div>
    </div>
  );
}

/* ── Build Markdown ── */
function buildMarkdown(data) {
  const { summary, description, roles, method, route, auditInfo, pathVariables, queryParams } = data;

  const lines = [];

  lines.push(`## Summary\n\n${summary}\n`);
  lines.push(`## Description\n\n${description}\n`);
  lines.push(`## HTTP Method\n\n\`${method}\`\n`);
  lines.push(`## Route\n\n\`${route}\`\n`);

  lines.push(`## Role(s) Required\n`);
  if (roles.length > 0) {
    roles.forEach(r => lines.push(`- ${r}`));
  } else {
    lines.push('No roles specified');
  }
  lines.push('');

  lines.push(`## Audit Trail\n`);
  if (auditInfo.actionType || auditInfo.objectName) {
    if (auditInfo.actionType) lines.push(`**Action Type:** ${auditInfo.actionType}`);
    if (auditInfo.objectName) lines.push(`**Object Name:** ${auditInfo.objectName}`);
  } else {
    lines.push('No audit info found');
  }
  lines.push('');

  lines.push(`## Authorization\n\nAdd the type of authorization here (e.g. Bearer token).\n`);

  lines.push(`## Headers\n`);
  lines.push(`| Header Name | Description | Example |`);
  lines.push(`| --- | --- | --- |`);
  lines.push(`| Content-Type | Media type of the request body | application/json |`);
  lines.push(`| *(add more)* | | |\n`);

  lines.push(`## Query Parameters\n`);
  lines.push(`| Parameter | Type | Required | Default | Description |`);
  lines.push(`| --- | --- | --- | --- | --- |`);
  if (queryParams.length > 0) {
    queryParams.forEach(p => {
      lines.push(`| \`${p.parameter}\` | ${p.type} | ${p.required === 'true' ? 'Required' : 'Optional'} | ${p.defaultValue ?? '—'} | Description for ${p.parameter} |`);
    });
  } else {
    lines.push(`| *No query parameters found* | | | | |`);
  }
  lines.push('');

  lines.push(`## Path Variables\n`);
  lines.push(`| Variable | Type | Description |`);
  lines.push(`| --- | --- | --- |`);
  if (pathVariables.length > 0) {
    pathVariables.forEach(v => {
      lines.push(`| \`${v.variable}\` | ${v.type} | Description for ${v.variable} |`);
    });
  } else {
    lines.push(`| *No path variables found* | | |`);
  }
  lines.push('');

  lines.push(`## Validations\n\nAdd your validations here, or N/A if none.\n`);

  lines.push(`## Request Body\n\n\`\`\`json\n{\n  "key": "value"\n}\n\`\`\`\n`);

  lines.push(`## Response\n\n\`\`\`json\n{\n  "success": "data"\n}\n\`\`\`\n`);

  lines.push(`## Error Responses\n`);
  lines.push(`| HTTP Status | Error Code | Message | Description |`);
  lines.push(`| --- | --- | --- | --- |`);
  lines.push(`| 400 | ERR-001 | Missing required fields | One or more required fields are missing |`);
  lines.push(`| 401 | AUTH-001 | Unauthorized | Invalid or missing authentication token |`);
  lines.push(`| *(add more)* | | | |\n`);

  return lines.join('\n');
}

/* ── Build output ── */
function buildDoc(input) {
  const auditInfo = extractAuditInfo(input);
  const pathVariables = extractPathVariables(input);
  const queryParams = extractQueryParams(input);

  const summaryM = input.match(/@Operation\(.*?summary\s*=\s*"(.*?)"/);
  const descriptionM = input.match(/@Operation\(.*?description\s*=\s*"(.*?)"/);
  const rolesM = input.match(/@PreAuthorize\("hasAnyRole\((.*?)\)"/);
  const methodM = input.match(/@(Post|Get|Put|Delete|Patch)Mapping\(/i);
  const pathM = input.match(/@(?:Post|Get|Put|Delete|Patch)Mapping\(([^)]+)\)/i);

  const summary = summaryM?.[1] ?? 'Write API summary here';
  const description = descriptionM?.[1] ?? 'Write API description here';
  const roles = rolesM?.[1]
    ? rolesM[1].split(',').map(r => r.replace(/'/g, '').trim())
    : [];
  const method = methodM?.[1]?.toUpperCase() ?? 'GET';
  const route = pathM?.[1] ?? 'Set the route here';

  return { summary, description, roles, method, route, auditInfo, pathVariables, queryParams };
}

/* ── Doc output component ── */
function DocOutput({ data }) {
  const { summary, description, roles, method, route, auditInfo, pathVariables, queryParams } = data;

  return (
    <>
      <Section title="Summary">
        <p>{summary}</p>
      </Section>

      <Section title="Description">
        <p>{description}</p>
      </Section>

      <Section title="HTTP Method">
        <MethodBadge method={method} />
      </Section>

      <Section title="Route">
        <code className={styles.apiCode}>{route}</code>
      </Section>

      <Section title="Role(s) Required">
        {roles.length > 0
          ? <ul style={{ paddingLeft: '1.25rem' }}>{roles.map((r, i) => <li key={i}>{r}</li>)}</ul>
          : <p>No roles specified</p>
        }
      </Section>

      <Section title="Audit Trail">
        {auditInfo.actionType && <p><strong>Action Type:</strong> {auditInfo.actionType}</p>}
        {auditInfo.objectName && <p><strong>Object Name:</strong> {auditInfo.objectName}</p>}
        {!auditInfo.actionType && !auditInfo.objectName && <p>No audit info found</p>}
      </Section>

      <Section title="Authorization">
        <p>Add the type of authorization here (e.g. Bearer token).</p>
      </Section>

      <Section title="Headers">
        <table className={styles.apiTable}>
          <thead>
            <tr>
              <th>Header Name</th>
              <th>Description</th>
              <th>Example</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>Content-Type</td>
              <td>Media type of the request body</td>
              <td>application/json</td>
            </tr>
            <tr>
              <td colSpan="3" style={{ textAlign: 'center', opacity: 0.5 }}>
                Add any other headers here
              </td>
            </tr>
          </tbody>
        </table>
      </Section>

      <Section title="Query Parameters">
        <table className={styles.apiTable}>
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Required</th>
              <th>Default</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {queryParams.length > 0
              ? queryParams.map((p, i) => (
                <tr key={i}>
                  <td><code>{p.parameter}</code></td>
                  <td>{p.type}</td>
                  <td>{p.required === 'true' ? 'Required' : 'Optional'}</td>
                  <td>{p.defaultValue ?? '—'}</td>
                  <td>Description for {p.parameter}</td>
                </tr>
              ))
              : <tr><td colSpan="5" style={{ textAlign: 'center', opacity: 0.5 }}>No query parameters found</td></tr>
            }
          </tbody>
        </table>
      </Section>

      <Section title="Path Variables">
        <table className={styles.apiTable}>
          <thead>
            <tr>
              <th>Variable</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {pathVariables.length > 0
              ? pathVariables.map((v, i) => (
                <tr key={i}>
                  <td><code>{v.variable}</code></td>
                  <td>{v.type}</td>
                  <td>Description for {v.variable}</td>
                </tr>
              ))
              : <tr><td colSpan="3" style={{ textAlign: 'center', opacity: 0.5 }}>No path variables found</td></tr>
            }
          </tbody>
        </table>
      </Section>

      <Section title="Validations">
        <p>Add your validations here, or N/A if none.</p>
      </Section>

      <Section title="Request Body">
        <pre className={styles.apiCode}>{`{\n  "key": "value"\n}`}</pre>
      </Section>

      <Section title="Response">
        <pre className={styles.apiCode}>{`{\n  "success": "data"\n}`}</pre>
      </Section>

      <Section title="Error Responses">
        <table className={styles.apiTable}>
          <thead>
            <tr>
              <th>HTTP Status</th>
              <th>Error Code</th>
              <th>Message</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>400</td>
              <td>ERR-001</td>
              <td>Missing required fields</td>
              <td>One or more required fields are missing</td>
            </tr>
            <tr>
              <td>401</td>
              <td>AUTH-001</td>
              <td>Unauthorized</td>
              <td>Invalid or missing authentication token</td>
            </tr>
            <tr>
              <td colSpan="4" style={{ textAlign: 'center', opacity: 0.5 }}>
                Add any other error responses
              </td>
            </tr>
          </tbody>
        </table>
      </Section>
    </>
  );
}

/* ── Build HTML for Jira (with inline styles matching the view) ── */
function buildHTML(data) {
  const { summary, description, roles, method, route, auditInfo, pathVariables, queryParams } = data;

  const S = {
    wrap: 'font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 14px; line-height: 1.7; color: #374151;',
    section: 'margin-bottom: 20px;',
    heading: 'font-size: 11px; font-weight: 700; letter-spacing: 0.16em; text-transform: uppercase; color: #0859fc; border-bottom: 1px solid rgba(8,89,252,0.15); padding-bottom: 6px; margin: 0 0 10px 0;',
    body: 'font-size: 13px; line-height: 1.7; color: #374151; margin: 0;',
    code: 'display: inline-block; background: #f6f8fa; color: #1f2937; border: 1px solid rgba(0,0,0,0.07); border-radius: 6px; padding: 6px 10px; font-family: Consolas, "Courier New", monospace; font-size: 12px;',
    pre: 'background: #f6f8fa; color: #1f2937; border: 1px solid rgba(0,0,0,0.07); border-radius: 8px; padding: 12px 16px; font-family: Consolas, "Courier New", monospace; font-size: 12px; white-space: pre; margin: 0;',
    table: 'width: 100%; border-collapse: collapse; font-size: 13px;',
    th: 'text-align: left; padding: 7px 12px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.07em; background: rgba(8,89,252,0.06); color: #1d4ed8; border-bottom: 1px solid rgba(8,89,252,0.14);',
    td: 'padding: 7px 12px; color: #374151; border-bottom: 1px solid rgba(0,0,0,0.05);',
  };

  const methodColors = {
    GET: 'background: rgba(34,197,94,0.12);  color: #15803d;',
    POST: 'background: rgba(234,179,8,0.12);  color: #92400e;',
    PUT: 'background: rgba(59,130,246,0.12); color: #1d4ed8;',
    PATCH: 'background: rgba(168,85,247,0.12); color: #6d28d9;',
    DELETE: 'background: rgba(239,68,68,0.12);  color: #b91c1c;',
  };

  const section = (title, body) =>
    `<div style="${S.section}"><div style="${S.heading}">${title}</div><div style="${S.body}">${body}</div></div>`;

  const table = (headers, rows) => {
    const ths = headers.map(h => `<th style="${S.th}">${h}</th>`).join('');
    const trs = rows.map(cells =>
      `<tr>${cells.map(c => `<td style="${S.td}">${c}</td>`).join('')}</tr>`
    ).join('');
    return `<table style="${S.table}"><thead><tr>${ths}</tr></thead><tbody>${trs}</tbody></table>`;
  };

  const badge = `<span style="display:inline-flex;align-items:center;padding:4px 12px;border-radius:6px;font-size:12px;font-weight:800;letter-spacing:0.06em;font-family:monospace;${methodColors[method] ?? ''}">${method}</span>`;

  const parts = [];

  parts.push(section('Summary', `<p style="${S.body}">${summary}</p>`));
  parts.push(section('Description', `<p style="${S.body}">${description}</p>`));
  parts.push(section('HTTP Method', badge));
  parts.push(section('Route', `<code style="${S.code}">${route}</code>`));

  const rolesList = roles.length > 0
    ? `<ul style="margin:0;padding-left:20px;">${roles.map(r => `<li>${r}</li>`).join('')}</ul>`
    : `<p style="${S.body}">No roles specified</p>`;
  parts.push(section('Role(s) Required', rolesList));

  const auditBody = (auditInfo.actionType || auditInfo.objectName)
    ? [
      auditInfo.actionType ? `<p style="${S.body}"><strong>Action Type:</strong> ${auditInfo.actionType}</p>` : '',
      auditInfo.objectName ? `<p style="${S.body}"><strong>Object Name:</strong> ${auditInfo.objectName}</p>` : '',
    ].join('')
    : `<p style="${S.body}">No audit info found</p>`;
  parts.push(section('Audit Trail', auditBody));

  parts.push(section('Authorization', `<p style="${S.body}">Add the type of authorization here (e.g. Bearer token).</p>`));

  parts.push(section('Headers', table(
    ['Header Name', 'Description', 'Example'],
    [
      ['Content-Type', 'Media type of the request body', 'application/json'],
      ['<em>(add more)</em>', '', ''],
    ]
  )));

  const qpRows = queryParams.length > 0
    ? queryParams.map(p => [
      `<code style="font-family:monospace;font-size:12px;">${p.parameter}</code>`,
      p.type,
      p.required === 'true' ? 'Required' : 'Optional',
      p.defaultValue ?? '—',
      `Description for ${p.parameter}`,
    ])
    : [['<em>No query parameters found</em>', '', '', '', '']];
  parts.push(section('Query Parameters', table(
    ['Parameter', 'Type', 'Required', 'Default', 'Description'],
    qpRows
  )));

  const pvRows = pathVariables.length > 0
    ? pathVariables.map(v => [
      `<code style="font-family:monospace;font-size:12px;">${v.variable}</code>`,
      v.type,
      `Description for ${v.variable}`,
    ])
    : [['<em>No path variables found</em>', '', '']];
  parts.push(section('Path Variables', table(
    ['Variable', 'Type', 'Description'],
    pvRows
  )));

  parts.push(section('Validations', `<p style="${S.body}">Add your validations here, or N/A if none.</p>`));
  parts.push(section('Request Body', `<pre style="${S.pre}">{\n  "key": "value"\n}</pre>`));
  parts.push(section('Response', `<pre style="${S.pre}">{\n  "success": "data"\n}</pre>`));

  parts.push(section('Error Responses', table(
    ['HTTP Status', 'Error Code', 'Message', 'Description'],
    [
      ['400', 'ERR-001', 'Missing required fields', 'One or more required fields are missing'],
      ['401', 'AUTH-001', 'Unauthorized', 'Invalid or missing authentication token'],
      ['<em>(add more)</em>', '', '', ''],
    ]
  )));

  return `<div style="${S.wrap}">\n${parts.join('\n')}\n</div>`;
}

/* ── Page component ── */
function ApiDocContent() {
  const { colorMode } = useColorMode();

  const [apiInput, setApiInput] = useState(INITIAL_INPUT);
  const [docData, setDocData] = useState(null);
  const [copied, setCopied] = useState(null); // 'md' | 'html' | null
  const docRef = useRef(null);

  const generate = () => setDocData(buildDoc(apiInput));

  // Feature 1: Ctrl+Enter keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        generate();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [apiInput]);

  const copyAs = async (type) => {
    if (!docData) return;
    try {
      const text = type === 'html' ? buildHTML(docData) : buildMarkdown(docData);
      await navigator.clipboard.writeText(text);
      setCopied(type);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      alert('Copy failed — try selecting the text manually.');
    }
  };


  return (
    <div className={styles.toolPage}>
      {/* Toolbar */}
      <div className={styles.toolBar}>
        <span className={styles.toolBarTitle}>API Documentation Generator</span>
        <button className={`${styles.tBtn} ${styles.tBtnPrimary}`} onClick={generate}>
          ⚡ Generate
        </button>
        <button
          className={`${styles.tBtn} ${styles.tBtnGhost} ${copied === 'md' ? styles.tBtnSuccess : ''}`}
          onClick={() => copyAs('md')}
          disabled={!docData}
        >
          {copied === 'md' ? '✓ Copied!' : '⎘ Copy as Markdown'}
        </button>
        <button
          className={`${styles.tBtn} ${styles.tBtnGhost} ${copied === 'html' ? styles.tBtnSuccess : ''}`}
          onClick={() => copyAs('html')}
          disabled={!docData}
        >
          {copied === 'html' ? '✓ Copied!' : '⎘ Copy as HTML'}
        </button>
        <div className={styles.toolBarDivider} />
        {/* <span className={styles.toolBarMeta}>Ctrl+Enter to generate</span> */}
      </div>

      {/* Split pane */}
      <div className={styles.splitPane}>
        {/* Left — code input */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span>✎</span> input — spring annotations
          </div>
          <div className={styles.paneBody}>
            <Editor
              language="java"
              value={apiInput}
              theme={colorMode === 'dark' ? 'api-dark' : 'api-light'}
              beforeMount={defineEditorThemes}
              onChange={(v) => setApiInput(v ?? '')}
              options={{
                fontSize: 13,
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

        {/* Right — generated output */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span>◉</span> output — generated documentation
          </div>
          <div className={styles.paneBody}>
            {docData
              ? (
                <div className={styles.apiDocOutput} ref={docRef}>
                  <DocOutput data={docData} />
                </div>
              )
              : (
                <div className={styles.emptyState}>
                  <span className={styles.emptyStateIcon}>⚡</span>
                  <p>Paste annotations on the left, then click <strong>Generate</strong>.</p>
                </div>
              )
            }
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ApiDocumentationGenerator() {
  return (
    <Layout title="API Documentation Generator" description="Generate API docs from Spring annotations">
      <ApiDocContent />
    </Layout>
  );
}
