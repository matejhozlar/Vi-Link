# Table: users

Generated on: 23/11/2025, 12:52:33

## Table of Contents

- [Columns](#columns)
- [Constraints](#constraints)
- [Referenced By](#referenced-by)
- [TypeScript Interfaces](#typescript-interfaces)
  - [Full Interface](#full-interface)
  - [Identifiers Interface](#identifiers-interface)
  - [Non-Identifiers Interface](#non-identifiers-interface)

## Columns

| Column Name       | Data Type                   | Max Length | Nullable | Default           | Unique |
| ----------------- | --------------------------- | ---------- | -------- | ----------------- | ------ |
| uuid              | uuid                        | N/A        | NO       | None              | ✓      |
| name              | text                        | N/A        | NO       | None              | ✓      |
| online            | boolean                     | N/A        | NO       | false             |        |
| last_seen         | timestamp without time zone | N/A        | YES      | now()             |        |
| discord_id        | text                        | N/A        | NO       | None              | ✓      |
| play_time_seconds | bigint                      | N/A        | YES      | 0                 |        |
| session_start     | timestamp without time zone | N/A        | YES      | None              |        |
| first_joined      | timestamp without time zone | N/A        | NO       | CURRENT_TIMESTAMP |        |

## Constraints

| Constraint Name       | Type        |
| --------------------- | ----------- |
| unique_discord_id     | UNIQUE      |
| users_pkey            | PRIMARY KEY |
| unique_name           | UNIQUE      |
| 2200_41732_1_not_null | CHECK       |
| 2200_41732_2_not_null | CHECK       |
| 2200_41732_3_not_null | CHECK       |
| 2200_41732_5_not_null | CHECK       |
| 2200_41732_8_not_null | CHECK       |

## Referenced By

This table is referenced by the following tables:

| Referencing Table             | Referencing Column | Referenced Column | On Delete | On Update |
| ----------------------------- | ------------------ | ----------------- | --------- | --------- |
| **clicker_game_data**         | discord_id         | discord_id        | NO ACTION | NO ACTION |
| **companies**                 | founder_uuid       | uuid              | CASCADE   | NO ACTION |
| **company_edits**             | editor_uuid        | uuid              | CASCADE   | NO ACTION |
| **company_edits**             | reviewed_by        | uuid              | NO ACTION | NO ACTION |
| **company_edits**             | reviewed_by        | uuid              | NO ACTION | NO ACTION |
| **company_members**           | user_uuid          | uuid              | CASCADE   | NO ACTION |
| **company_transactions**      | user_uuid          | uuid              | NO ACTION | NO ACTION |
| **company_pending**           | founder_uuid       | uuid              | CASCADE   | NO ACTION |
| **company_pending**           | reviewed_by        | uuid              | NO ACTION | NO ACTION |
| **shop_pending**              | founder_uuid       | uuid              | CASCADE   | NO ACTION |
| **shop_pending**              | reviewed_by        | uuid              | NO ACTION | NO ACTION |
| **player_stats**              | uuid               | uuid              | CASCADE   | NO ACTION |
| **company_rejected**          | founder_uuid       | uuid              | CASCADE   | NO ACTION |
| **shop_edits_rejected**       | editor_uuid        | uuid              | CASCADE   | NO ACTION |
| **shop_rejected**             | founder_uuid       | uuid              | CASCADE   | NO ACTION |
| **shop_edits**                | editor_uuid        | uuid              | CASCADE   | NO ACTION |
| **shop_edits**                | reviewed_by        | uuid              | NO ACTION | NO ACTION |
| **shop_reviews**              | user_uuid          | uuid              | CASCADE   | NO ACTION |
| **crypto_token_transactions** | discord_id         | discord_id        | CASCADE   | NO ACTION |
| **user_balances**             | uuid               | uuid              | NO ACTION | NO ACTION |
| **user_tokens**               | discord_id         | discord_id        | CASCADE   | NO ACTION |
| **admins**                    | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **logs_ai**                   | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **chat_tokens**               | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **currency_transactions**     | uuid               | uuid              | CASCADE   | CASCADE   |
| **currency_transactions**     | to_uuid            | uuid              | CASCADE   | CASCADE   |
| **currency_transactions**     | from_uuid          | uuid              | CASCADE   | CASCADE   |
| **daily_player_stats**        | uuid               | uuid              | CASCADE   | CASCADE   |
| **daily_player_playtime**     | uuid               | uuid              | CASCADE   | CASCADE   |
| **daily_rewards**             | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **lottery_participants**      | uuid               | uuid              | CASCADE   | CASCADE   |
| **daily_mob_limit**           | uuid               | uuid              | CASCADE   | CASCADE   |
| **logs_rcon**                 | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **tickets**                   | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **crypto_token_alerts**       | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **user_portfolios**           | discord_id         | discord_id        | CASCADE   | CASCADE   |
| **tickets**                   | mc_name            | name              | CASCADE   | CASCADE   |
| **user_balances**             | name               | name              | CASCADE   | CASCADE   |

## TypeScript Interfaces

### Full Interface

```typescript
export interface Users {
  /** Identifier/Unique */
  uuid: string;
  /** Identifier/Unique */
  name: string;
  online: boolean;
  last_seen: Date | null;
  /** Identifier/Unique */
  discord_id: string;
  play_time_seconds: string | null;
  session_start: Date | null;
  first_joined: Date;
}
```

### Identifiers Interface

This interface contains only unique/identifier columns (primary keys and unique constraints).

```typescript
export interface UsersIdentifiers {
  uuid: string;
  name: string;
  discord_id: string;
}
```

### Non-Identifiers Interface

This interface contains only non-unique columns (excluding identifiers).

```typescript
export interface UsersNonIdentifiers {
  online: boolean;
  last_seen: Date | null;
  play_time_seconds: string | null;
  session_start: Date | null;
  first_joined: Date;
}
```
