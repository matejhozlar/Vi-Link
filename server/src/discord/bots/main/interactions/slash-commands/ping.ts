import { EmbedPresets } from "@/discord/embeds";
import { ChatInputCommandInteraction } from "discord.js";

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
