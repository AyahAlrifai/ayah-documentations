---
sidebar_position: 5
---

import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Invalid Used Examples

## Invalid Field Value (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("id", Operation.EQUAL, "a"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The value a is not compatible with type class java.lang.Long

	at com.aya.search.specification.GeneralSpecification.convertFieldValue(GeneralSpecification.java:241)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:155)
	at com.aya.search.specification.GeneralSpecification.toPredicate(GeneralSpecification.java:77)
  ```

  </TabItem>
</Tabs>

## Invalid Field Value (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("enrollmentDate", Operation.EQUAL, "05-05-2022"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The value 05-05-2022 is not compatible with type class java.time.LocalDate

	at com.aya.search.specification.GeneralSpecification.convertFieldValue(GeneralSpecification.java:241)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:155)
  ```

  </TabItem>
</Tabs>

## Invalid Field Value (3)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("id", Operation.EQUAL, 3.7));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The value 3.7 is not compatible with type class java.lang.Long

	at com.aya.search.specification.GeneralSpecification.convertFieldValue(GeneralSpecification.java:241)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:155)
  ```

  </TabItem>
</Tabs>

## Invalid Number of Field Value (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.IS_NULL, 3.7));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The number of field values [3.7] are not compatible with operation IS_NULL

	at com.aya.search.specification.GeneralSpecification.getOperation(GeneralSpecification.java:58)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:159)
  ```

  </TabItem>
</Tabs>

## Invalid Number of Field Value (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.IS_NOT_NULL, 3.7));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The number of field values [3.7] are not compatible with operation IS_NOT_NULL

	at com.aya.search.specification.GeneralSpecification.getOperation(GeneralSpecification.java:58)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:159)
  ```

  </TabItem>
</Tabs>

## Invalid Number of Field Value (3)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.IS_EMPTY_STRING, 3.7));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The number of field values [3.7] are not compatible with operation IS_EMPTY_STRING

	at com.aya.search.specification.GeneralSpecification.getOperation(GeneralSpecification.java:58)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:159)

  ```

  </TabItem>
</Tabs>

## Invalid Number of Field Value (4)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("gpa", Operation.IS_NOT_EMPTY_STRING, 3.7));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: The number of field values [3.7] are not compatible with operation IS_NOT_EMPTY_STRING

	at com.aya.search.specification.GeneralSpecification.getOperation(GeneralSpecification.java:58)
	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:159)
  ```

  </TabItem>
</Tabs>

## Invalid Field Name (1)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("GPA", Operation.GREATER_THAN, 3.7));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: Could not resolve attribute GPA of class com.aya.search.entity.Student.

	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:149)
	at com.aya.search.specification.GeneralSpecification.toPredicate(GeneralSpecification.java:77)
  ```

  </TabItem>
</Tabs>

## Invalid Field Name (2)

<Tabs>
  <TabItem value="java" label="Java">

  ```java showLineNumbers 
DataManipulationModel dataManipulationModel = new DataManipulationModel();
// highlight-next-line
dataManipulationModel.setCriteria(condition("community.Teacher", Operation.LIKE, "%Ayah%"));
GeneralSpecification<Student> studentGeneralSpecification = new GeneralSpecification<>(dataManipulationModel);
studentRepository.findAll(studentGeneralSpecification);
  ```

  </TabItem>
  <TabItem value="java-error" label="Java Exception">

  ```java showLineNumbers 
com.aya.search.exception.GenerateSpecificationException: Could not resolve attribute Teacher of class com.aya.search.entity.Community.

	at com.aya.search.specification.GeneralSpecification.getConditionsPredicates(GeneralSpecification.java:149)
	at com.aya.search.specification.GeneralSpecification.toPredicate(GeneralSpecification.java:77)
  ```

  </TabItem>
</Tabs>