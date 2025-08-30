---
sidebar_position: 1
---
import Tabs from '@theme/Tabs';
import TabItem from '@theme/TabItem';

# Project Structure and Main Class

## Project Tree

```
src
├───main
    ├───java
        └───com
            └───ayah
                └───aop
                    ├───annotation
                    |       |
                    |       |─────────Test.java
                    |
                    ├───aspect
                    |      |
                    |      |──────────TestAcpect.java
                    |
                    ├───initializer
                    |       |
                    |       |──────────AspectInitializer.java
                    |
                    └───service
                            |
                            |
                            |──────AspectService.java
                            |
                            |──────AspectService1.java
                            |
                            |──────AspectService2.java
    
```

## Coding

<Tabs>
  <TabItem value="Test" label="Test">

  ```java
package com.ayah.aop.annotation;

public @interface Test {

}
  ```
  </TabItem>
      <TabItem value="TestAspect" label="TestAspect">

  ```
  This class has different implementations in the next examples.
  ```
  </TabItem>
  <TabItem value="AspectInitializer" label="AspectInitializer">

  ```java
package com.ayah.aop.initializer;

import com.ayah.aop.service.AspectService1;
import com.ayah.aop.service.AspectService2;
import lombok.AllArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Configuration;

@AllArgsConstructor
@Configuration
public class AspectTestInitializer implements CommandLineRunner {

    private final AspectService1 aspectService1;
    private final AspectService2 aspectService2;

    @Override
    public void run(String... args) throws Exception {

        aspectService1.test1("Ayah","Al-Refai");
        aspectService1.test2(7,5);

        aspectService2.test1("Al-Refai","Ayah");
        aspectService2.test2(2,8);
    }
}
  ```
  </TabItem>
    <TabItem value="AspectService" label="AspectService">

  ```java
package com.ayah.aop.service;

public interface AspectService {

    String test1(String firstName, String lastName);

    Integer test2(Integer num1, Integer num2);
}
  ```
  </TabItem>
    <TabItem value="AspectService1" label="AspectService1">

  ```java
package com.ayah.aop.service;

import com.ayah.aop.annotation.Test;
import org.springframework.stereotype.Service;

@Service
public class AspectService1 implements AspectService {

    @Test()
    public String test1(String firstName, String lastName) {
        System.out.println("AspectService1 -> test1 -> " + firstName + " " + lastName);
        return firstName + " " + lastName;
    }

    public Integer test2(Integer num1, Integer num2) {
        System.out.println("AspectService1 -> test2 -> " + (num1 + num2));
        return num1 + num2;
    }
}
  ```
  </TabItem>
    <TabItem value="AspectService2" label="AspectService2">

  ```java
package com.ayah.aop.service;

import com.ayah.aop.annotation.Test;
import org.springframework.stereotype.Service;

@Service
public class AspectService2 implements AspectService {
    
    public String test1(String firstName, String lastName) {
        System.out.println("AspectService2 -> test1 -> " + firstName + " " + lastName);
        return firstName + " " + lastName;
    }

    @Test()
    public Integer test2(Integer num1, Integer num2) {
        System.out.println("AspectService2 -> test2 -> " + (num1 + num2));
        return num1 + num2;
    }
}
  ```
  </TabItem>
</Tabs>