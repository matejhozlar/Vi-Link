import { env } from "../env/env.config";

export interface DiscordBotConfig {
  main: {
    /**
     * Discord application/bot ID used for identification
     * Required for registering slash commands and API interactions
     */
    id: string;
    /**
     * Discord bot authentication token
     * Used to authenticate and login the bot to Discord's gateway
     */
    token: string;
  };
}

const config: DiscordBotConfig = {
  main: {
    id: env.DISCORD_BOT_ID,
    token: env.DISCORD_BOT_TOKEN,
  },
};

export default config;
