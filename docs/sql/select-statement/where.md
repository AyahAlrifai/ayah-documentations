---
sidebar_position: 7
---

# Where

The `WHERE` clause filters rows from the table or tables based on a specified condition. It allows you to retrieve only the rows that meet the condition, such as `WHERE age > 30` to get rows where the age column has values greater than 30.

## **1. Syntax**
```sql
SELECT column1, column2, ...
FROM table_name
WHERE condition;
```
- **`condition`**: A logical expression that determines which rows to include in the result. Only rows where the condition evaluates to `TRUE` are returned.


## **2. Examples of Conditions**

1. **Simple Condition**:  
   Retrieve rows where a column equals a specific value.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE department_id = 101;
   ```

2. **Multiple Conditions (AND)**:  
   Retrieve rows that satisfy multiple conditions.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE department_id = 101 AND salary > 5000;
   ```

3. **Multiple Conditions (OR)**:  
   Retrieve rows that satisfy at least one condition.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE department_id = 101 OR department_id = 102;
   ```

4. **Range (BETWEEN)**:  
   Retrieve rows where a value falls within a range.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE salary BETWEEN 3000 AND 7000;
   ```

5. **Set (IN)**:  
   Retrieve rows where a column matches any value in a list.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE department_id IN (101, 102, 103);
   ```

6. **Pattern Matching (LIKE)**:  
   Retrieve rows where a column matches a pattern.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE name LIKE 'A%';  -- Names starting with 'A'
   ```

7. **Null Check (IS NULL / IS NOT NULL)**:  
   Retrieve rows where a column has or doesn’t have a `NULL` value.  
   ```sql
   SELECT * 
   FROM employees 
   WHERE department_id IS NULL;
   ```

## **3. Advanced Examples**

#### Filtering with Calculated Values
You can use expressions in the `WHERE` clause.  
```sql
SELECT * 
FROM employees 
WHERE (salary * 1.1) > 5000;  -- After a 10% increase
```

#### Using Subqueries
The `WHERE` clause can use subqueries for dynamic filtering.  
```sql
SELECT * 
FROM employees 
WHERE department_id = (SELECT id FROM departments WHERE department_name = 'HR');
```

## **4. Use Cases**
1. **Filter Data**: Retrieve specific rows based on business requirements (e.g., get employees in a particular department).  
2. **Data Validation**: Ensure only valid rows are processed or returned.  
3. **Subset Creation**: Create a smaller dataset from a larger table for further analysis or reporting.