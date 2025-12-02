/**
 * Maps Minecraft map names to Discord role IDs
 */
export interface RankMapping {
  minecraftRank: string;
  discordRoleId: string;
  priority?: number;
}

/**
 * Rank mappings configuration
 */
export const RANK_MAPPINGS: RankMapping[] = [
  {
    minecraftRank: "verified",
    discordRoleId: "1000",
  },
];

/**
 * Gets Discord role ID for Minecraft rank
 *
 * @param minecraftRank - Name of the Minecraft rank
 * @returns Discord role ID or null if no mapping exists
 */
export function getDiscordRoleId(minecraftRank: string): string | null {
  const mapping = RANK_MAPPINGS.find(
    (m) =>
      m.minecraftRank.toLocaleLowerCase() === minecraftRank.toLocaleLowerCase()
  );
  return mapping?.discordRoleId || null;
}

/**
 * Gets all Discord role IDs for an array of Minecraft ranks
 * Filters out ranks that don't have mappings
 *
 * @param minecraftRanks - Array of Minecraft rank names
 * @returns Array of Discord role IDs
 */
export function getDiscordRoleIds(minecraftRanks: string[]): string[] {
  return minecraftRanks
    .map((rank) => getDiscordRoleId(rank))
    .filter((roleId): roleId is string => roleId !== null);
}

/**
 * Checks if a Minecraft rank has a Discord role mapping
 *
 * @param minecraftRank - Name of the Minecraft rank
 * @returns True if mapping exists, false otherwise
 */
export function hasRankMapping(minecraftRank: string): boolean {
  return getDiscordRoleId(minecraftRank) !== null;
}

/**
 * Gets all unmapped ranks from a list
 * Useful for logging/debugging
 *
 * @param minecraftRanks - Array of Minecraft rank names
 * @returns Array of ranks that don't have Discord role mappings
 */
export function getUnnamedRanks(minecraftRanks: string[]): string[] {
  return minecraftRanks.filter((rank) => !hasRankMapping(rank));
}
