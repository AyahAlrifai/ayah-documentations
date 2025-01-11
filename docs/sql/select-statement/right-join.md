---
sidebar_position: 6
---

# Right Join

A `RIGHT JOIN` (or `RIGHT OUTER JOIN`) is the opposite of a `LEFT JOIN`. It returns all rows from the right table and the matching rows from the left table. If no match exists, `NULL` values are included for the left table's columns.


## **1. Syntax**

```sql
SELECT columns
FROM table1
RIGHT JOIN table2
ON table1.column = table2.column;
```
- **`table1`**: The left table.  
- **`table2`**: The right table (all rows from this table will be included).  
- **`ON`**: Specifies the condition for matching rows between the two tables.

## **2. Example with Two Tables**

Imagine you have the following tables:

**`employees`**:  

| id   | name      | department_id |  
|------|-----------|---------------|  
| 1    | Alice     | 101           |  
| 2    | Bob       | 102           |  
| 3    | Charlie   | NULL          |  

**`departments`**:  

| id   | department_name |  
|------|-----------------|  
| 101  | HR              |  
| 102  | IT              |  
| 103  | Finance         |  

#### Query:
```sql
SELECT e.name, d.department_name 
FROM employees e 
RIGHT JOIN departments d 
ON e.department_id = d.id;
```

#### Result:

| name      | department_name |  
|-----------|-----------------|  
| Alice     | HR              |  
| Bob       | IT              |  
| NULL      | Finance         |  

- **Alice and Bob**: Found matching rows in the `employees` table based on the `department_id`.  
- **Finance**: No matching row in the `employees` table, so `NULL` is returned for the `name` column.

## **3. Use Cases**
1. **Finding Orphaned Rows**:  
   Identify rows in the right table that don’t have a match in the left table.  
   Example: Find departments with no employees:  

   ```sql
   SELECT d.department_name 
   FROM employees e 
   RIGHT JOIN departments d 
   ON e.department_id = d.id 
   WHERE e.name IS NULL;
   ```

2. **Ensuring Inclusion of the Right Table**:  
   Use `RIGHT JOIN` when the focus is on retaining all rows from the right table, regardless of matching rows in the left table.  

3. **Optional Relationships**:  
   Use it when the right table has mandatory rows, but the left table might not always have corresponding data.

## **4. Comparing to Other Joins**
- **`INNER JOIN`**: Only includes rows with matches in both tables.  
- **`LEFT JOIN`**: Includes all rows from the left table, even if no match exists in the right table.  
- **`RIGHT JOIN`**: Includes all rows from the right table, even if no match exists in the left table.

## **5. Advanced Example: Combining Multiple Tables**

You can use `RIGHT JOIN` in queries involving more than two tables.  
For example:  

```sql
SELECT e.name, d.department_name, p.project_name 
FROM employees e 
RIGHT JOIN departments d ON e.department_id = d.id 
LEFT JOIN projects p ON e.id = p.employee_id;
```

- Combines employees with departments (ensuring all departments are included) and further adds project information for matching employees.

## **6. LEFT JOIN vs RIGHT JOIN**
- **`LEFT JOIN`**: Retains all rows from the left table.  
- **`RIGHT JOIN`**: Retains all rows from the right table.  
- Both can achieve similar results depending on the order of the tables, but the focus shifts based on which table's rows you want to include completely.

