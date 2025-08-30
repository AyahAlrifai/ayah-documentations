---
sidebar_position: 3
---

# From

The `FROM` keyword specifies the table from which the data should be retrieved. It defines the source of your query and works together with `SELECT` to determine where the data comes from.

## 1. **Basic Usage**  
The simplest form of the `FROM` clause is to specify a single table name:  
```sql
SELECT column1, column2 
FROM table_name;
```  
- Here, `table_name` is the name of the database table.  
- For example:  
  ```sql
  SELECT name, age 
  FROM employees;
  ```  
  This retrieves the `name` and `age` columns from the `employees` table.


## 2. **Using Aliases with Tables**  
Table aliases can make your queries more readable, especially when using long table names or joining multiple tables.  
```sql
SELECT e.name, d.department_name 
FROM employees e, departments d;
```  
- Here, `e` and `d` are aliases for the `employees` and `departments` tables, allowing you to reference them more easily.


## 3. **Joining Multiple Tables**  
The `FROM` clause can include multiple tables with different types of joins to combine data.  
- Example with `INNER JOIN`:  
  ```sql
  SELECT e.name, d.department_name 
  FROM employees e 
  INNER JOIN departments d 
  ON e.department_id = d.id;
  ```  
  This fetches employee names along with their department names by linking the two tables on a common column (`department_id`).


## 4. **Using Subqueries in FROM**  
You can use subqueries in the `FROM` clause to treat the result of a query as a temporary table.  
```sql
SELECT name, total_sales 
FROM (
  SELECT employee_id, SUM(sales) AS total_sales 
  FROM sales 
  GROUP BY employee_id
) AS sales_summary;
```  
- Here, the subquery calculates total sales for each employee, and the main query retrieves the employee name and total sales.


## 5. **Combining with Joins and Filters**  
When combined with `WHERE`, `GROUP BY`, and other clauses, the `FROM` clause serves as the foundation for querying data. For example:  
```sql
SELECT e.name, COUNT(p.project_id) AS total_projects 
FROM employees e 
LEFT JOIN projects p 
ON e.id = p.employee_id 
WHERE e.status = 'active' 
GROUP BY e.name;
```  
This query retrieves active employees and the total number of projects they are involved in.
