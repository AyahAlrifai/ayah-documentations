---
sidebar_position: 3
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Multiple Conditions Examples

## AND Condition (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(
// highlight-next-line
        and(
// highlight-next-line
                condition("community.className", Operation.LIKE, "%9%"),
// highlight-next-line
                condition("gpa", Operation.GREATER_THAN, 3.5)
// highlight-next-line
        ));
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        c1_0.class_name like ? escape '' 
    // highlight-next-line
        and s1_0.gpa>? 
  ```

  </TabItem>
</Tabs>

## AND Condition (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(
// highlight-next-line
        and(
// highlight-next-line
                condition("community.className", Operation.LIKE, "%9%"),
// highlight-next-line
                condition("gpa", Operation.GREATER_THAN, 3.5),
// highlight-next-line
                condition("additionalInfo", Operation.IS_NOT_NULL)
// highlight-next-line
        )
// highlight-next-line
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        c1_0.class_name like ? escape '' 
    // highlight-next-line
        and s1_0.gpa>? 
    // highlight-next-line
        and s1_0.additional_info is not null 
  ```

  </TabItem>
</Tabs>

## OR Condition (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(
// highlight-next-line
        or(
// highlight-next-line
                condition("gpaLetter", Operation.EQUAL, "A"),
// highlight-next-line
                condition("gpaLetter", Operation.EQUAL, "A-"),
// highlight-next-line
                condition("gpaLetter", Operation.EQUAL, "A+")
// highlight-next-line
        )
// highlight-next-line
);
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
    where
    // highlight-next-line
        s1_0.gpa_letter=? 
    // highlight-next-line
        or s1_0.gpa_letter=? 
    // highlight-next-line
        or s1_0.gpa_letter=? 
  ```

  </TabItem>
</Tabs>

## OR Condition (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(
// highlight-next-line
        or(
// highlight-next-line
                condition("community.className", Operation.EQUAL, "9th B"),
// highlight-next-line
                condition("community.className", Operation.EQUAL, "9th A")
// highlight-next-line
        )
// highlight-next-line
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        c1_0.class_name=? 
    // highlight-next-line
        or c1_0.class_name=? 

  ```

  </TabItem>
</Tabs>

## AND and OR Condition (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(
// highlight-next-line
        and(
// highlight-next-line
                or(
// highlight-next-line
                        condition("community.className", Operation.EQUAL, "9th B"),
// highlight-next-line
                        condition("community.className", Operation.EQUAL, "9th A")
// highlight-next-line
                ),
// highlight-next-line
                condition("gpaLetter", Operation.IN, "A", "A-")
// highlight-next-line
        )
// highlight-next-line
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        (
            c1_0.class_name=? 
    // highlight-next-line
            or c1_0.class_name=?
    // highlight-next-line
        ) 
    // highlight-next-line
        and s1_0.gpa_letter in (?, ?) 
  ```

  </TabItem>
</Tabs>

## AND and OR Condition (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers  {2-11}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        or(
                and(
                        condition("gpaLetter", Operation.IN, "A", "A-"),
                        condition("community.className", Operation.EQUAL, "9th B")
                ),
                condition("community.className", Operation.EQUAL, "9th A")
        )
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        s1_0.gpa_letter in (?, ?) 
    // highlight-next-line
        and c1_0.class_name=? 
    // highlight-next-line
        or c1_0.class_name=? 
  ```

  </TabItem>
</Tabs>

## AND and OR Condition (3)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-11}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        and(
                condition("gpaLetter", Operation.IN, "A", "A-"),
                or(
                        condition("community.className", Operation.EQUAL, "7th C"),
                        condition("community.className", Operation.EQUAL, "9th B"),
                        condition("community.className", Operation.EQUAL, "9th A")
                )
        )
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        s1_0.gpa_letter in (?, ?) 
    // highlight-next-line
        and (
    // highlight-next-line
            c1_0.class_name=? 
    // highlight-next-line
            or c1_0.class_name=? 
    // highlight-next-line
            or c1_0.class_name=?
    // highlight-next-line
        ) 
  ```

  </TabItem>
</Tabs>

## AND and OR Condition (4)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-13}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        or(
                condition("gpaLetter", Operation.EQUAL, "A+"),
                condition("gpaLetter", Operation.EQUAL, "A"),
                and(
                        condition("gpaLetter", Operation.EQUAL, "A-"),
                        condition("community.className", Operation.EQUAL, "7th C")
                ),
                condition("community.className", Operation.EQUAL, "9th B"),
                condition("community.className", Operation.EQUAL, "9th A")
        )
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        s1_0.gpa_letter=? 
    // highlight-next-line
        or s1_0.gpa_letter=? 
    // highlight-next-line
        or s1_0.gpa_letter=? 
    // highlight-next-line
        and c1_0.class_name=? 
    // highlight-next-line
        or c1_0.class_name=? 
    // highlight-next-line
        or c1_0.class_name=? 
  ```

  </TabItem>
</Tabs>

## AND and OR Condition (5)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-14}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        or(
                and(
                        condition("id", Operation.IN, 1, 2, 3, 4),
                        condition("firstName", Operation.LIKE, "%a%")
                ),
                and(
                        condition("id", Operation.IN, 11, 12, 13, 14),
                        condition("firstName", Operation.LIKE, "%s%")
                )
        )
);
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
    where
    // highlight-next-line
        s1_0.id in (?, ?, ?, ?) 
    // highlight-next-line
        and s1_0.first_name like ? escape '' 
    // highlight-next-line
        or s1_0.id in (?, ?, ?, ?) 
    // highlight-next-line
        and s1_0.first_name like ? escape '' 
  ```

  </TabItem>
</Tabs>

## AND and OR Condition (6)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-13}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        and(
                or(
                        condition("id", Operation.IN, 1, 2, 3, 4),
                        condition("firstName", Operation.LIKE, "%a%")
                ),
                or(
                        condition("id", Operation.IN, 11, 12, 13, 14),
                        condition("firstName", Operation.LIKE, "%s%")
                )
        )
);
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
    where
    // highlight-next-line
        (
    // highlight-next-line
            s1_0.id in (?, ?, ?, ?) 
    // highlight-next-line
            or s1_0.first_name like ? escape ''
    // highlight-next-line
        ) 
    // highlight-next-line
        and (
    // highlight-next-line
            s1_0.id in (?, ?, ?, ?) 
    // highlight-next-line
            or s1_0.first_name like ? escape ''
    // highlight-next-line
        ) 

  ```

  </TabItem>
</Tabs>


## AND and OR Condition (7)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-11}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        or(
                condition("id", Operation.IN, 1, 2, 3, 4),
                condition("firstName", Operation.LIKE, "%a%"),
                and(
                        condition("id", Operation.IN, 11, 12, 13, 14),
                        condition("firstName", Operation.LIKE, "%s%")
                )
        )
);
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
    where
    // highlight-next-line
        s1_0.id in (?, ?, ?, ?) 
    // highlight-next-line
        or s1_0.first_name like ? escape '' 
    // highlight-next-line
        or s1_0.id in (?, ?, ?, ?) 
    // highlight-next-line
        and s1_0.first_name like ? escape '' 
  ```

  </TabItem>
</Tabs>

## AND and OR Condition (8)
<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-13}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setSortModel(asc("community.id"),
        desc("firstName"));
dataManipulationModel.setCriteria(
        and(
                condition("gpa", Operation.GREATER_THAN, 3.5),
                condition("community.className", Operation.LIKE, "%9%"),
                or(
                        condition("additionalInfo", Operation.IS_NULL),
                        condition("additionalInfo", Operation.IS_EMPTY_STRING)
                )
        )
);
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
    join
        community c1_0 
            on c1_0.id=s1_0.community_id 
    where
    // highlight-next-line
        s1_0.gpa>? 
    // highlight-next-line
        and c1_0.class_name like ? escape '' 
    // highlight-next-line
        and (
    // highlight-next-line
            s1_0.additional_info is null 
    // highlight-next-line
            or s1_0.additional_info=?
    // highlight-next-line
        ) 
    order by
        s1_0.community_id,
        s1_0.first_name desc 
  ```

  </TabItem>
</Tabs>


## AND and OR and NOT Condition
<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers {2-17}
DataManipulationModel dataManipulationModel = new DataManipulationModel();
dataManipulationModel.setCriteria(
        and(
                not(
                        or(
                            condition("id", Operation.IN, 1, 2, 3, 4),
                            condition("firstName", Operation.LIKE, "%a%")
                        )
                ),
                not(
                        or(
                            condition("id", Operation.IN, 11, 12, 13, 14),
                            condition("firstName", Operation.LIKE, "%s%")
                        )
                )
        )
);
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="sql" label="SQL">

  ```sql showLineNumbers {18-21}
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
        not(s1_0.id in (?, ?, ?, ?) 
        or s1_0.first_name like ? escape '') 
        and not(s1_0.id in (?, ?, ?, ?) 
        or s1_0.first_name like ? escape '') 
  ```

  </TabItem>
</Tabs>