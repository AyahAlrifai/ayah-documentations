import React, { Component } from 'react';
import Layout from '@theme/Layout';
import styles from '../css/style.module.css';

class ApiDocumentationGenerator extends Component {

  constructor(props) {
    super(props);
    this.state = {
      apiInput: "@PostMapping(Paths.OnboardingProcess.ROOT)\n" +
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
        "\t\t@RequestParam(required = false, defaultValue = \"0\") final final final int pageNumber,\n" +
        "\t\t@RequestParam(defaultValue = \"desc\") final String sortOrder,\n" +
        "\t\t@RequestParam(required = false) final String searchKey, \n" +
        "\t\t@PathVariable final String searchKey) {\n" +
        "\n" +
        "\treturn ResponseEntity.ok().body(this.onboardingService.startOnBoardingApplication(createOnBoardingModel));\n" +
        "}",
      apiDoc: '',
      auditInfo: {},
      pathVariables: [],
      queryParams: {}
    };
    this.apiDocRef = React.createRef();
  }


  handleInputChange = (event) => {
    this.setState({ apiInput: event.target.value });
  };

  generateDocumentation = () => {
    const { apiInput } = this.state;

    const auditInfo = this.extractAuditInfo(apiInput);
    const pathVariables = this.extractPathVariables(apiInput);
    const queryParams = this.extractQueryParams(apiInput);

    const doc = this.parseApiInput(apiInput, auditInfo, pathVariables, queryParams);

    this.setState({ apiDoc: doc, auditInfo, queryParams });
  };


  extractAuditInfo(input) {
    const auditInfo = {};
    const regex = /@Audit\(([\s\S]*?)\)/;
    const match = input.match(regex);

    if (match && match[1]) {

      const properties = match[1].split(',').map(prop => prop.trim());

      properties.forEach(prop => {
        const [key, value] = prop.split('=').map(item => item.trim().replace(/"/g, ''));
        if (key && value) {
          auditInfo[key] = value;
        }
      });
    }

    return auditInfo;
  }

  extractPathVariables(input) {

    const pathVariables = [];

    const regex = /@PathVariable(?:\s*(\(.*\)))?(?:\s+[\w\@]+)*/g;

    let match;
    while ((match = regex.exec(input)) !== null) {

      console.log(match);
      

      const words = match[0].split(/\s+/);
      
      const type = words[words.length - 2];
      const variable = words[words.length - 1];
  
      pathVariables.push({ type, variable });
    }
  
    return pathVariables;
  }


  extractQueryParams(input) {
    const queryParams = [];

    const regex = /@RequestParam\s*(\(.*\))?(?:\s+[\w\@]+)*/g;

    let match;

    while ((match = regex.exec(input)) !== null) {

      console.log(match);
      
      const words = match[0].split(/\s+/);

      const annotationContent = match[1] || "";
      const type = words[words.length - 2];
      const param = words[words.length - 1];

      const requiredMatch = annotationContent.match(/required\s*=\s*(\w+)/);

      const required = requiredMatch ? requiredMatch[1] ? requiredMatch[1] : "true" : "true";

      const defaultMatch = annotationContent.match(/defaultValue\s*=\s*"([^"]+)"/);
      const defaultValue = defaultMatch ? defaultMatch[1] : null;

      queryParams.push({
        parameter: param,
        type: type,
        required: required,
        defaultValue: defaultValue,
      });
    }

    return queryParams;
  }


  parseApiInput(input, auditInfo, pathVariables, queryParams) {

    const methodColors = {
      GET: 'green',
      POST: 'yellow',
      PUT: 'blue',
      DELETE: 'red',
      PATCH: 'purple'
    };

    const summaryMatch = input.match(/@Operation\(.*summary = "(.*?)"/);
    const descriptionMatch = input.match(/@Operation\(.*description = "(.*?)"/);
    const rolesMatch = input.match(/@PreAuthorize\("hasAnyRole\((.*?)\)"/);
    const methodMatch = input.match(/@(Post|Get|Put|Delete|Patch)Mapping\((.*?)\)/);
    const pathMatch = input.match(/@(?:Post|Get|Put|Delete|Patch)Mapping\(([^)]+)\)/);

    const summary = summaryMatch ? summaryMatch[1] : 'Write API summary here';

    const description = descriptionMatch ? descriptionMatch[1] : 'Write API description here';

    const roles = rolesMatch ? rolesMatch[1].split(',').map(role => role.replace(/'/g, '').trim()) : [];

    const method = methodMatch ? methodMatch[1].toUpperCase() : 'GET';
    const methodColor = methodColors[method] || 'black';

    const route = pathMatch ? pathMatch[1] : 'Set the route here.';

    return (
      <div ref={this.apiDocRef}>
        <h3 className={styles.blueText}>SUMMARY</h3>
        <p>{summary}</p>

        <h3 className={styles.blueText}>DESCRIPTION</h3>
        <p>{description}</p>

        <h3 className={styles.blueText}>ROLE(S) REQUIRED</h3>
        <ul>
          {roles.map((role, index) => (
            <li key={index}>{role}</li>
          ))}
        </ul>
        <h3 className={styles.blueText}>AUDIT TRAIL</h3>
        {auditInfo.actionType && <p><strong>Action Type:</strong> {auditInfo.actionType}</p>}
        {auditInfo.objectName && <p><strong>Object Name:</strong> {auditInfo.objectName}</p>}

        <h3 className={styles.blueText}>VALIDATIONS</h3>
        <p>{'Add your validations here or add N/A if there is no validation.'}</p>

        <h3 className={styles.blueText}>HTTP METHOD</h3>
        <p style={{ color: methodColor, fontWeight: "bold" }}>{method}</p>

        <h3 className={styles.blueText}>ROUTE</h3>
        <p>{route}</p>

        <h3 className={styles.blueText}>AUTHORIZATION</h3>
        <p>{'Add the type of authorization here, such as Bearer token.'}</p>

        <h3 className={styles.blueText}>HEADERS</h3>
        <table border="1">
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
              <td>Content type of the request</td>
              <td>application/json</td>
            </tr>
            <tr>
              <td colSpan="3" style={{ textAlign: "center" }}>Add any othere headers</td>
            </tr>
          </tbody>
        </table>

        <h3 className={styles.blueText}>QUERY PARAMETERS</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Parameter</th>
              <th>Type</th>
              <th>Description</th>
              <th>Required</th>
              <th>Default</th>
            </tr>
          </thead>
          <tbody>
            {queryParams != undefined && queryParams.length > 0 ? queryParams.map((param, index) => (
              <tr key={index}>
                <td>{param.parameter}</td>
                <td>{param.type}</td>
                <td>{`Description for ${param.parameter}`}</td>
                <td>{param.required == "true" ? "Required" : "Optional"}</td>
                <td>{param.defaultValue !== null ? param.defaultValue : "N/A"}</td>
              </tr>
            )) : (
              <tr>
                <td colSpan="5">No query parameters found</td>
              </tr>
            )}
          </tbody>
        </table>


        <h3 className={styles.blueText}>PATH VARIABLES</h3>
        <table border="1">
          <thead>
            <tr>
              <th>Variable</th>
              <th>Type</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            {pathVariables.length > 0 ? (
              pathVariables.map((pathVariable, index) => {
                const variableName = pathVariable.variable;
                return (
                  <tr key={index}>
                    <td>{variableName}</td>
                    <td>{pathVariable.type}</td>
                    <td>{`Description for ${variableName}`}</td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan="3" style={{ textAlign: 'center' }}>
                  No path variables found
                </td>
              </tr>
            )}
          </tbody>
        </table>


        <h3 className={styles.blueText}>REQUEST BODY</h3>
        <pre>
          {`{
  "key": "value"
}`}
        </pre>

        <h3 className={styles.blueText}>RESPONSE</h3>
        <pre>
          {`{
  "success": "data"
}`}
        </pre>

        <h3 className={styles.blueText}>ERROR RESPONSES</h3>
        <table border="1">
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
              <td colSpan="4" style={{ textAlign: "center" }}>Add any othere error responses</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }

  copyToClipboard = () => {
    const { current: docElement } = this.apiDocRef;

    if (docElement) {
      const range = document.createRange();
      range.selectNodeContents(docElement);
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);

      try {
        document.execCommand('copy');
      } catch (err) {
        alert('Failed to copy documentation');
      }
    }
  };


  render() {
    return (
      <Layout>
        <div className={styles.apiDocumentationGenerator}>
          {/* Buttons above the textarea */}
          <div className={styles.actionButtons}>
            <button
              className={`${styles.btn} ${styles.colorBtn}`}
              onClick={this.generateDocumentation}
            >
              Generate
            </button>
            <button
              className={`${styles.btn} ${styles.colorBtn}`}
              onClick={this.copyToClipboard}
              disabled={!this.state.apiDoc}
            >
              Copy
            </button>
          </div>

          {/* Content container with textarea and result side-by-side */}
          <div className={styles.contentContainer}>
            <div className={styles.textareaContainer}>
              <textarea
                value={this.state.apiInput}
                onChange={this.handleInputChange}
                placeholder="Paste API annotations here..."
              />
            </div>
            <div className={styles.resultContainer}>
              {this.state.apiDoc && <div>{this.state.apiDoc}</div>}
            </div>
          </div>
        </div>
      </Layout>
    );
  }
}

export default ApiDocumentationGenerator;
