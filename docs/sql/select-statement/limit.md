---
sidebar_position: 11
---

# Limit

The `LIMIT` clause restricts the number of rows returned in the result set. For example, `LIMIT 10` retrieves only the first 10 rows, which is useful for performance and pagination in large datasets.  


## **1. Syntax**

```sql
SELECT column1, column2, ...
FROM table_name
LIMIT row_count OFFSET start_row;
```

- **`row_count`**: Specifies the maximum number of rows to return.
- **`OFFSET`**: Specifies the number of rows to skip before starting to return rows (optional).

## **2. Basic Usage**

#### Query:
```sql
SELECT product_name, price
FROM products
LIMIT 5;
```

#### Explanation:
- Retrieves the first 5 rows from the `products` table.

#### Result:

| product_name  | price |
|---------------|-------|
| Product A     | 10    |
| Product B     | 20    |
| Product C     | 15    |
| Product D     | 30    |
| Product E     | 25    |


## **3. Usage with OFFSET**

#### Query:
```sql
SELECT product_name, price
FROM products
ORDER BY price DESC
LIMIT 3 OFFSET 2;
```

#### Explanation:
- Skips the first 2 rows and retrieves the next 3 rows, sorted by price in descending order.

#### Result:

| product_name  | price |
|---------------|-------|
| Product C     | 25    |
| Product D     | 20    |
| Product E     | 15    |

---

## **4. Pagination Example**

When implementing pagination, `LIMIT` and `OFFSET` are commonly used to divide results into pages.

#### Query for Page 1:
```sql
SELECT product_name, price
FROM products
ORDER BY price ASC
LIMIT 10 OFFSET 0;
```

#### Query for Page 2:
```sql
SELECT product_name, price
FROM products
ORDER BY price ASC
LIMIT 10 OFFSET 10;
```

#### Explanation:
- Each page contains 10 rows.
- Page 1 starts from row 0.
- Page 2 skips the first 10 rows and retrieves the next 10.

## **5. Common Mistakes**

1. **Missing `ORDER BY`:**
   - Without `ORDER BY`, the rows returned by `LIMIT` may be arbitrary, as the database does not guarantee any specific order.
   - Example:
     ```sql
     SELECT * FROM products LIMIT 10; -- Order is undefined
     ```

2. **Incorrect OFFSET Calculation:**
   - OFFSET starts at 0, not 1. Miscalculating it can lead to skipping the wrong rows.

3. **Inefficiency with Large Offsets:**
   - Using a large `OFFSET` value can slow down queries as the database still processes skipped rows. For example:
     ```sql
     SELECT * FROM orders LIMIT 10 OFFSET 10000; -- Potentially slow
     ```