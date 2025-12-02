import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  PermissionFlagsBits,
} from "discord.js";
import { EmbedPresets, createEmbed } from "@/discord/embeds";
import { cooldownManager } from "@/discord/utils/cooldown/cooldown-manager";
import { EmbedColors } from "@/discord/embeds/colors";

export const data = new SlashCommandBuilder()
  .setName("cooldown")
  .setDescription("Manage command cooldowns")
  .setDefaultMemberPermissions(PermissionFlagsBits.Administrator)
  .addSubcommand((sub) =>
    sub
      .setName("reset")
      .setDescription("Reset cooldown for a user")
      .addUserOption((opt) =>
        opt
          .setName("user")
          .setDescription("User to reset cooldowns for")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub
      .setName("reset-command")
      .setDescription("Reset all cooldowns for a specific command")
      .addStringOption((opt) =>
        opt
          .setName("command")
          .setDescription("Command name to reset")
          .setRequired(true)
      )
  )
  .addSubcommand((sub) =>
    sub.setName("stats").setDescription("View cooldown statistics")
  );

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  const subcommand = interaction.options.getSubcommand();

  switch (subcommand) {
    case "reset": {
      const user = interaction.options.getUser("user", true);
      const count = cooldownManager.resetUser(user.id);

      const embed = EmbedPresets.success(
        "Cooldowns Reset",
        `Reset ${count} cooldown(s) for ${user.tag}`
      ).build();

      await interaction.reply({ embeds: [embed] });
      break;
    }

    case "reset-command": {
      const commandName = interaction.options.getString("command", true);
      const success = cooldownManager.resetCommand(commandName);

      const embed = success
        ? EmbedPresets.success(
            "Command Cooldowns Reset",
            `All cooldowns for \`/${commandName}\` have been reset.`
          )
        : EmbedPresets.error(
            "No Cooldowns Found",
            `No active cooldowns found for \`/${commandName}\``
          );

      await interaction.reply({ embeds: [embed.build()] });
      break;
    }

    case "stats": {
      const stats = cooldownManager.getStats();

      const embed = createEmbed()
        .title("📊 Cooldown Statistics")
        .color(EmbedColors.Info)
        .field("Total Active Cooldowns", stats.totalCooldowns.toString(), true)
        .field("Commands with Cooldowns", stats.totalCommands.toString(), true);

      if (Object.keys(stats.byCommand).length > 0) {
        const commandList = Object.entries(stats.byCommand)
          .map(([cmd, count]) => `\`/${cmd}\`: ${count}`)
          .join("\n");

        embed.field("By Command", commandList || "None");
      }

      await interaction.reply({ embeds: [embed.build()] });
      break;
    }
  }
}
