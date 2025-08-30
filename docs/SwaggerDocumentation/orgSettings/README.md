---
sidebar_position: 3
---

# Organization Settings

## Members 

- you can add many members under organization 
- click on setting icon side to organization name 
- add new member by email or user name
- you can manage role for member by click on Member profile action
- you can add role or edit current role

![step_1](img1.png)

### Type:
- Team
<p dir="rtl">
بكون اله access على كل اشي جوا الTeam
</p>
- Organization
<p dir="rtl">
بكون اله access على كل اشي جوا الOrganization
</p>
- domain
<p dir="rtl">
بكون اله access على domain معين
</p>
- API
<p dir="rtl">
بكون اله access على API معينه
</p>

### Name:
<p dir="rtl">
هو عبارة عن list ال value يلي اله حسب 
الType
<br />
يعني مثلا لو كان الtype -> domain رح تظهر list of domains داخل هاي الOrg و منها بختار
<br />
ونفس الاشي لباقي الTypes
</p>

### Role:
- Team: [Admenistartor, mmember]
    - adminstration
    <p dir="rtl">
    اله access على كل الpublic API, domains and template
    <br /> 
    لكن فقط read only.
    <br />
    بيقدر يعمل create ل API and Domain
    <br />
    اله access على org settings -> team
    </p>

    - member
    <p dir="rtl">
    اله access على كل الpublic API, domains and template
    <br /> 
    لكن فقط read only.
    <br />
    بيقدر يعمل create ل API and Domain
    </p>

- Organization [owner, customer, designer]
    - owner:
    <p dir="rtl">
    بكون اله access على كل اشي جوا الorg و بيقدر يعمل create لأي اشي او يعمل edit او delete
    <br />
    واله access على org settings 
    </p>
    - designer
    <p dir="rtl">
    بيقدر يعمل create API or Domain
    <br />
    بيقدر يعمل تعديل على اي API or Domain
    </p>
    - customer
    <p dir="rtl">
   فقط read only
    </p>

- domain [designer, customer]
    - designer
    <p dir="rtl">
    بيقدر يعمل create domain
    <br />
    و بيعمل edit على الdomain يلي ماخذ عليه access
    </p>
    - customer
    <p dir="rtl">
    اله access read only على الdomain يلي ماخذ عليه access
    </p>

- API [designer, customer]
     - designer
    <p dir="rtl">
    بيقدر يعمل create API
    <br />
    و بيعمل edit على الAPI يلي ماخذ عليه access
    </p>
    - customer
    <p dir="rtl">
    اله access read only على الAPI يلي ماخذ عليه access
    </p>

![step_2](img2.png)

## Standardization

Build your internal standardization guide now. Choose from the list of rules below or add your own rules. Each rule will be applied to all the API definitions in your SwaggerHub Organization and will be validated each time a new API definition is saved to ensure design standards are being followed.

### create custom rule
the Title of API should start with capital letter
![creat_custom_rule](img3.png)

## Docs Branding
Upload a logo image to display in the header of your organization's published documentation

<p dir="rtl">
    بقدر من خلالها احدد الLogo يلي رح يظهر بال bar لما اعمل publish
    <br />
    كما بقدر احدد لون الbar
</p>

![set_logo_color](img4.png)
![publish](img5.png)
