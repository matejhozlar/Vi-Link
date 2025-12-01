# Table: crypto_token_history_minutely

Generated on: 23/11/2025, 14:28:09

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Foreign Keys (References)](#foreign-keys-references)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name | Data Type                   | Max Length | Nullable | Default                                                 | Unique |
| ----------- | --------------------------- | ---------- | -------- | ------------------------------------------------------- | ------ |
| id          | integer                     | N/A        | NO       | nextval('token_price_history_minutes_id_seq'::regclass) | ✓      |
| token_id    | integer                     | N/A        | NO       | None                                                    |        |
| price       | numeric                     | N/A        | NO       | None                                                    |        |
| recorded_at | timestamp without time zone | N/A        | NO       | now()                                                   |        |

## Constraints

| Constraint Name                           | Type        |
| ----------------------------------------- | ----------- |
| token_price_history_minutes_pkey          | PRIMARY KEY |
| token_price_history_minutes_token_id_fkey | FOREIGN KEY |
| 2200_41694_1_not_null                     | CHECK       |
| 2200_41694_2_not_null                     | CHECK       |
| 2200_41694_3_not_null                     | CHECK       |
| 2200_41694_4_not_null                     | CHECK       |

## Foreign Keys (References)

This table references the following tables:

| Column   | References Table  | References Column | On Delete | On Update |
| -------- | ----------------- | ----------------- | --------- | --------- |
| token_id | **crypto_tokens** | id                | CASCADE   | NO ACTION |

## TypeScript Interfaces

### Full Interface

```typescript
export interface CryptoTokenHistoryMinutely {
  /** Identifier/Unique */
  id: number;
  /** Foreign key to crypto_tokens table */
  token_id: number;
  price: string;
  recorded_at: Date;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface CryptoTokenHistoryMinutelyIdentifiers {
  id: number;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface CryptoTokenHistoryMinutelyNonIdentifiers {
  /** Foreign key to crypto_tokens table */
  token_id: number;
  price: string;
  recorded_at: Date;
}
```
