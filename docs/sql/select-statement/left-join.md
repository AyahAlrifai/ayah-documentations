---
sidebar_position: 5
---

# Left Join

A `LEFT JOIN` (or `LEFT OUTER JOIN`) returns all rows from the left table and the matching rows from the right table. If no match exists in the right table, the result will include `NULL` values for the right table's columns.

## **1. Syntax**

```sql
SELECT columns
FROM table1
LEFT JOIN table2
ON table1.column = table2.column;
```
- **`table1`**: The left table (all rows from this table will be included).  
- **`table2`**: The right table (only matching rows or `NULL` for no match will be included).  
- **`ON`**: Specifies the condition for matching rows between the two tables.

## **2. Example with Two Tables**

Imagine you have these two tables:

**`employees`**:  

| id   | name      | department_id |  
|------|-----------|---------------|  
| 1    | Alice     | 101           |  
| 2    | Bob       | 102           |  
| 3    | Charlie   | NULL          |  
| 4    | Diana     | 103           |  

**`departments`**:  

| id   | department_name |  
|------|-----------------|  
| 101  | HR              |  
| 102  | IT              |  

#### Query:  

```sql
SELECT e.name, d.department_name 
FROM employees e 
LEFT JOIN departments d 
ON e.department_id = d.id;
```

#### Result:  
| name      | department_name |  
|-----------|-----------------|  
| Alice     | HR              |  
| Bob       | IT              |  
| Charlie   | NULL            |  
| Diana     | NULL            |  

- **Alice and Bob**: Found matching rows in the `departments` table.  
- **Charlie and Diana**: No matching rows in the `departments` table, so `NULL` is returned for the `department_name` column.

## **3. Use Cases**
1. **Finding Missing Matches**:  
   You can use `LEFT JOIN` to identify rows in the left table that have no matching data in the right table.  
   Example: Find employees who are not assigned to any department:  
   ```sql
   SELECT e.name 
   FROM employees e 
   LEFT JOIN departments d 
   ON e.department_id = d.id 
   WHERE d.department_name IS NULL;
   ```

2. **Combining Data**:  
   Retrieve data from one table with additional information from another table (if available). For instance, get a list of all employees and their department names.

3. **Optional Relationships**:  
   Use it when not all rows in the left table have corresponding rows in the right table, but you still want to include those rows.

## **4. Comparing to INNER JOIN**
- **`INNER JOIN`**: Only includes rows with matches in both tables.  
- **`LEFT JOIN`**: Includes all rows from the left table, even if no match exists in the right table.  

## **5. Advanced Example: Combining Multiple Tables**
If you have more than two tables, you can chain multiple `LEFT JOIN` statements. For example:  
```sql
SELECT e.name, d.department_name, p.project_name 
FROM employees e 
LEFT JOIN departments d ON e.department_id = d.id 
LEFT JOIN projects p ON e.id = p.employee_id;
```
This retrieves all employees, their department names (if available), and the projects they are assigned to (if available).