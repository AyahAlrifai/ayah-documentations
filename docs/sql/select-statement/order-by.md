---
sidebar_position: 10
---

# Order By

The `ORDER BY` clause is used to sort the rows in the result set by one or more columns, either in ascending (`ASC`) or descending (`DESC`) order. For example, `ORDER BY name ASC` sorts by name alphabetically.

## **1. Syntax**

```sql
SELECT column1, column2, ...
FROM table_name
ORDER BY column1 [ASC|DESC], column2 [ASC|DESC], ...;
```

- **`column1`, `column2`**: Columns or expressions by which to sort the results.  
- **`ASC`**: Specifies ascending order (default).  
- **`DESC`**: Specifies descending order.

## **2. Example: Sorting by One Column**

#### Query:
```sql
SELECT product_name, price
FROM products
ORDER BY price ASC;
```

#### Explanation:
- This query retrieves product names and their prices, sorted by price in ascending order (cheapest first).

#### Result:

| product_name  | price |
|---------------|-------|
| Product A     | 10    |
| Product B     | 15    |
| Product C     | 20    |

## **3. Example: Sorting by Multiple Columns**

#### Query:
```sql
SELECT product_name, category, price
FROM products
ORDER BY category ASC, price DESC;
```

#### Explanation:
- Sorts products first by `category` in ascending order (alphabetically).
- Within each category, sorts by `price` in descending order (highest price first).

#### Result:

| product_name  | category  | price |
|---------------|-----------|-------|
| Product A     | Electronics | 30    |
| Product B     | Electronics | 20    |
| Product C     | Furniture   | 50    |


## **4. Example: Sorting with Calculated Columns**

You can sort by an expression or calculation rather than a column.

#### Query:
```sql
SELECT product_name, price, quantity, (price * quantity) AS total_value
FROM products
ORDER BY total_value DESC;
```

#### Explanation:
- Calculates `total_value` as `price * quantity` for each row.
- Sorts the result set by `total_value` in descending order.

## **5. Example: Sorting with Null Values**

#### Query:
```sql
SELECT product_name, price
FROM products
ORDER BY price ASC;
```

#### Null Handling:
- Rows with `NULL` in the `price` column appear first when sorted in ascending order.
- To customize null handling:
  ```sql
  ORDER BY price IS NULL ASC, price ASC;
  ```

#### Explanation:
- The first part (`price IS NULL ASC`) moves null values to the end.
- The second part (`price ASC`) sorts non-null values in ascending order.

## **6. Advanced Sorting**

#### a. Sorting with Aliases:
You can use aliases from the `SELECT` statement for sorting.

```sql
SELECT product_name, (price * quantity) AS total_value
FROM products
ORDER BY total_value DESC;
```

#### b. Sorting by Position:
Instead of specifying column names, you can use column positions.

```sql
SELECT product_name, category, price
FROM products
ORDER BY 2, 3 DESC;
```

- `2` refers to `category`.
- `3` refers to `price`.

## **7. Common Mistakes**

1. **Missing Column in `SELECT`:**
   - Sorting by a column not included in the `SELECT` statement is valid in SQL but might be confusing.
   - Example:
     ```sql
     SELECT product_name
     FROM products
     ORDER BY price DESC; -- `price` is not displayed but still used for sorting
     ```

2. **Incorrect Use of Aliases:**
   - Aliases cannot be used in `ORDER BY` in some databases if they are defined in the same query level.  
   - Example:
     ```sql
     SELECT product_name, (price * quantity) AS total_value
     FROM products
     ORDER BY total_value; -- Works
     ```

3. **Ambiguous Sorting:**
   - If multiple rows have the same value in the sorted column, the order of those rows is undefined unless additional columns are used for sorting.