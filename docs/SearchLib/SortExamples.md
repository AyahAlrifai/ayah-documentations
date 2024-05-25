---
sidebar_position: 4
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Sort Examples

## Sort ASC

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setSortModel(asc("gpa"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers 
    select
        s1_0.id,
        s1_0.additional_info,
        s1_0.address,
        s1_0.community_id,
        s1_0.date_of_birth,
        s1_0.email,
        s1_0.enrollment_date,
        s1_0.first_name,
        s1_0.gpa,
        s1_0.gpa_letter,
        s1_0.is_full_time,
        s1_0.last_name,
        s1_0.phone_number 
    from
        student s1_0 
    order by
    // highlight-next-line
        s1_0.gpa 
  ```

  </TabItem>
</Tabs>

## Sort DESC

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setSortModel(desc("gpa"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers 
    select
        s1_0.id,
        s1_0.additional_info,
        s1_0.address,
        s1_0.community_id,
        s1_0.date_of_birth,
        s1_0.email,
        s1_0.enrollment_date,
        s1_0.first_name,
        s1_0.gpa,
        s1_0.gpa_letter,
        s1_0.is_full_time,
        s1_0.last_name,
        s1_0.phone_number 
    from
        student s1_0 
    order by
    // highlight-next-line
        s1_0.gpa desc 
  ```

  </TabItem>
</Tabs>

## Multi Sort DESC and ASC (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setSortModel(desc("gpa"), asc("firstName"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers 
    select
        s1_0.id,
        s1_0.additional_info,
        s1_0.address,
        s1_0.community_id,
        s1_0.date_of_birth,
        s1_0.email,
        s1_0.enrollment_date,
        s1_0.first_name,
        s1_0.gpa,
        s1_0.gpa_letter,
        s1_0.is_full_time,
        s1_0.last_name,
        s1_0.phone_number 
    from
        student s1_0 
    order by
    // highlight-next-line
        s1_0.gpa desc,
    // highlight-next-line
        s1_0.first_name 

  ```

  </TabItem>
</Tabs>

## Multi Sort DESC and ASC (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setSortModel(asc("gpa"), desc("firstName"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers 
    select
        s1_0.id,
        s1_0.additional_info,
        s1_0.address,
        s1_0.community_id,
        s1_0.date_of_birth,
        s1_0.email,
        s1_0.enrollment_date,
        s1_0.first_name,
        s1_0.gpa,
        s1_0.gpa_letter,
        s1_0.is_full_time,
        s1_0.last_name,
        s1_0.phone_number 
    from
        student s1_0 
    order by
    // highlight-next-line
        s1_0.gpa,
    // highlight-next-line
        s1_0.first_name desc 
  ```

  </TabItem>
</Tabs>

