import { env } from "@/config/env/env.config";

export interface GuildConfig {
  /**
   * Discord guild (server) ID where the bot operates
   * Used for guild specific command registration and operations
   */
  id: string;
}

const config: GuildConfig = {
  id: env.DISCORD_GUILD_ID,
};

export default config;
