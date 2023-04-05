---
sidebar_position: 9
---

# Example

[Manag Contract API Documentation](https://app.swaggerhub.com/apis-docs/AKALRIFAI15_1/contracts/1.0.0)

```
openapi: 3.0.0
servers:
  # Added by API Auto Mocking Plugin
  - description: SwaggerHub API Auto Mocking
    url: https://virtserver.swaggerhub.com/AKALRIFAI15_1/contracts/1.0.0
  - description: Integration
    url: http://192.168.1.83:8080/CIS-SERVER/rest/api/v1/contract
  - description: Stage
    url: https://developstg.blulogix.com/CIS-SERVER/rest/api/v1/contract
info:
  description: Manage Contract by add, delete and update contract and contract template
  version: "1.0.0"
  title: Manage contract API
  contact:
    email: arefai@blulogix.com
tags:
  - name: Contract
  - name: Contract template
security:
  - bearerAuth: [] 
paths:
  /createContract:
    post:
      tags:
        - Contract
      security:
        - bearerAuth: []
      summary: creat new contract
      operationId: createContract
      description: |
        create new contrat for spesific Customer
      parameters:
        - $ref: '#/components/parameters/referer'
        - $ref: '#/components/parameters/accessControlOrigin'
        - $ref: '#/components/parameters/accessControlCredentials'
        - $ref: '#/components/parameters/accessControlAllowHeader'
        - $ref: '#/components/parameters/accessControlAllowMethod'
        - $ref: '#/components/parameters/origin'
      requestBody:
        description: contract object
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/contract'
      responses:
        '200':
          description: create contract
          content:
            application/json:
              schema:
                oneOf:
                 - $ref: '#/components/schemas/addedContract'
                 - $ref: '#/components/schemas/existingContract'
        '400':
          description: bad Request
          content:
            text/html:
              schema:
                $ref: '#/components/schemas/badRequest'
        '401':
          description: BluLogix 404 Error Page
        '404':
          description: BluLogix 404 Error Page
  /createContractTemplate:
    post:
      tags:
        - Contract template
      security:
        - bearerAuth: []
      summary: creat new contract template
      operationId: createContractTemplate
      description: |
        create new contrat Template
      parameters:
        - $ref: '#/components/parameters/referer'
        - $ref: '#/components/parameters/accessControlOrigin'
        - $ref: '#/components/parameters/accessControlCredentials'
        - $ref: '#/components/parameters/accessControlAllowHeader'
        - $ref: '#/components/parameters/accessControlAllowMethod'
        - $ref: '#/components/parameters/origin'
      requestBody:
        description: contract object
        required: true
        content:
          application/json:
            schema:
              $ref: '#/components/schemas/contractTemplate'
      responses:
        '200':
          description: create contract
          content:
            application/json:
              schema:
                oneOf:
                 - $ref: '#/components/schemas/addedTemplate'
                 - $ref: '#/components/schemas/existingTemplate'
        '400':
          description: bad Request
          content:
            text/html:
              schema:
                $ref: '#/components/schemas/badRequest'
        '401':
          description: BluLogix 404 Error Page
        '404':
          description: BluLogix 404 Error Page
  /updateContract:
    post:
      tags:
        - Contract
      responses:
        '200':
          description: bad input parameter
  /updateContractTemplate:
    post:
      tags:
        - Contract template
      responses:
        '200':
          description: bad input parameter
components:
  parameters:
    referer:
      name : Referer
      in: header
      description: Referer
      required: true
      schema:
        type: string
        default: http://192.168.1.85/
    accessControlOrigin:
      name : Access-Control-Allow-Origin
      in: header
      description: Access-Control-Allow-Origin
      required: true
      schema:
        type: string
        default: http://192.168.1.85/
    accessControlCredentials:
      name : Access-Control-Allow-Credentials
      in: header
      description: Access-Control-Allow-Headers
      required: false
      schema:
        type: boolean 
        default: true
    accessControlAllowHeader:
      name : Access-Control-Allow-Headers
      in: header
      description: Access-Control-Allow-Headers
      required: false
      schema:
        type: string
        default: http://192.168.1.85/
    accessControlAllowMethod:
      name : Access-Control-Allow-Methods
      in: header
      description: Access-Control-Allow-Methods
      required: false
      schema:
        type: string 
        default: '*'
    origin:
      name : origin
      in: header
      description: origin
      required: true
      schema:
        type: string
        default: http://192.168.1.85/
  schemas:
    contractTemplate:
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
    contract:
      type: object
      properties:
        contractName:
          type: string
          example: swagger_contract
        contractDesc:
          type: string
          example: swagger contract for test
        conTemplateId:
          type: integer
          example: 1863
        accountNumber:
          type: string
          example: D109-0001387
        termedFlag:
          type: string
          enum: [M, D, N]
          example: M
        termInMonth:
          type: integer
          minimum: 1
          maximum: 999
          example: 60
        allowTermChange:
          type: boolean
          example: false
        trialLengthInDays:
          type: integer
          minimum: 1
          maximum: 999
          example: 20
        startDate:
          type: string
          example: null
        termEndDate:
          type: string
          example: 1/10/2023
        renewalType:
          type: string
          enum: [A, M]
          example: A
        renewalTermInMonth:
          type: integer
          minimum: 1
          maximum: 999
          example: 20
        renewalReqCustAcc:
          type: boolean
          example: false
        renewalReqIntApp:
          type: boolean
          example: false
        cancelationAllowed:
          type: boolean
          example: true
        cancelationProductCode:
          type: string
          example: P0000000000000031298
        cancelationFlatRate:
          type: integer
          example: 0
        cancelationPctFull:
          type: string
          example: 25
        cancelationPctLeft:
          type: integer
          example: 0
        eSignatureReq:
          type: boolean
          example: true
        discountPct:
          type: integer
          example: 5
          minimum: 1
          maximum: 999
        contactList:
          type: array
          items:
            type: integer
          example: []
        contractDocumentList:
          type: array
          items:
            type: string
          example: []
        contractDocumentIds:
          type: array
          items:
            type: integer
          example: []
        reminderDays:
          type: integer
          example: 9
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
    badRequest:
      type: string
      example: bad Request
    existingContract:
      type: object
      properties:
        executionSuccessful: 
          type: boolean
          example: false
        successCode: 
          type: string
          example: null
        errorCode: 
          type: string
          example: 10504
        returnValue: 
          type: object
          properties: 
            contractId:
              type: integer
          example: null
        message: 
          type: string
          example: Existing Contract Name
        missingParams: 
          type: array
          items:
            type: string
          example: null
        invalidParam: 
          type: array
          items:
            type: string
          example: null
        orderDetail: 
          type: string
          example: null
    existingTemplate:
      type: object
      properties:
        executionSuccessful: 
          type: boolean
          example: false
        successCode: 
          type: string
          example: null
        errorCode: 
          type: string
          example: 10504
        returnValue: 
          type: object
          properties: 
            contractId:
              type: integer
          example: null
        message: 
          type: string
          example: Existing Template Name
        missingParams: 
          type: array
          items:
            type: string
          example: null
        invalidParam: 
          type: array
          items:
            type: string
          example: null
        orderDetail: 
          type: string
          example: null
    addedContract:
      type: object
      properties:
        executionSuccessful: 
          type: boolean
          example: true
        successCode: 
          type: string
          example: 10505
        errorCode: 
          type: string
          example: null
        returnValue: 
          type: object
          properties: 
            contractId:
              type: integer
          example: 
            contractId: 4852
        message: 
          type: string
          example: Contract Added
        missingParams: 
          type: array
          items:
            type: string
          example: null
        invalidParam: 
          type: array
          items:
            type: string
          example: null
        orderDetail: 
          type: string
          example: null
    addedTemplate:
      type: object
      properties:
        executionSuccessful: 
          type: boolean
          example: true
        successCode: 
          type: string
          example: 10502
        errorCode: 
          type: string
          example: null
        returnValue: 
          type: object
          properties: 
            conTemplateId:
              type: integer
          example: 
            contractId: 2125
        message: 
          type: string
          example: Template Added
        missingParams: 
          type: array
          items:
            type: string
          example: null
        invalidParam: 
          type: array
          items:
            type: string
          example: null
        orderDetail: 
          type: string
          example: null
  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
```