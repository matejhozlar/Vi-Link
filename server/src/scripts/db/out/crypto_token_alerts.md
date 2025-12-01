# Table: crypto_token_alerts

Generated on: 23/11/2025, 13:42:14

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Foreign Keys (References)](#foreign-keys-references)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name  | Data Type                   | Max Length | Nullable | Default                                        | Unique |
| ------------ | --------------------------- | ---------- | -------- | ---------------------------------------------- | ------ |
| id           | integer                     | N/A        | NO       | nextval('token_price_alerts_id_seq'::regclass) | ✓      |
| discord_id   | text                        | N/A        | NO       | None                                           |        |
| token_symbol | text                        | N/A        | NO       | None                                           |        |
| target_price | numeric                     | N/A        | NO       | None                                           |        |
| created_at   | timestamp without time zone | N/A        | NO       | now()                                          |        |
| direction    | character varying           | 10         | NO       | 'above'::character varying                     |        |

## Constraints

| Constraint Name                    | Type        |
| ---------------------------------- | ----------- |
| token_price_alerts_pkey            | PRIMARY KEY |
| fk_token_price_alerts_discord_id   | FOREIGN KEY |
| fk_token_price_alerts_token_symbol | FOREIGN KEY |
| 2200_41676_1_not_null              | CHECK       |
| 2200_41676_2_not_null              | CHECK       |
| 2200_41676_3_not_null              | CHECK       |
| 2200_41676_4_not_null              | CHECK       |
| 2200_41676_5_not_null              | CHECK       |
| 2200_41676_6_not_null              | CHECK       |

## Foreign Keys (References)

This table references the following tables:

| Column       | References Table  | References Column | On Delete | On Update |
| ------------ | ----------------- | ----------------- | --------- | --------- |
| discord_id   | **users**         | discord_id        | CASCADE   | CASCADE   |
| token_symbol | **crypto_tokens** | symbol            | CASCADE   | CASCADE   |

## TypeScript Interfaces

### Full Interface

```typescript
export interface CryptoTokenAlerts {
  /** Identifier/Unique */
  id: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_symbol: string;
  target_price: string;
  created_at: Date;
  direction: string;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface CryptoTokenAlertsIdentifiers {
  id: number;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface CryptoTokenAlertsNonIdentifiers {
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to crypto_tokens table */
  token_symbol: string;
  target_price: string;
  created_at: Date;
  direction: string;
}
```
