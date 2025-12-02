export type CooldownType = "user" | "global" | "channel" | "guild";

interface CooldownEntry {
  expiresAt: number;
  userId?: string;
}

interface CooldownConfig {
  duration: number;
  type: CooldownType;
  message?: string;
}

export class CooldownManager {
  private cooldowns = new Map<string, Map<string, CooldownEntry>>();

  /**
   * Generates a unique key based on cooldown
   */
  private getKey(
    commandName: string,
    type: CooldownType,
    interaction: { userId: string; channelId: string; guildId: string | null }
  ): string {
    switch (type) {
      case "user":
        return `${commandName}:user:${interaction.userId}`;
      case "global":
        return `${commandName}:global`;
      case "channel":
        return `${commandName}:channel:${interaction.channelId}`;
      case "guild":
        return interaction.guildId
          ? `${commandName}:guild:${interaction.guildId}`
          : `${commandName}:user:${interaction.userId}`;
      default:
        return `${commandName}:user:${interaction.userId}`;
    }
  }

  /**
   * Check if command is on cooldown
   * @returns Remaining cooldown time in seconds, or null if not on cooldown
   */
  public check(
    commandName: string,
    cfg: CooldownConfig,
    interaction: { userId: string; channelId: string; guildId: string | null }
  ): number | null {
    const key = this.getKey(commandName, cfg.type, interaction);

    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;

    if (timestamps.has(key)) {
      const entry = timestamps.get(key)!;

      if (now < entry.expiresAt) {
        const remaining = (entry.expiresAt - now) / 1000;
        return remaining;
      }

      timestamps.delete(key);
    }

    return null;
  }

  public set(
    commandName: string,
    cfg: CooldownConfig,
    interaction: { userId: string; channelId: string; guildId: string | null }
  ): void {
    const key = this.getKey(commandName, cfg.type, interaction);

    if (!this.cooldowns.has(commandName)) {
      this.cooldowns.set(commandName, new Map());
    }

    const now = Date.now();
    const timestamps = this.cooldowns.get(commandName)!;
    const expiresAt = now + cfg.duration * 1000;

    timestamps.set(key, {
      expiresAt,
      userId: interaction.userId,
    });

    setTimeout(() => {
      timestamps.delete(key);

      if (timestamps.size === 0) {
        this.cooldowns.delete(commandName);
      }
    }, cfg.duration * 1000);
  }

  public reset(
    commandName: string,
    type: CooldownType,
    interaction: { userId: string; channelId: string; guildId: string | null }
  ): boolean {
    const key = this.getKey(commandName, type, interaction);
    const timestamps = this.cooldowns.get(commandName);

    if (timestamps && timestamps.has(key)) {
      timestamps.delete(key);
      return true;
    }

    return false;
  }

  public resetCommand(commandName: string): boolean {
    return this.cooldowns.delete(commandName);
  }

  public resetUser(userId: string): number {
    let count = 0;

    this.cooldowns.forEach((timestamps, commandName) => {
      timestamps.forEach((entry, key) => {
        if (entry.userId === userId || key.includes(`:user:${userId}`)) {
          timestamps.delete(key);
          count++;
        }
      });

      if (timestamps.size === 0) {
        this.cooldowns.delete(commandName);
      }
    });

    return count;
  }

  /**
   * Get remaining cooldown for debugging/admin purposes
   */
  public getRemaining(
    commandName: string,
    type: CooldownType,
    interaction: { userId: string; channelId: string; guildId: string | null }
  ): number | null {
    return this.check(commandName, { duration: 0, type }, interaction);
  }

  public getAllCooldowns(): Map<string, Map<string, CooldownEntry>> {
    return this.cooldowns;
  }

  public getStats() {
    let totalCooldowns = 0;
    const commandStats: Record<string, number> = {};

    this.cooldowns.forEach((timestamps, commandName) => {
      const count = timestamps.size;
      totalCooldowns += count;
      commandStats[commandName] = count;
    });

    return {
      totalCooldowns,
      totalCommands: this.cooldowns.size,
      byCommand: commandStats,
    };
  }
}

export const cooldownManager = new CooldownManager();
