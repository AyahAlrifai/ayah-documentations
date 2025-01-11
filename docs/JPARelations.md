---
sidebar_position: 11
---

# JPA Relations

<div dir = "rtl">

الـ `JPA` (Java Persistence API) توفر العديد من الأنوتيشنات التي تُستخدم في تحديد العلاقات بين الكائنات في قاعدة البيانات. سأشرح الأنوتيشنات الخاصة بالعلاقات (مثل `@OneToOne`, `@OneToMany`, `@ManyToOne`, `@ManyToMany`) بشكل مفصل مع الحقول التي تأخذها ومعانيها.

## 1. **@OneToOne**

#### **الوصف**:
يُستخدم هذا الأنوتيشن لتمثيل علاقة واحد إلى واحد بين كائنين. بمعنى أن كل كائن في الكائن الأول مرتبط بكائن واحد فقط في الكائن الثاني.

#### **الحقول المستخدمة**:

- **mappedBy**: 
  - هذا الحقل يُستخدم في الجهة "العكسية" للعلاقة لتحديد الحقل الذي يحتوي على العلاقة. يُستخدم على الكائن الذي لا يمتلك المفتاح الأجنبي. 
  - **مثال**: في العلاقة بين `Person` و `Passport`، سيتم تعيين `mappedBy = "person"` في كائن `Passport`.

- **@JoinColumn**: 
  - يُستخدم لتحديد العمود الذي يحتوي على المفتاح الأجنبي في الجدول المرتبط. 
  - **مثال**: في `Passport`، يُستخدم هذا لتحديد العمود الذي يشير إلى `Person`.

#### **مثال**:
```java
@Entity
public class Person {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    @OneToOne(mappedBy = "person")
    private Passport passport;

    // Getters and setters
}

@Entity
public class Passport {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String passportNumber;

    @OneToOne
    @JoinColumn(name = "person_id")
    private Person person;

    // Getters and setters
}
```

## 2. **@OneToMany**

#### **الوصف**:
يُستخدم هذا الأنوتيشن لتمثيل علاقة واحد إلى كثير، حيث يرتبط كائن واحد بعدة كائنات. في العادة، نستخدمه في الجهة التي تحتوي على "المالك" أو "المؤسسة" التي تربط العديد من الكائنات الأخرى.

#### **الحقول المستخدمة**:

- **mappedBy**: 
  - يُستخدم لتحديد الحقل في الكائن الآخر الذي يمتلك المفتاح الأجنبي (العلاقة العكسية).
  - **مثال**: في مثال `Department` و `Employee`، يكون `mappedBy = "department"` في `Department`.

- **cascade**: 
  - يُستخدم لتحديد العمليات التي سيتم تطبيقها تلقائيًا على الكائنات المرتبطة (مثل حفظ، تحديث، حذف).
  - **مثال**: يمكن تحديد `cascade = CascadeType.ALL` لكي تُطبق العمليات على الكائنات المرتبطة.

#### **مثال**:
```java
@Entity
public class Department {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    @OneToMany(mappedBy = "department", cascade = CascadeType.ALL)
    private List<Employee> employees;

    // Getters and setters
}

@Entity
public class Employee {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    @ManyToOne
    @JoinColumn(name = "department_id")
    private Department department;

    // Getters and setters
}
```

## 3. **@ManyToOne**

#### **الوصف**:
يُستخدم هذا الأنوتيشن لتمثيل علاقة كثير إلى واحد، حيث يرتبط العديد من الكائنات بكائن واحد. في العادة، يُستخدم في الكائنات التي تحتوي على المفتاح الأجنبي.

#### **الحقول المستخدمة**:

- **@JoinColumn**: 
  - يُستخدم لتحديد العمود الذي يحتوي على المفتاح الأجنبي.
  - **مثال**: في `Employee`، نحدد أن `department_id` هو العمود الذي يشير إلى `Department`.

#### **مثال**:
```java
@Entity
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String orderDetails;

    @ManyToOne
    @JoinColumn(name = "customer_id")
    private Customer customer;

    // Getters and setters
}

@Entity
public class Customer {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    // Getters and setters
}
```

## 4. **@ManyToMany**

#### **الوصف**:
يُستخدم هذا الأنوتيشن لتمثيل علاقة كثير إلى كثير بين كائنين. في هذا النوع من العلاقة، يتم ربط العديد من الكائنات في كلا الجانبين، مما يتطلب عادةً جدول ربط (join table).

#### **الحقول المستخدمة**:

- **mappedBy**: 
  - يُستخدم في الجهة العكسية للعلاقة لتحديد الحقل الذي يمتلك العلاقة من الجهة الأخرى.
  - **مثال**: في العلاقة بين `Student` و `Course`، سيكون `mappedBy = "students"` في `Course`.

- **@JoinTable**: 
  - يُستخدم لتحديد جدول الربط الذي يحفظ العلاقة بين الكائنات في الجانبين. يحتوي على عمودي `joinColumns` و `inverseJoinColumns` لتحديد كيفية ربط الكائنات.
  - **مثال**: في العلاقة بين `Student` و `Course`، نستخدم `@JoinTable` لتحديد جدول ربط مثل `student_course`.

#### **مثال**:
```java
@Entity
public class Student {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String name;

    @ManyToMany
    @JoinTable(
        name = "student_course",
        joinColumns = @JoinColumn(name = "student_id"),
        inverseJoinColumns = @JoinColumn(name = "course_id")
    )
    private List<Course> courses;

    // Getters and setters
}

@Entity
public class Course {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String courseName;

    @ManyToMany(mappedBy = "courses")
    private List<Student> students;

    // Getters and setters
}
```

### **خلاصة**
- **@OneToOne**: يُستخدم لتمثيل علاقة واحد إلى واحد بين كائنين.
- **@OneToMany**: يُستخدم لتمثيل علاقة واحد إلى كثير حيث يرتبط كائن واحد بعدة كائنات.
- **@ManyToOne**: يُستخدم لتمثيل علاقة كثير إلى واحد حيث يرتبط العديد من الكائنات بكائن واحد.
- **@ManyToMany**: يُستخدم لتمثيل علاقة كثير إلى كثير حيث يرتبط العديد من الكائنات في كلا الجانبين.

كل هذه الأنوتيشنات تستخدم لتحديد نوع العلاقة بين الكائنات وكيفية تعامل JPA مع تلك العلاقات في قاعدة البيانات.

</div>