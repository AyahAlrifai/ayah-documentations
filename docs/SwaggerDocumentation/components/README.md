---
sidebar_position: 6
---

# Components

Often, multiple API operations have some common parameters or return the same response structure. To avoid code duplication, you can place the common definitions in the global components section and reference them using $ref. In the example below, duplicate definitions of a User object are replaced with a single component and references to that component.

```  
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

```
$ref: '#/components/<type>/<name>'
```
For example:
```
$ref: '#/components/schemas/User'
```
An exception are definitions in securitySchemes which are referenced directly by name (see [Authentication](#authentication)).

---

## Schemas
The global components/schemas section lets you define common data structures used in your API. They can be referenced via $ref whenever a schema is required – in parameters, request bodies, and response bodies. For example, this JSON object:

```
{
  "id": 4,
  "name": "Arthur Dent"
}

```
can be represented as:

```

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

```
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

```
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

---

## responses
```
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

## security Schemes

The securitySchemes and security keywords are used to describe the authentication methods used in your API.

```
components:
  securitySchemes:
    BasicAuth:
      type: http
      scheme: basic
security:
  - BasicAuth: []
```

```
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

## Externally Defined Components
```
components:
  schemas:
    Pet:
      $ref: '../models/pet.yaml'
      # Can now use use '#/components/schemas/Pet' instead
    User:
      $ref: 'https://api.example.com/v2/openapi.yaml#/components/schemas/User'
      # Can now use '#/components/schemas/User' instead
  responses:
    GenericError:
      $ref: '../template-api.yaml#/components/responses/GenericError'
      # Can now use '#/components/responses/GenericError' instead
```