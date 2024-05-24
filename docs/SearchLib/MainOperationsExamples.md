---
sidebar_position: 2
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Main Operations Examples

## Equal Long Value

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("id", Operation.EQUAL, 1L));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
   // highlight-next-line
        s1_0.id=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>



## Equal Double Number
<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.EQUAL, 3.2));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
   // highlight-next-line
        s1_0.gpa=? 
    offset
        ? rows 
    fetch
        first ? rows only

  ```

  </TabItem>
</Tabs>


## Equal Long Value Inside a Related Object

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
  DataManipulationModel dataManipulationModel = new DataManipulationModel();
  // highlight-next-line
  // highlight-next-line
dataManipulationModel.setCriteria(condition("community.id", Operation.EQUAL, 5L));
  GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
  Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
   // highlight-next-line
        s1_0.community_id=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Equal LocalDate

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
  DataManipulationModel dataManipulationModel = new DataManipulationModel();
  // highlight-next-line
  // highlight-next-line
dataManipulationModel.setCriteria(condition("dateOfBirth", Operation.EQUAL, LocalDate.of(1997, 5, 7)));
  GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
  Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
   // highlight-next-line
        s1_0.date_of_birth=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## In Long Values

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(condition("students.id", Operation.IN, 1, 2));
GeneralSpecification<Community> communityGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Community> page = communityRepository.findAll(communityGeneralSpecification, PageRequest.of(0, 10));
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers {11}
      select
        c1_0.id,
        c1_0.class_name,
        c1_0.teacher 
    from
        community c1_0 
    join
        student s1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        s1_0.id in (?, ?) 
    offset
        ? rows 
    fetch
        first ? rows only

  ```

  </TabItem>
</Tabs>



## In String Value

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpaLetter", Operation.IN, "A", "A-", "A+"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.gpa_letter in (?, ?, ?) 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## Not In String Value

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpaLetter", Operation.NOT_IN, "A", "A-", "A+"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));    
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
    where
    // highlight-next-line
        s1_0.gpa_letter not in (?, ?, ?) 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## In Without Values

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(condition("id", Operation.IN));
GeneralSpecification<Community> communityGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Community> page = communityRepository.findAll(communityGeneralSpecification, PageRequest.of(0, 10));
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers {8}
    select
        c1_0.id,
        c1_0.class_name,
        c1_0.teacher 
    from
        community c1_0 
    where
    // highlight-next-line
        1=0 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## Like

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("firstName", Operation.LIKE, "%Aya%"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.first_name like ? escape '' 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## Not Like

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("firstName", Operation.NOT_LIKE, "%Aya%"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
   // highlight-next-line
        s1_0.first_name not like ? escape ''
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## Like String Value Inside a Related Object

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("students.lastName", Operation.LIKE, "Ri%"));
GeneralSpecification<Community> communityGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Community> page = communityRepository.findAll(communityGeneralSpecification, PageRequest.of(0, 10));
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers 
    select
        c1_0.id,
        c1_0.class_name,
        c1_0.teacher 
    from
        community c1_0 
    join
        student s1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        s1_0.last_name like ? escape '' 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Greater Than

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.GREATER_THAN, 3.2));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));

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
    where
    // highlight-next-line
        s1_0.gpa>? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## Greater Than Or Equal

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.GREATER_THAN_EQUAL, 3.2));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.gpa>=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Less Than

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.LESS_THAN, 3.2));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.gpa<? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Less Than Or Equal

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.LESS_THAN_EQUAL, 3.2));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.gpa<=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>


## Greater Than LocalDate

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("dateOfBirth", Operation.GREATER_THAN, LocalDate.of(1997, 5, 7)));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.date_of_birth>? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Is Empty String

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("address", Operation.IS_EMPTY_STRING));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.address=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Is Not Empty String

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("address", Operation.IS_NOT_EMPTY_STRING));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.address<>? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Is Null

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(condition("community", Operation.IS_NULL));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers {18}
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
    where
    // highlight-next-line
        s1_0.community_id is null 
    offset
        ? rows 
    fetch
        first ? rows only

  ```

  </TabItem>
</Tabs>


## Is True

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("isFullTime", Operation.IS_TRUE));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.is_full_time=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Is False

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("isFullTime", Operation.IS_FALSE));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.is_full_time=? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Between Double

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.BETWEEN, 3.2, 3.9));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.gpa between ? and ? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>

## Between Date

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("enrollmentDate", Operation.BETWEEN, LocalDate.of(2022, 2, 15),
// highlight-next-line
        LocalDate.of(2022, 7, 1)));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
Page<Student> page = studentRepository.findAll(studentGeneralSpecification, PageRequest.of(0, 10));
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
    where
    // highlight-next-line
        s1_0.enrollment_date between ? and ? 
    offset
        ? rows 
    fetch
        first ? rows only
  ```

  </TabItem>
</Tabs>