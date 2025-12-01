# Table: user_balances

Generated on: 23/11/2025, 12:47:53

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Foreign Keys (References)](#foreign-keys-references)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name  | Data Type                   | Max Length | Nullable | Default | Unique |
| ------------ | --------------------------- | ---------- | -------- | ------- | ------ |
| uuid         | uuid                        | N/A        | NO       | None    | ✓      |
| balance      | numeric                     | N/A        | NO       | 0       |        |
| last_updated | timestamp without time zone | N/A        | YES      | now()   |        |
| name         | text                        | N/A        | NO       | None    | ✓      |
| discord_id   | text                        | N/A        | NO       | None    | ✓      |

## Constraints

| Constraint Name              | Type        |
| ---------------------------- | ----------- |
| user_funds_discord_id_unique | UNIQUE      |
| user_funds_pkey              | PRIMARY KEY |
| user_funds_uuid_fkey         | FOREIGN KEY |
| fk_user_balances_name        | FOREIGN KEY |
| unique_balances_name         | UNIQUE      |
| 2200_41712_1_not_null        | CHECK       |
| 2200_41712_2_not_null        | CHECK       |
| 2200_41712_4_not_null        | CHECK       |
| 2200_41712_5_not_null        | CHECK       |

## Foreign Keys (References)

This table references the following tables:

| Column | References Table | References Column | On Delete | On Update |
| ------ | ---------------- | ----------------- | --------- | --------- |
| uuid   | **users**        | uuid              | NO ACTION | NO ACTION |
| name   | **users**        | name              | CASCADE   | CASCADE   |

## TypeScript Interfaces

### Full Interface

```typescript
export interface UserBalances {
  /** Foreign key to users table | Identifier/Unique */
  uuid: string;
  balance: string;
  last_updated: Date | null;
  /** Foreign key to users table | Identifier/Unique */
  name: string;
  /** Identifier/Unique */
  discord_id: string;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface UserBalancesIdentifiers {
  /** Foreign key to users table */
  uuid: string;
  /** Foreign key to users table */
  name: string;
  discord_id: string;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface UserBalancesNonIdentifiers {
  balance: string;
  last_updated: Date | null;
}
```
