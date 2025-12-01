# Table: tickets

Generated on: 23/11/2025, 15:28:22

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Foreign Keys (References)](#foreign-keys-references)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name      | Data Type                   | Max Length | Nullable | Default                             | Unique |
| ---------------- | --------------------------- | ---------- | -------- | ----------------------------------- | ------ |
| id               | integer                     | N/A        | NO       | nextval('tickets_id_seq'::regclass) | ✓      |
| ticket_number    | integer                     | N/A        | NO       | None                                | ✓      |
| discord_id       | text                        | N/A        | NO       | None                                |        |
| mc_name          | text                        | N/A        | NO       | None                                |        |
| channel_id       | text                        | N/A        | NO       | None                                | ✓      |
| status           | text                        | N/A        | YES      | 'open'::text                        |        |
| created_at       | timestamp without time zone | N/A        | YES      | now()                               |        |
| updated_at       | timestamp without time zone | N/A        | YES      | now()                               |        |
| admin_message_id | text                        | N/A        | YES      | None                                | ✓      |

## Constraints

| Constraint Name         | Type        |
| ----------------------- | ----------- |
| tickets_pkey            | PRIMARY KEY |
| unique_channel_id       | UNIQUE      |
| unique_admin_message_id | UNIQUE      |
| unique_ticker_number    | UNIQUE      |
| fk_tickets_discord_id   | FOREIGN KEY |
| fk_user_tickets_mc_name | FOREIGN KEY |
| 2200_41662_1_not_null   | CHECK       |
| 2200_41662_2_not_null   | CHECK       |
| 2200_41662_3_not_null   | CHECK       |
| 2200_41662_4_not_null   | CHECK       |
| 2200_41662_5_not_null   | CHECK       |

## Foreign Keys (References)

This table references the following tables:

| Column     | References Table | References Column | On Delete | On Update |
| ---------- | ---------------- | ----------------- | --------- | --------- |
| discord_id | **users**        | discord_id        | CASCADE   | CASCADE   |
| mc_name    | **users**        | name              | CASCADE   | CASCADE   |

## TypeScript Interfaces

### Full Interface

```typescript
export interface Tickets {
  /** Identifier/Unique */
  id: number;
  /** Identifier/Unique */
  ticket_number: number;
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to users table */
  mc_name: string;
  /** Identifier/Unique */
  channel_id: string;
  status: string | null;
  created_at: Date | null;
  updated_at: Date | null;
  /** Identifier/Unique */
  admin_message_id: string | null;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface TicketsIdentifiers {
  id: number;
  ticket_number: number;
  channel_id: string;
  admin_message_id: string | null;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface TicketsNonIdentifiers {
  /** Foreign key to users table */
  discord_id: string;
  /** Foreign key to users table */
  mc_name: string;
  status: string | null;
  created_at: Date | null;
  updated_at: Date | null;
}
```
