---
sidebar_position: 9
---

# Having 

The `HAVING` clause is used to filter grouped data after applying the `GROUP BY` clause. It works like `WHERE`, but it applies to aggregated data, such as `HAVING SUM(sales) > 1000` to show groups with total sales above 1000.

## **1. Syntax**
```sql
SELECT column1, aggregate_function(column2)
FROM table_name
GROUP BY column1
HAVING condition;
```

- **`column1`**: The column being grouped.  
- **`aggregate_function(column2)`**: An aggregate function (e.g., `SUM`, `COUNT`, `AVG`).  
- **`condition`**: A condition applied to the aggregated data.


## **2. Key Differences Between `WHERE` and `HAVING`**

| Feature          | `WHERE`                              | `HAVING`                                |
|-------------------|-------------------------------------|-----------------------------------------|
| **Use Case**     | Filters rows before aggregation.     | Filters aggregated results after grouping. |
| **Aggregate Functions** | Cannot use aggregate functions.    | Can use aggregate functions.              |
| **Execution Order** | Applied first.                   | Applied after `GROUP BY`.                |

## **3. Example Without `HAVING`**

**Table: `sales`**

| region    | product_id | quantity | price |  
|-----------|------------|----------|-------|  
| North     | 1          | 10       | 50    |  
| South     | 2          | 20       | 30    |  
| North     | 1          | 15       | 50    |  
| East      | 3          | 5        | 40    |  
| South     | 2          | 10       | 30    |  

#### Query:
```sql
SELECT region, SUM(quantity) AS total_quantity
FROM sales
GROUP BY region;
```

#### Result:

| region    | total_quantity |  
|-----------|----------------|  
| North     | 25             |  
| South     | 30             |  
| East      | 5              |  

## **4. Example With `HAVING`**

Let’s filter regions where the total quantity is greater than 10.

#### Query:
```sql
SELECT region, SUM(quantity) AS total_quantity
FROM sales
GROUP BY region
HAVING total_quantity > 10;
```

#### Result:

| region    | total_quantity |  
|-----------|----------------|  
| North     | 25             |  
| South     | 30             |  

**Explanation**:  
- The `GROUP BY` clause grouped rows by `region`.  
- The `HAVING` clause filtered out groups where `total_quantity` is not greater than 10.

## **5. Advanced Example**

#### Example: Filter by Multiple Conditions
You can use multiple conditions with `HAVING`, such as combining aggregate functions.

#### Query:
```sql
SELECT product_id, SUM(quantity) AS total_quantity, AVG(price) AS average_price
FROM sales
GROUP BY product_id
HAVING total_quantity > 10 AND average_price > 35;
```

#### Result:

| product_id | total_quantity | average_price |  
|------------|----------------|---------------|  
| 1          | 25             | 50            |  

**Explanation**:  
- The query groups rows by `product_id`.  
- The `HAVING` clause filters groups where `total_quantity > 10` and `average_price > 35`.

## **6. Combining `HAVING` with `WHERE`**

#### Example:
Filter rows before grouping and filter groups after aggregation.

#### Query:
```sql
SELECT product_id, SUM(quantity) AS total_quantity
FROM sales
WHERE price > 30
GROUP BY product_id
HAVING total_quantity > 15;
```

#### Explanation:
1. **`WHERE price > 30`**: Filters rows where `price` is greater than 30.  
2. **`GROUP BY product_id`**: Groups the remaining rows by `product_id`.  
3. **`HAVING total_quantity > 15`**: Filters groups where the total quantity exceeds 15.

## **7. Common Mistakes**

1. **Using `HAVING` Without `GROUP BY`**:  
   The `HAVING` clause is only meaningful when used with `GROUP BY`.  
   - **Incorrect**:  
     ```sql
     SELECT product_id, SUM(quantity)
     FROM sales
     HAVING SUM(quantity) > 10;  -- Invalid without GROUP BY
     ```
   - **Correct**:  
     ```sql
     SELECT product_id, SUM(quantity)
     FROM sales
     GROUP BY product_id
     HAVING SUM(quantity) > 10;
     ```

2. **Confusing `WHERE` and `HAVING`**:  
   Use `WHERE` to filter rows and `HAVING` to filter aggregated data.  
   - **Incorrect**:  
     ```sql
     SELECT product_id, SUM(quantity)
     FROM sales
     GROUP BY product_id
     WHERE SUM(quantity) > 10;  -- Invalid
     ```

   - **Correct**:  
     ```sql
     SELECT product_id, SUM(quantity)
     FROM sales
     GROUP BY product_id
     HAVING SUM(quantity) > 10;
     ```