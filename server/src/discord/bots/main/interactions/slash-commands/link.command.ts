import { createEmbed, EmbedColors, EmbedPresets } from "@/discord/embeds";
import { UserLinkingService } from "@/services/user-linking.service";
import {
  ChatInputCommandInteraction,
  MessageFlags,
  SlashCommandBuilder,
} from "discord.js";
import { duration } from "node_modules/zod/v4/classic/iso.cjs";

/**
 * Slash command definition for the link command
 * Allows users to link their Minecraft account to Discord using a token
 */
export const data = new SlashCommandBuilder()
  .setName("link")
  .setDescription("Link your Minecraft account to Discord")
  .addStringOption((option) =>
    option
      .setName("token")
      .setDescription("The linking token from Minecraft (/link command)")
      .setRequired(true)
      .setMinLength(6)
      .setMaxLength(128)
  );

/**
 * Cooldown configuration for the link command
 * Prevents spam and abuse of the linking system
 */
export const cooldown = {
  duration: 30,
  type: "user" as const,
  message: "Please wait before attempting to link again!",
};

/**
 * Whether this command should only be available in production
 */
export const prodOnly = false;

/**
 * Executes the link command to connect Minecraft and Discord accounts
 *
 * Process:
 * 1. Validates the provided token format
 * 2. Shows loading message to user
 * 3. Connects to Minecraft database
 * 4. Verifies token and retrieves user data
 * 5. Assigns Discord roles based on Minecraft ranks
 * 6. Updates database with link status
 * 7. Notifies user of success or failure
 *
 * @param interaction - The chat input command interaction
 * @returns Promise resolving when the command is executed
 *
 * @example
 * User runs: /link ABCD123XYZ
 * Bot verifies token, assigns roles, and responds with success/error
 */
export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const token = interaction.options.getString("token", true).trim();
  const discordId = interaction.user.id;

  await interaction.reply({
    embeds: [EmbedPresets.loading("Verifying your token...").build()],
    flags: MessageFlags.Ephemeral,
  });

  try {
    const linkingService = new UserLinkingService(interaction.client);

    const result = await linkingService.link(token, discordId);

    if (result.success) {
      const embed = createEmbed()
        .title("✅ Account Linked Successfully!")
        .description(result.message)
        .color(EmbedColors.Success)
        .field("Minecraft Account", result.minecraftName || "Unknown", true)
        .field("Discord Account", interaction.user.tag, true);

      if (result.ranksAssigned && result.ranksAssigned.length > 0) {
        embed.field(
          "Roles assigned",
          result.ranksAssigned.map((role) => `• ${role}`).join("\n"),
          false
        );
      }

      if (result.ranksSkipped && result.ranksSkipped.length > 0) {
        embed.field(
          "⚠️ Ranks Not Mapped",
          `The following ranks don't have Discord role mappings:\n${result.ranksSkipped
            .map((rank) => `• ${rank}`)
            .join(
              "\n"
            )}\n\nContact an administrator if these should have roles.`,
          false
        );
      }

      embed.timestamp();

      await interaction.editReply({ embeds: [embed.build()] });

      logger.info(
        `User ${interaction.user.tag} (${discordId}) successfully linked to ${result.minecraftName}`
      );
    } else {
      const embed = EmbedPresets.error("Linking Failed", result.message);

      embed.field(
        "💡 Need Help?",
        [
          "• Make sure you copied the complete token",
          "• Tokens expire after a certain time - generate a new one if needed",
          "• Use `/link` command in Minecraft to get a new token",
          "• Contact server staff if the issue persists",
        ].join("\n"),
        false
      );

      await interaction.editReply({ embeds: [embed.build()] });

      logger.warn(
        `Failed link attempt by ${interaction.user.tag} (${discordId}): ${result.message}`
      );
    }
  } catch (error) {
    logger.error("Unexpected error in link command:", error);

    const embed = EmbedPresets.error(
      "Unexpected Error",
      "An unexpected error occurred while processing your request. Please try again later."
    )
      .field(
        "🔧 Troubleshooting",
        "If this issue persists, please contact a server administrator.",
        false
      )
      .build();

    try {
      await interaction.editReply({ embeds: [embed] });
    } catch (replyError) {
      logger.error("Failed to send error message to user:", replyError);
    }
  }
}
