import { EmbedPresets } from "@/discord/embeds";
import { ChatInputCommandInteraction, SlashCommandBuilder } from "discord.js";

export const data = new SlashCommandBuilder()
  .setName("ping")
  .setDescription("Check bot latency");

export const cooldown = {
  duration: 5,
  type: "user" as const,
  message: "Please wait before checking ping again!",
};

export const prodOnly = false;

export async function execute(
  interaction: ChatInputCommandInteraction
): Promise<void> {
  await interaction.reply({
    embeds: [EmbedPresets.loading("Calculating ping...").build()],
  });

  const message = await interaction.fetchReply();

  const latency = message.createdTimestamp - interaction.createdTimestamp;
  const wsLatency = interaction.client.ws.ping;

  const embed = EmbedPresets.info("🏓 Pong!")
    .field("Bot Latency", `${latency}ms`, true)
    .field("WebSocket Latency", `${wsLatency}ms`, true)
    .build();

  await interaction.editReply({ embeds: [embed] });
}
