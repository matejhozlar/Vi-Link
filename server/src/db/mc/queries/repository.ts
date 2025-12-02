import { ResultSetHeader } from "mysql2";
import { query } from "..";
import {
  FailedUserLinkUpdate,
  MinecraftRank,
  UserLink,
  UserLinkRow,
  UserLinkUpdate,
} from "./types";

type Identifier = { token: string } | { uuid: string } | { discordId: string };

/**
 * Queries for Minecraft user database operations
 * Provides abstraction layer over raw SQL queries
 */
export class MinecraftLinkRepository {
  /**
   * Finds a user by their linking token
   *
   * @param identifier - Object containing token or uuid
   * @returns Promise resolving to parsed user data or null if not found
   */
  async find(identifier: Identifier): Promise<UserLink | null> {
    const columpMap = {
      token: "token",
      uuid: "uuid",
      discordId: "discord_id",
    } as const;

    const identifierKey = Object.keys(identifier)[0] as keyof typeof columpMap;
    const colump = columpMap[identifierKey];
    const value = identifier[identifierKey as keyof Identifier];

    const [rows] = await query<UserLinkRow[]>(
      `SELECT * FROM users WHERE ${colump} = ? LIMIT 1`,
      [value]
    );

    return rows.length > 0 ? this.parseUserRow(rows[0]) : null;
  }

  /**
   * Updates user link record to mark as linked with Discord
   *
   * @param token - The linking token
   * @param update - Update payload with Discord ID and linked timestamp
   * @returns Promise resolving to true if update successful, false otherwise
   */
  async link(token: string, update: UserLinkUpdate): Promise<boolean> {
    const [result] = await query<ResultSetHeader>(
      `UPDATE users
         SET discord_id = ?, status = ?, linked_at = ?, updated_at = NOW()
         WHERE token = ?, AND status = 'pending'`,
      [update.discordId, update.status, update.linkedAt, token]
    );

    return result.affectedRows > 0;
  }

  /**
   * Updates user record to mark linking as failed
   *
   * @param token - The linking token
   * @param update - Update payload with failed status
   * @returns Promse resolving to true if update successful, false otherwise
   */
  async markAsFailed(
    token: string,
    update: FailedUserLinkUpdate
  ): Promise<boolean> {
    const [result] = await query<ResultSetHeader>(
      `UPDATE users
         SET status = ?, updated_at = NOW()
         WHERE token = ?`,
      [update.status, token]
    );

    return result.affectedRows > 0;
  }

  /**
   * Updates users status to processing
   * Prevents concurrent linking attempts for the same token
   *
   * @param token - The linking token
   * @returns Promise resolving to true if update successful, false if already processing
   */
  async markAsProcessing(token: string): Promise<boolean> {
    const [result] = await query<ResultSetHeader>(
      `UPDATE users
         SET status = 'processing', updated_at = NOW()
         WHERE token = ? AND status = 'pending'`,
      [token]
    );

    return result.affectedRows > 0;
  }

  /**
   * Checks if a token has expired
   *
   * @param token - The linking token
   * @returns Promise resolving to true if expired, false otherwise
   */
  async isExpired(token: string): Promise<boolean> {
    const [rows] = await query<UserLinkRow[]>(
      "SELECT token_expires_at FROM users WHERE token = ? LIMIT 1",
      [token]
    );

    if (rows.length === 0) {
      return true;
    }

    const expiresAt = new Date(rows[0].token_expires_at!);
    return expiresAt < new Date();
  }

  /**
   * Marks expired tokens in the database
   * Should be run periodically as cleanup task
   *
   * @returns Promise resolving to number of tokens marked as expired
   */
  async markExpired(): Promise<number> {
    const [result] = await query<ResultSetHeader>(
      `UPDATE users
         SET status = 'expired', updated_at = NOW()
         WHERE status = 'pending' AND token_expires_at < NOW()`
    );

    return result.affectedRows;
  }

  /**
   * Unlinks a user by deleting their database entry
   * Should only be called after roles have been successfully removed
   *
   * @param discordId - Discord user ID to unlink
   * @returns Promise resolving to true if deletion successful, false otherwise
   */
  async unlink(discordId: string): Promise<boolean> {
    const [result] = await query<ResultSetHeader>(
      `DELETE FROM users WHERE discord_id = ? AND status = 'linked'`,
      [discordId]
    );

    return result.affectedRows > 0;
  }

  /**
   * Unlinks a Discord account from a Minecraft account
   * Deletes the user entry from the database and removes
   */

  /**
   * Parses a database row into a typed UserLink object
   * Handles JSON parsing for ranks field
   *
   * @param row - Raw database row
   * @returns Parsed UserLink object
   * @private
   */
  private parseUserRow(row: UserLinkRow): UserLink {
    let ranks: MinecraftRank[] = [];

    try {
      ranks = JSON.parse(row.ranks);
    } catch (error) {
      logger.warn(`Failed to parse ranks for user ${row.uuid}:`, error);
      ranks = [];
    }

    const userLink: UserLink = {
      uuid: row.uuid,
      minecraftName: row.minecraft_name,
      discordId: row.discord_id,
      token: row.token,
      status: row.status,
      ranks,
      linkedAt: row.linked_at,
      tokenExpiresAt: row.token_expires_at,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return userLink;
  }
}

export const minecraftLinkRepository = new MinecraftLinkRepository();
