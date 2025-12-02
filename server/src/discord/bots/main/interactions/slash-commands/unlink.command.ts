import { createEmbed, EmbedColors, EmbedPresets } from "@/discord/embeds";
import { UserLinkingService } from "@/services/user-linking.service";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";

/**
 * Slash command definition for the unlink command
 * Allows administrators to unlink a user's Minecraft account from Discord
 */
export const data = new SlashCommandBuilder()
  .setName("unlink")
  .setDescription("Unlink a user's Minecraft account from Discord (Admin only)")
  .addUserOption((option) =>
    option
      .setName("user")
      .setDescription("The Discord user to unlink")
      .setRequired(true)
  )
  .addBooleanOption((option) =>
    option
      .setName("keep-roles")
      .setDescription("Keep the user's roles instead of removing them")
      .setRequired(false)
  );

/**
 * Cooldown configuration for the unlink command
 * Prevents spam and abuse
 */
export const cooldown = {
  duration: 10,
  type: "user" as const,
  message: "Please wait before unlinking anoter user!",
};

/**
 * Whether this command should only be available in production
 */
export const prodOnly = false;

/**
 * Executes the unlink command to disconnect Minecraft and Discord accounts
 *
 * Process:
 * 1. Gets the target user from command options
 * 2. Shows loading message
 * 3. Attemps to remove Discord roles
 * 4. Only deletes database entry role if role removal succeeds
 * 5. Notifies admin of success or failure
 *
 * Note: PErmissions should be configured in Discord server settings
 * to restrict this command to administrators only
 *
 * @param interaction - The chat input command interaction
 * @returns Promise resolving when the command execution is complete
 *
 * @example
 * Admin runs: /unlink @user
 * Bot removes roles, deletes DB entry, and respons with result
 *
 * @example
 * Admin runs: /unlink @user keep-roles:true
 * Bot keeps roles but still deletes DB entry
 */
export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const targetUser = interaction.options.getUser("user", true);
  const keepRoles = interaction.options.getBoolean("keep-roles") ?? false;
  const removeRoles = !keepRoles;

  await interaction.reply({
    embeds: [EmbedPresets.loading("Processing unlink request...").build()],
    flags: MessageFlags.Ephemeral,
  });

  try {
    const linkingService = new UserLinkingService(interaction.client);

    const result = await linkingService.unlink(targetUser.id, removeRoles);

    if (result.success) {
      const embed = createEmbed()
        .title("✅ Account Unlinked Successfully!")
        .description(result.message)
        .color(EmbedColors.Success)
        .field("Minecraft Account", result.minecraftName || "Unknown", true)
        .field("Discord Account", targetUser.tag, true);

      if (removeRoles && result.rolesRemoved !== undefined) {
        if (result.rolesRemoved > 0) {
          embed.field(
            "Roles Removed",
            `${result.rolesRemoved} role(s) removed`,
            false
          );
        } else {
          embed.field(
            "Roles",
            "No roles to remove (user had no mapped ranks)",
            false
          );
        }
      } else if (keepRoles) {
        embed.field("Roles", "Kept user's roles as requested", false);
      }

      embed.timestamp();

      await interaction.editReply({ embeds: [embed.build()] });

      logger.info(
        `Admin ${interaction.user.tag} (${interaction.user.id}) unlinked ${targetUser.tag} (${targetUser.id}) from ${result.minecraftName}`
      );
    } else {
      const embed = EmbedPresets.error("Unlink Failed", result.message);

      if (result.error) {
        embed.field("Error Details", result.error, false);
      }

      embed.field(
        "💡 Possible Reasons",
        [
          "• The user is not linked to any Minecraft account",
          "• Failed to remove Discord roles (check bot permissions)",
          "• Database connection issue",
          "• The user may have already been unlinked",
        ].join("\n"),
        false
      );

      await interaction.editReply({ embeds: [embed.build()] });

      logger.warn(
        `Failed unlink attempt by admin ${interaction.user.tag} (${interaction.user.id}) for user ${targetUser.tag} (${targetUser.id}): ${result.message}`
      );
    }
  } catch (error) {
    logger.error("Unexpected error in unlink command:", error);

    const embed = EmbedPresets.error(
      "Unexpected Error",
      "An unexpected error occured while processing the unlink request. Please try again later."
    )
      .field(
        "🔧 If this persists",
        "Please check the bot logs for more details or contact the bot developer.",
        false
      )
      .build();

    try {
      await interaction.editReply({ embeds: [embed] });
    } catch (replyError) {
      logger.error("Failed to send error message to admin:", replyError);
    }
  }
}
