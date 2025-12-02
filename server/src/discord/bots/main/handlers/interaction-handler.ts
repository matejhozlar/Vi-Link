import {
  ChatInputCommandInteraction,
  Client,
  Collection,
  Interaction,
  MessageFlags,
} from "discord.js";
import { CommandModule } from "../loaders/command-loader";
import { cooldownManager } from "@/discord/utils/cooldown/cooldown-manager";
import { EmbedPresets } from "@/discord/embeds";

/**
 * Format seconds into a human-readable string
 */
function formatCooldown(seconds: number): string {
  if (seconds < 60) {
    return `${seconds.toFixed(1)} second(s)`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.floor(seconds % 60);

  if (minutes < 60) {
    return remainingSeconds > 0
      ? `${minutes} minute(s) and ${remainingSeconds} second(s)`
      : `${minutes} minute(s)`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  return remainingMinutes > 0
    ? `${hours} hour(s) and ${remainingMinutes} minute(s)`
    : `${hours} hour(s)`;
}

function canBypassCooldown(
  interaction: ChatInputCommandInteraction,
  command: CommandModule
): boolean {
  if (!command.cooldown) return true;

  if (command.cooldown.bypassUsers?.includes(interaction.user.id)) {
    return true;
  }

  if (interaction.guild && command.cooldown.bypassRoles) {
    const member = interaction.member;
    if (member && "roles" in member) {
      const memberRoles = member.roles as { cache: Collection<string, any> };
      const hasRole = command.cooldown.bypassRoles.some((roleId) =>
        memberRoles.cache.has(roleId)
      );
      if (hasRole) return true;
    }
  }

  return false;
}

/**
 * Handles chat command interactions
 *
 * @param interaction - The chat input interaction
 * @param commandHandlers - Handlers for commands
 * @returns Promise resolving when the chat command is handled
 */
async function handleChatCommands(
  interaction: ChatInputCommandInteraction,
  commandHandlers: Collection<string, CommandModule>
): Promise<void> {
  const command = commandHandlers.get(interaction.commandName);

  if (!command) {
    logger.warn(`Unknown command received /${interaction.commandName}`);
    return;
  }

  logger.info(
    `${interaction.user.tag} (${interaction.user.id}) ran /${interaction.commandName}`
  );

  // Check cooldown
  if (command.cooldown && !canBypassCooldown(interaction, command)) {
    const cooldownRemaining = cooldownManager.check(
      interaction.commandName,
      command.cooldown,
      {
        userId: interaction.user.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
      }
    );

    if (cooldownRemaining !== null) {
      const cooldownMessage =
        command.cooldown.message ||
        `This command is on cooldown. Please wait ${formatCooldown(
          cooldownRemaining
        )} before using it again.`;

      const cooldownEmbed = EmbedPresets.error(
        "Command on Cooldown",
        cooldownMessage
      )
        .field("Time Remaining", formatCooldown(cooldownRemaining), true)
        .field("Cooldown Type", command.cooldown.type, true)
        .build();

      await interaction.reply({
        embeds: [cooldownEmbed],
        flags: MessageFlags.Ephemeral,
      });

      logger.debug(
        `${interaction.user.tag} tried to use /${
          interaction.commandName
        } but it's on cooldown (${cooldownRemaining.toFixed(1)}s remaining)`
      );
      return;
    }
  }

  try {
    await command.execute(interaction);

    // Set cooldown after successful execution
    if (command.cooldown && !canBypassCooldown(interaction, command)) {
      cooldownManager.set(interaction.commandName, command.cooldown, {
        userId: interaction.user.id,
        channelId: interaction.channelId,
        guildId: interaction.guildId,
      });
    }
  } catch (error) {
    logger.error(`Error executing command ${interaction.commandName}:`, error);

    const replyMethod =
      interaction.replied || interaction.deferred
        ? interaction.followUp
        : interaction.reply;

    await replyMethod.call(interaction, {
      content: "❌ Command failed",
      flags: MessageFlags.Ephemeral,
    });
  }
}

/**
 * Registers the main interaction handler for chat commands
 *
 * @param discordClient - The Discord client instance
 * @param commandHandlers - Collection of slash command handlers
 * @returns Promise resolving when the handlers are registered
 */
export function registerInteractionHandler(
  discordClient: Client,
  commandHandlers: Collection<string, CommandModule>
): void {
  discordClient.on("interactionCreate", async (interaction: Interaction) => {
    if (interaction.isChatInputCommand()) {
      await handleChatCommands(interaction, commandHandlers);
      return;
    }
  });
}
