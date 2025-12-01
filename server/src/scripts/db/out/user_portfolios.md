# Table: user_portfolios

Generated on: 23/11/2025, 12:50:14

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Foreign Keys (References)](#foreign-keys-references)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name | Data Type                   | Max Length | Nullable | Default                                            | Unique |
| ----------- | --------------------------- | ---------- | -------- | -------------------------------------------------- | ------ |
| id          | integer                     | N/A        | NO       | nextval('user_portfolio_history_id_seq'::regclass) | ✓      |
| discord_id  | text                        | N/A        | NO       | None                                               |        |
| total_value | numeric                     | N/A        | NO       | None                                               |        |
| recorded_at | timestamp without time zone | N/A        | NO       | CURRENT_TIMESTAMP                                  |        |

## Constraints

| Constraint Name                      | Type        |
| ------------------------------------ | ----------- |
| user_portfolio_history_pkey          | PRIMARY KEY |
| fk_user_portfolio_history_discord_id | FOREIGN KEY |
| 2200_41719_1_not_null                | CHECK       |
| 2200_41719_2_not_null                | CHECK       |
| 2200_41719_3_not_null                | CHECK       |
| 2200_41719_4_not_null                | CHECK       |

## Foreign Keys (References)

This table references the following tables:

| Column     | References Table | References Column | On Delete | On Update |
| ---------- | ---------------- | ----------------- | --------- | --------- |
| discord_id | **users**        | discord_id        | CASCADE   | CASCADE   |

## TypeScript Interfaces

### Full Interface

```typescript
export interface UserPortfolios {
  /** Identifier/Unique */
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  total_value: string;
  recorded_at: Date;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface UserPortfoliosIdentifiers {
  id: number;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface UserPortfoliosNonIdentifiers {
  /** Foreign key to users table */
  discord_id: string;
  total_value: string;
  recorded_at: Date;
}
```
