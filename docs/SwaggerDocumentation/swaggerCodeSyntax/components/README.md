---
sidebar_position: 12
---
# Components

Often, multiple API operations have some common parameters or return the same response structure. To avoid code duplication, you can place the common definitions in the global components section and reference them using $ref. In the example below, duplicate definitions of a User object are replaced with a single component and references to that component.

```yaml
  components:
      # Reusable schemas (data models)
      schemas:
        ...
      # Reusable path, query, header and cookie parameters
      parameters:
        ...
      # Security scheme definitions (see Authentication)
      securitySchemes:
        ...
      # Reusable request bodies
      requestBodies:
        ...
      # Reusable responses, such as 401 Unauthorized or 400 Bad Request
      responses:
        ...
      # Reusable response headers
      headers:
        ...
      # Reusable examples
      examples:
        ...
      # Reusable links
      links:
        ...
      # Reusable callbacks
      callbacks:
        ...
```

The component names are used to reference the components via $ref from other parts of the API specification:

```yaml
$ref: '#/components/<type>/<name>'
```
For example:
```yaml
$ref: '#/components/schemas/User'
```
An exception are definitions in securitySchemes which are referenced directly by name (see [Authentication](#authentication)).

---

## Schemas
The global components/schemas section lets you define common data structures used in your API. They can be referenced via $ref whenever a schema is required – in parameters, request bodies, and response bodies. For example, this JSON object:

```json
{
  "id": 4,
  "name": "Arthur Dent"
}

```
can be represented as:

```yaml
components:
  schemas:
    User:
      type: object
      properties:
        id:
          type: integer
          example: 4
        name:
          type: string
          example: Arthur Dent
      # Both properties are required
      required:  
        - id
        - name
```

and then referenced in the request body schema and response body schema as follows:

```yaml
paths:
  /users/{userId}:
    get:
      summary: Returns a user by ID.
      parameters:
        - in: path
          name: userId
          required: true
          schema:
            type: integer
            format: int64
            minimum: 1
      responses:
        '200':
          description: OK
          content:
            application/json:
              schema:
                $ref: '#/components/schemas/User'    # <-------
  /users:
    post:
      summary: Creates a new user.
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/User'      # <-------
      responses:
        '201':
          description: Created
```

---

## parameters

```yaml
parameters:
    offsetParam:      # Can be referenced via '#/components/parameters/offsetParam'
      name: offset
      in: query
      description: Number of items to skip before returning the results.
      required: false
      schema:
        type: integer
        format: int32
        minimum: 0
        default: 0
    limitParam:       # Can be referenced as '#/components/parameters/limitParam'
      name: limit
      in: query
      description: Maximum number of items to return.
      required: false
      schema:
        type: integer
        format: int32
        minimum: 1
        maximum: 100
        default: 20
```

:::info

  read more about parameters [link](../parameters/)
  
:::

---

## responses
```yaml
 responses:
    404NotFound:       # Can be referenced as '#/components/responses/404NotFound'
      description: The specified resource was not found.
    ImageResponse:     # Can be referenced as '#/components/responses/ImageResponse'
      description: An image.
      content:
        image/png:
          schema:
            type: string
            format: binary
    GenericError:      # Can be referenced as '#/components/responses/GenericError'
      description: An error occurred.
      content:
        application/json:
          schema:
            $ref: '#/components/schemas/Error'
```
---

## requestBodies

```yaml
  requestBodies:
    contractTemplate:
      description: A JSON object containing contract template data
      required: true
      content:
        application/json:
          schema:
            type: object
            properties:
              contractName: 
                type: string
                example: 123123123
              contractDesc: 
                type: string
                example: aaa
              startDate: 
                type: string
                example: 2/1/2023
              endDate: 
                type: string
                example: 12/31/2029
              categoryList:
                type: array
                items:
                  type: string
                example:
                  - D109
              termedFlag: 
                type: string
                enum: [M, D, N]
                example: D
              termInMonth: 
                type: integer
                example: null
                minimum: 1
                maximum: 999
              termEndDate: 
                type: string
                example: 2/28/2023
              trialLengthInDays: 
                type: integer
                example: 30
                minimum: 1
                maximum: 999
              contractPostfix: 
                type: string
                example: aaa
              contractPrefix: 
                type: string
                example: aaa
              renewalType:
                type: string
                enum: [A, M]
                example: A
              renewalTermInMonth: 
                type: integer
                example: 1
                minimum: 1
                maximum: 999
              renewalReqCustAcc: 
                type: boolean
                example: false
              renewalReqIntApp: 
                type: boolean
                example: false
              cancelationAllowed: 
                type: boolean
                example: false
              cancelationProductCode: 
                type: string
                example: null
              cancelationFlatRate: 
                type: string
                example: null
              cancelationPctFull: 
                type: string
                example: null
              cancelationPctLeft: 
                type: string
                example: null
              eSignatureReq: 
                type: boolean
                example: false
              discountPct: 
                type: integer
                example: 5
                minimum: 1
                maximum: 999
              planList:
                type: array
                items:
                  type: string
                example:
                  - D109-000000000008885
              templateDocList: 
                type: array
                items:
                  type: string
                example: []
              pdfTemplateId: 
                type: string
                example: contractTemplateSettings
              reminderDays: 
                type: integer
                example: 10
                minimum: 1
                maximum: 999
            required:  
              - accountNumber
              - conTemplateId
              - contractName
              - contractDesc
              - trialLengthInDays
              - termInMonth
              - termedFlag
              - renewalType
              - renewalTermInMonth
              - reminderDays
              - planList
              - categoryList
              - endDate
              - startDate
```
---

## security Schemes

The securitySchemes and security keywords are used to describe the authentication methods used in your API.

```yaml
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
security:
  - BasicAuth: []
```
---
```yaml
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
    BearerAuth:
      type: http
      scheme: bearer
    ApiKeyAuth:
      type: apiKey
      in: header
      name: X-API-Key
    OpenID:
      type: openIdConnect
      openIdConnectUrl: https://example.com/.well-known/openid-configuration
    OAuth2:
      type: oauth2
      flows:
        authorizationCode:
          authorizationUrl: https://example.com/oauth/authorize
          tokenUrl: https://example.com/oauth/token
          scopes:
            read: Grants read access
            write: Grants write access
            admin: Grants access to admin operations
```

---

## links

Links are one of the new features of OpenAPI 3.0. Using links, you can describe how various values returned by one operation can be used as input for other operations. This way, links provide a known relationship and traversal mechanism between the operations. The concept of links is somewhat similar to hypermedia, but OpenAPI links do not require the link information present in the actual responses.
 
:::info
  more about link [here](../link)
:::

---

## callbacks

```
  code
```

