import config from "@/config";
import {
  getDiscordRoleIds,
  getUnnamedRanks,
} from "@/config/minecraft/ranks.config";
import { minecraftLinkRepository } from "@/db/mc/queries/repository";
import { Client, GuildMember } from "discord.js";
import { success } from "zod";

/**
 * Result of a linking attempt
 */
export interface LinkResult {
  success: boolean;
  message: string;
  minecraftName?: string;
  ranksAssigned?: string[];
  ranksSkipped?: string[];
  error?: string;
}

/**
 * Result of an unlinking attempt
 */
export interface UnlinkResult {
  success: boolean;
  message: string;
  minecraftName?: string;
  rolesRemoved?: number;
  error?: string;
}

/**
 * Service for handling Minecraft-Discord user linking
 * Orchestrates database operations and Discord role assignment
 */
export class UserLinkingService {
  constructor(private readonly discordClient: Client) {}

  /**
   * Links a Minecraft user to Discord using a token
   *
   * Process:
   * 1. Validates token exists and is not expired
   * 2. Marks token as processing (prevents concurrent attempts)
   * 3. Retrieves user's Minecraft ranks
   * 4. Maps ranks to Discord roles
   * 5. Assigns roles to Discord member
   * 6. Updates database with linked status
   *
   * @param token - Linking token from Minecraft
   * @param discordId - Discord user ID attempting to link
   * @returns Promise resolving to LinkResult with operation details
   */
  async link(token: string, discordId: string): Promise<LinkResult> {
    try {
      const user = await minecraftLinkRepository.find({ token });

      if (!user) {
        logger.warn(
          `Link attempt with invalid token: ${token.substring(0, 8)}...`
        );
        return {
          success: false,
          message:
            "Invalid linking token. Please generate a new token in Minecraft.",
        };
      }

      const isExpired = await minecraftLinkRepository.isExpired(token);
      if (isExpired) {
        logger.warn(
          `Link attempt with expired token for user ${user.minecraftName}`
        );
        await minecraftLinkRepository.markAsFailed(token, { status: "failed" });
        return {
          success: false,
          message:
            "This linking token has expired. Please generate a new token in Minecraft.",
        };
      }

      if (user.status === "linked") {
        logger.info(
          `User ${user.minecraftName} is already linked to Discord ID ${user.discordId}`
        );
        return {
          success: false,
          message:
            "This Minecraft account is already linked to a Discord account.",
        };
      }

      const existingUser = await minecraftLinkRepository.find({ discordId });
      if (existingUser && existingUser.status === "linked") {
        logger.warn(
          `Discord ID ${discordId} attempted to link but is already linked to ${existingUser.minecraftName}`
        );
        return {
          success: false,
          message:
            "Your Discord account is already linked to a different Minecraft account.",
        };
      }

      const markedAsProcessing = await minecraftLinkRepository.markAsProcessing(
        token
      );
      if (!markedAsProcessing) {
        logger.warn(
          `Failed to mark token as processing - likely already being processed`
        );
        return {
          success: false,
          message:
            "This linking token is currently being processed. Please wait a moment.",
        };
      }

      logger.info(
        `Starting link process for ${user.minecraftName} (${user.uuid}) -> Discord ID ${discordId}`
      );

      const roleResult = await this.assignRanksToMember(
        discordId,
        user.ranks.map((r) => r.name)
      );

      if (!roleResult.success) {
        logger.error(
          `Failed to assign roles for ${user.minecraftName}:`,
          roleResult.error
        );
        await minecraftLinkRepository.markAsFailed(token, { status: "failed" });
        return {
          success: false,
          message:
            "Failed to assign Discord roles. Please contact an administrator.",
          error: roleResult.error,
        };
      }

      const updated = await minecraftLinkRepository.link(token, {
        discordId,
        status: "linked",
        linkedAt: new Date(),
      });

      if (!updated) {
        logger.error(`Failed to update database for ${user.minecraftName}`);
        return {
          success: false,
          message: "Failed to complete linking process. Please try again later",
        };
      }

      logger.info(
        `Successfully linked ${user.minecraftName} to Discord ID ${discordId}`
      );
      logger.info(`Roles assigned: ${roleResult.rolesAssigned.join(", ")}`);
      if (roleResult.rolesSkipped.length > 0) {
        logger.info(
          `Ranks without mapping: ${roleResult.rolesSkipped.join(", ")}`
        );
      }

      return {
        success: true,
        message: `Successfully linked your Minecraft account **${user.minecraftName}** to Discord!`,
        minecraftName: user.minecraftName,
        ranksAssigned: roleResult.rolesAssigned,
        ranksSkipped: roleResult.rolesSkipped,
      };
    } catch (error) {
      logger.error("Error during user linking:", error);

      try {
        await minecraftLinkRepository.markAsFailed(token, { status: "failed" });
      } catch (dbError) {
        logger.error("Failed to mark token as failed:", dbError);
      }

      return {
        success: false,
        message: "An unexpected error occurred. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Assigns Discord roles to a member based on their Minecraft ranks
   *
   * @param discordId - Discord user ID
   * @param minecraftRanks - Array of Minecraft rank names
   * @returns Promise resolving to role assignment result
   */
  private async assignRanksToMember(
    discordId: string,
    minecraftRanks: string[]
  ): Promise<{
    success: boolean;
    rolesAssigned: string[];
    rolesSkipped: string[];
    error?: string;
  }> {
    try {
      const guild = await this.discordClient.guilds.fetch(
        config.discord.guild.id
      );
      if (!guild) {
        return {
          success: false,
          rolesAssigned: [],
          rolesSkipped: minecraftRanks,
          error: "Could not find Discord server",
        };
      }

      let member: GuildMember;
      try {
        member = await guild.members.fetch(discordId);
      } catch (error) {
        return {
          success: false,
          rolesAssigned: [],
          rolesSkipped: minecraftRanks,
          error: "User is not a member of the Discord server",
        };
      }

      const roleIds = getDiscordRoleIds(minecraftRanks);
      const unmappedRanks = getUnnamedRanks(minecraftRanks);

      if (roleIds.length === 0) {
        logger.warn(
          `No Discord roles found for ranks: ${minecraftRanks.join(", ")}`
        );
        return {
          success: true,
          rolesAssigned: [],
          rolesSkipped: minecraftRanks,
        };
      }

      const assignedRoles: string[] = [];
      for (const roleId of roleIds) {
        try {
          await member.roles.add(roleId);
          const role = guild.roles.cache.get(roleId);
          assignedRoles.push(role?.name || roleId);
          logger.debug(
            `Assigned role ${role?.name || roleId} to user ${discordId}`
          );
        } catch (error) {
          logger.error(
            `Failed to assign role ${roleId} to user ${discordId}:`,
            error
          );
        }
      }

      return {
        success: assignedRoles.length > 0,
        rolesAssigned: assignedRoles,
        rolesSkipped: unmappedRanks,
      };
    } catch (error) {
      logger.error("Error assigning ranks to member:", error);
      return {
        success: false,
        rolesAssigned: [],
        rolesSkipped: minecraftRanks,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Unlinks a user's Minecraft account from Discord
   *
   * Process:
   * 1. Finds linked user by Discord ID
   * 2. Removes Discord roles
   * 3. Only deletes database entry if role removal succeeds
   * 4. Returns detailed result of the operation
   *
   * @param discordId - Discord user ID to unlink
   * @param removeRoles - Whether to remove Minecraft-related roles (default: true)
   * @returns Promise resolving to UnlinkResult with operation details
   */
  async unlink(
    discordId: string,
    removeRoles: boolean = true
  ): Promise<UnlinkResult> {
    try {
      const user = await minecraftLinkRepository.find({ discordId });

      if (!user || user.status !== "linked") {
        logger.warn(`Attempted to unlink user ${discordId} who is not linked`);
        return {
          success: false,
          message:
            "This Discord account is not linked to any Minecraft account.",
        };
      }

      const minecraftName = user.minecraftName;
      const ranksToRemove = user.ranks.map((r) => r.name);

      let rolesRemoved = 0;
      if (removeRoles && ranksToRemove.length > 0) {
        logger.info(
          `Removing roles for ${minecraftName} (Discord ID: ${discordId})`
        );

        const removeResult = await this.removeRanksFromMember(
          discordId,
          ranksToRemove
        );

        if (!removeResult.success) {
          logger.error(
            `Failed to remove roles for ${minecraftName}:`,
            removeResult.error
          );
          return {
            success: false,
            message:
              "Failed to remove Discord roles. Cannot complete unlink. Please contact an administrator.",
            minecraftName,
            error: removeResult.error,
          };
        }

        rolesRemoved = removeResult.rolesRemoved;
        logger.info(
          `Successfully removed ${rolesRemoved} role(s) from ${minecraftName}`
        );
      }

      logger.info(
        `Deleting database entry for ${minecraftName} (Discord ID: ${discordId})`
      );

      const deleted = await minecraftLinkRepository.unlink(discordId);

      if (!deleted) {
        logger.error(
          `Failed to delete database entry for ${minecraftName} (Discord ID: ${discordId})`
        );
        return {
          success: false,
          message:
            "Roles were removed but failed to delete link from database. Please contact an administrator.",
          minecraftName,
          rolesRemoved,
        };
      }

      logger.info(
        `Successfully unlinked ${minecraftName} from Discord ID ${discordId}`
      );

      return {
        success: true,
        message: `Successfully unlinked Minecraft account **${minecraftName}** from Discord.`,
        minecraftName,
        rolesRemoved,
      };
    } catch (error) {
      logger.error("Error unlinking user:", error);
      return {
        success: false,
        message:
          "An unexpected error occurred while unlinking. Please try again later.",
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }

  /**
   * Removes Discord roles from a member
   *
   * @param discordId - Discord user ID
   * @param minecraftRanks - Array of Minecraft rank names to remove
   * @returns Promise resolving to result with success status and count of roles removed
   * @private
   */
  private async removeRanksFromMember(
    discordId: string,
    minecraftRanks: string[]
  ): Promise<{
    success: boolean;
    rolesRemoved: number;
    error?: string;
  }> {
    try {
      const guild = await this.discordClient.guilds.fetch(
        config.discord.guild.id
      );

      if (!guild) {
        return {
          success: false,
          rolesRemoved: 0,
          error: "Could not find Discord server",
        };
      }

      let member: GuildMember;
      try {
        member = await guild.members.fetch(discordId);
      } catch (error) {
        logger.warn(
          `User ${discordId} not found in server during unlink - may have left`
        );
        return {
          success: true,
          rolesRemoved: 0,
        };
      }

      const roleIds = getDiscordRoleIds(minecraftRanks);

      if (roleIds.length === 0) {
        logger.debug("No roles to remove - user had no mapped ranks");
        return {
          success: true,
          rolesRemoved: 0,
        };
      }

      let removedCount = 0;
      const errors: string[] = [];

      for (const roleId of roleIds) {
        try {
          if (member.roles.cache.has(roleId)) {
            await member.roles.remove(roleId);
            removedCount++;
            const role = guild.roles.cache.get(roleId);
            logger.debug(
              `Removed role ${role?.name || roleId} from user ${discordId}`
            );
          } else {
            logger.debug(
              `User ${discordId} doesn't have role ${roleId}, skipping`
            );
          }
        } catch (error) {
          const errorMsg =
            error instanceof Error ? error.message : "Unknown error";
          logger.error(
            `Failed to remove role ${roleId} from user ${discordId}:`,
            error
          );
          errors.push(`Failed to remove role ${roleId}: ${errorMsg}`);
        }
      }

      if (removedCount === 0 && roleIds.length > 0 && errors.length > 0) {
        return {
          success: false,
          rolesRemoved: 0,
          error: errors.join("; "),
        };
      }

      return {
        success: true,
        rolesRemoved: removedCount,
      };
    } catch (error) {
      logger.error("Error removing ranks from member:", error);
      return {
        success: false,
        rolesRemoved: 0,
        error: error instanceof Error ? error.message : "Unknown error",
      };
    }
  }
}
