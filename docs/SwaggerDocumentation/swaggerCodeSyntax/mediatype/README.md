---
sidebar_position: 15
---

# Media Type

Media type is a format of a request or response body data. Web service operations can accept and return data in different formats, the most common being JSON, XML and images. You specify the media type in request and response definitions. Here is an example of a response definition.

---

## Media Type Names

The media types listed below the content field should be compliant with RFC 6838. For example, you can use standard types or vendor-specific types (indicated by .vnd) –

```
application/json
application/xml
application/x-www-form-urlencoded
multipart/form-data
text/plain; charset=utf-8
text/html
application/pdf
image/png
application/vnd.mycompany.myapp.v2+json
application/vnd.ms-excel
application/vnd.openstreetmap.data+xml
application/vnd.github-issue.text+json
application/vnd.github.v3.diff
image/vnd.djvu
```

---

## Multiple Media Types

You may want to specify multiple media types:

```yaml
paths:
  /employees:
    get:
      summary: Returns a list of employees.
      responses:
        '200':      # Response
          description: OK
          content:  # Response body
            application/json:   # One of media types
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  fullTime: 
                    type: boolean
            application/xml:    # Another media types
              schema:
                type: object
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  fullTime: 
                    type: boolean
```
To use the same data format for several media types, define a custom object in the components section of your spec and then refer to this object in each media type:

```yaml
paths:
  /employees:
    get:
      responses:
        '200':      # Response
          description: OK
          content:  # Response body
            application/json:  # Media type
             schema: 
               $ref: '#/components/schemas/Employee'    # Reference to object definition
            application/xml:   # Media type
             schema: 
               $ref: '#/components/schemas/Employee'    # Reference to object definition
components:
  schemas:
    Employee:      # Object definition
      type: object
      properties:
        id:
          type: integer
        name:
          type: string
        fullTime: 
          type: boolean
```

To define the same format for multiple media types, you can also use placeholders like */*, application/*, image/* or others:

```yaml
paths:
  /info/logo:
    get:
      responses:
        '200':           # Response
          description: OK
          content:       # Response body
            image/*:     # Media type
             schema: 
               type: string
               format: binary
```