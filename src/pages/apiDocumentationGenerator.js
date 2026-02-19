import React, { useState, useRef } from 'react';
import Layout from '@theme/Layout';
import { useColorMode } from '@docusaurus/theme-common';
import styles from '../css/style.module.css';

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
    const defaultM  = annotation.match(/defaultValue\s*=\s*"([^"]+)"/);
    result.push({
      parameter:    words[words.length - 1],
      type:         words[words.length - 2],
      required:     requiredM ? requiredM[1] : 'true',
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

/* ── Build output ── */
function buildDoc(input) {
  const auditInfo     = extractAuditInfo(input);
  const pathVariables = extractPathVariables(input);
  const queryParams   = extractQueryParams(input);

  const summaryM     = input.match(/@Operation\(.*?summary\s*=\s*"(.*?)"/);
  const descriptionM = input.match(/@Operation\(.*?description\s*=\s*"(.*?)"/);
  const rolesM       = input.match(/@PreAuthorize\("hasAnyRole\((.*?)\)"/);
  const methodM      = input.match(/@(Post|Get|Put|Delete|Patch)Mapping\(/i);
  const pathM        = input.match(/@(?:Post|Get|Put|Delete|Patch)Mapping\(([^)]+)\)/i);

  const summary     = summaryM?.[1]     ?? 'Write API summary here';
  const description = descriptionM?.[1] ?? 'Write API description here';
  const roles       = rolesM?.[1]
    ? rolesM[1].split(',').map(r => r.replace(/'/g, '').trim())
    : [];
  const method      = methodM?.[1]?.toUpperCase() ?? 'GET';
  const route       = pathM?.[1] ?? 'Set the route here';

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

/* ── Page component ── */
function ApiDocContent() {
  useColorMode(); // ensures theme context is active
  const [apiInput, setApiInput] = useState(INITIAL_INPUT);
  const [docData, setDocData]   = useState(null);
  const [copied, setCopied]     = useState(false);
  const docRef = useRef(null);

  const generate = () => setDocData(buildDoc(apiInput));

  const copyDoc = async () => {
    if (!docRef.current) return;
    try {
      await navigator.clipboard.writeText(docRef.current.innerText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
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
          className={`${styles.tBtn} ${styles.tBtnGhost} ${copied ? styles.tBtnSuccess : ''}`}
          onClick={copyDoc}
          disabled={!docData}
        >
          {copied ? '✓ Copied!' : '⎘ Copy Output'}
        </button>
        <div className={styles.toolBarDivider} />
        <span className={styles.toolBarMeta}>Paste Spring annotations · click Generate</span>
      </div>

      {/* Split pane */}
      <div className={styles.splitPane}>
        {/* Left — code input */}
        <div className={styles.pane}>
          <div className={styles.paneHeader}>
            <span>✎</span> input — spring annotations
          </div>
          <div className={styles.paneBody}>
            <textarea
              className={styles.codeInput}
              value={apiInput}
              onChange={(e) => setApiInput(e.target.value)}
              placeholder="Paste your Spring Boot controller method annotations here..."
              spellCheck={false}
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
