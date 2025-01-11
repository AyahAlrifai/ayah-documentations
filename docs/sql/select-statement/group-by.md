---
sidebar_position: 8
---

# Group by

The `GROUP BY` clause groups rows that have the same values in specified columns into summary rows. For example, you can group sales data by `product_id` to calculate totals or averages for each product.

## **1. Syntax**
```sql
SELECT column1, aggregate_function(column2)
FROM table_name
GROUP BY column1;
```

- **`column1`**: The column by which rows are grouped.  
- **`aggregate_function(column2)`**: The function applied to each group (e.g., `SUM`, `COUNT`, etc.).  
- Every column in the `SELECT` list that is not aggregated must be included in the `GROUP BY` clause.

## **2. How It Works**
- The `GROUP BY` clause divides the rows of a table into groups based on the unique values in one or more columns.  
- For each group, aggregate functions are applied to calculate summary values like totals or averages.

## **3. Example**

**Table: `sales`**

| product_id | region    | quantity | price |  
|------------|-----------|----------|-------|  
| 1          | North     | 10       | 50    |  
| 2          | South     | 20       | 30    |  
| 1          | North     | 15       | 50    |  
| 3          | East      | 5        | 40    |  
| 2          | South     | 10       | 30    |  

#### Query:
```sql
SELECT product_id, SUM(quantity) AS total_quantity
FROM sales
GROUP BY product_id;
```

#### Result:

| product_id | total_quantity |  
|------------|----------------|  
| 1          | 25             |  
| 2          | 30             |  
| 3          | 5              |  

Explanation:  
- Rows with the same `product_id` are grouped together.  
- The `SUM(quantity)` calculates the total quantity for each product.

## **4. Example with Multiple Columns**

#### Query:
```sql
SELECT region, product_id, SUM(quantity) AS total_quantity
FROM sales
GROUP BY region, product_id;
```

#### Result:

| region    | product_id | total_quantity |  
|-----------|------------|----------------|  
| North     | 1          | 25             |  
| South     | 2          | 30             |  
| East      | 3          | 5              |  

Explanation:  
- The rows are grouped by `region` and `product_id`.  
- The `SUM(quantity)` calculates the total for each unique combination of `region` and `product_id`.


## **5. Common Mistakes**
1. **Not Including Columns in `GROUP BY`**:  
   All non-aggregated columns in the `SELECT` list must appear in the `GROUP BY` clause.  

   **Incorrect**:
   ```sql
   SELECT product_id, region, SUM(quantity)
   FROM sales
   GROUP BY product_id;
   ```

   **Correct**:
   ```sql
   SELECT product_id, region, SUM(quantity)
   FROM sales
   GROUP BY product_id, region;
   ```

2. **Using `WHERE` Instead of `HAVING`**:  
   Use `HAVING` to filter aggregated results, not `WHERE`.

   **Incorrect**:
   ```sql
   SELECT product_id, SUM(quantity)
   FROM sales
   GROUP BY product_id
   WHERE SUM(quantity) > 10;  -- Invalid
   ```

   **Correct**:
   ```sql
   SELECT product_id, SUM(quantity)
   FROM sales
   GROUP BY product_id
   HAVING SUM(quantity) > 10;
   ```