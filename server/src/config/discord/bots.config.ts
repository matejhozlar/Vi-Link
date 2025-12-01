import { env } from "../env/env.config";

export interface DiscordBotConfig {
  main: {
    id: string;
    token: string;
  };
}

const config: DiscordBotConfig = {
  main: {
    /**
     * Discord application/bot ID used for identification
     * Required for registering slash commands and API interactions
     */
    id: env.DISCORD_BOT_ID,
    /**
     * Discord bot authentication token
     * Used to authenticate and login the bot to Discord's gateway
     */
    token: env.DISCORD_BOT_TOKEN,
  },
};

export default config;
