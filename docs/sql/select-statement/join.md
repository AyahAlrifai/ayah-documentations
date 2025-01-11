---
sidebar_position: 4
---

# Join 

The `JOIN` (or  `INNER JOIN`) keyword is used to combine rows from two or more tables based on a related column. By joining tables, you can retrieve data spread across multiple tables and analyze it as a single dataset.

## **1. Basic Syntax**  
The syntax for an `INNER JOIN` looks like this:  
```sql
SELECT columns
FROM table1
INNER JOIN table2
ON table1.column = table2.column;
```
- **`table1`** and **`table2`** are the tables being joined.  
- **`ON`** specifies the condition for matching rows between the two tables.

## **2. Example with Two Tables**  
Imagine you have two tables:  
**`employees`** table:  

| id  | name       | department_id |  
|------|-----------|---------------|  
| 1    | Alice     | 101           |  
| 2    | Bob       | 102           |  
| 3    | Charlie   | NULL          |  

**`departments`** table:  

| id   | department_name |  
|------|-----------------|  
| 101  | HR              |  
| 102  | IT              |  
| 103  | Finance         |  

Query:  
```sql
SELECT e.name, d.department_name 
FROM employees e 
INNER JOIN departments d 
ON e.department_id = d.id;
```  
Result:

| name   | department_name |  
|--------|-----------------|  
| Alice  | HR              |  
| Bob    | IT              |  

- Only rows where `employees.department_id` matches `departments.id` are included.  
- Charlie is excluded because `department_id` is NULL, and no match exists in the `departments` table.

## **3. Multiple Joins**  
You can use `INNER JOIN` to join more than two tables. For example:  
```sql
SELECT e.name, d.department_name, p.project_name 
FROM employees e 
INNER JOIN departments d ON e.department_id = d.id 
INNER JOIN projects p ON e.id = p.employee_id;
```
- This joins three tables: employees, departments, and projects.

## **4. Aliases for Readability**  
Aliases make queries easier to read and write:  
```sql
SELECT e.name, d.department_name 
FROM employees AS e 
INNER JOIN departments AS d 
ON e.department_id = d.id;
```