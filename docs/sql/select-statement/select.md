---
sidebar_position: 2
---

# Select

The `SELECT` keyword is used to retrieve specific columns or data from a database table. It allows you to specify what data you want to fetch, such as all columns (`SELECT *`) or specific ones (`SELECT column1, column2`). This is the first step in most SQL queries.

## 1. **Basic Usage**  
   You can retrieve specific columns or all columns from a table.  
   ```sql
   SELECT column1, column2 FROM table_name;
   ```  
   - This fetches `column1` and `column2` from the specified table.  
   - To retrieve all columns, use `*`:  
     ```sql
     SELECT * FROM table_name;
     ```

## 2. **Column Aliases**  
   You can rename columns in the result set using aliases for better readability.  
   ```sql
   SELECT column1 AS alias_name FROM table_name;
   ```  
   For example, `SELECT first_name AS name FROM employees;` will display the column `first_name` as `name`.

## 3. **Expressions**  
   The `SELECT` statement allows you to perform calculations or apply functions on columns.  
   ```sql
   SELECT salary * 12 AS annual_salary FROM employees;
   ```  
   Here, the `SELECT` statement calculates the annual salary based on the `salary` column.

## 4. **Distinct Values**  
   To fetch unique values from a column, use the `DISTINCT` keyword.  
   ```sql
   SELECT DISTINCT column_name FROM table_name;
   ```  
   This removes duplicate rows for the specified column.

## 5. **Combining with Other Clauses**  
   The `SELECT` statement is often combined with other clauses to filter (`WHERE`), group (`GROUP BY`), sort (`ORDER BY`), or limit (`LIMIT`) the data.  
   Example:  
   ```sql
   SELECT name, age 
   FROM users 
   WHERE age > 30 
   ORDER BY age DESC 
   LIMIT 5;
   ```  
   This fetches the top 5 users older than 30, sorted by age in descending order.

## 6. **Subqueries**  
   You can use `SELECT` inside another query to retrieve data as part of a condition.  
   ```sql
   SELECT name 
   FROM employees 
   WHERE department_id = (SELECT id FROM departments WHERE name = 'IT');
   ```  
   Here, the inner `SELECT` retrieves the department ID for "IT", and the outer query fetches employees in that department.
