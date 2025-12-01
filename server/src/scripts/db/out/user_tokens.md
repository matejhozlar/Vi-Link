# Table: user_tokens

Generated on: 23/11/2025, 12:57:30

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Foreign Keys (References)](#foreign-keys-references)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name       | Data Type | Max Length | Nullable | Default | Unique |
| ----------------- | --------- | ---------- | -------- | ------- | ------ |
| discord_id        | text      | N/A        | NO       | None    | ✓      |
| token_id          | integer   | N/A        | NO       | None    | ✓      |
| amount            | numeric   | N/A        | NO       | 0       |        |
| price_at_purchase | numeric   | N/A        | YES      | None    |        |

## Constraints

| Constraint Name             | Type        |
| --------------------------- | ----------- |
| user_tokens_pkey            | PRIMARY KEY |
| user_tokens_discord_id_fkey | FOREIGN KEY |
| user_tokens_token_id_fkey   | FOREIGN KEY |
| 2200_41726_1_not_null       | CHECK       |
| 2200_41726_2_not_null       | CHECK       |
| 2200_41726_3_not_null       | CHECK       |

## Foreign Keys (References)

This table references the following tables:

| Column     | References Table  | References Column | On Delete | On Update |
| ---------- | ----------------- | ----------------- | --------- | --------- |
| discord_id | **users**         | discord_id        | CASCADE   | NO ACTION |
| token_id   | **crypto_tokens** | id                | CASCADE   | NO ACTION |

## TypeScript Interfaces

### Full Interface

```typescript
export interface UserTokens {
  /** Foreign key to users table | Identifier/Unique */
  discord_id: string;
  /** Foreign key to crypto_tokens table | Identifier/Unique */
  token_id: number;
  amount: string;
  price_at_purchase: string | null;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface UserTokensIdentifiers {
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_id: number;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface UserTokensNonIdentifiers {
  amount: string;
  price_at_purchase: string | null;
}
```
