// src/providers/registry/ProviderRegistry.ts
import fs from "fs";
import path from "path";

export type ProviderClass = new (...args: any[]) => any;

export class ProviderRegistry {
  private static providers: Map<string, ProviderClass> = new Map();

  static loadProviders(): void {
    const pluginsDir = path.resolve(__dirname, "../plugins");
    const files = fs.readdirSync(pluginsDir);

    for (const file of files) {
      if (!file.endsWith(".ts") && !file.endsWith(".js")) continue;

      const modulePath = path.join(pluginsDir, file);
      const imported = require(modulePath);

      // Assume default export is the provider class
      const Provider = imported.default;
      if (!Provider || !Provider.name) continue;

      // Convention: class name = <ProviderName>Provider
      const providerName = Provider.name.replace("Provider", "").toLowerCase();

      this.providers.set(providerName, Provider);
    }
  }

  static getProvider(name: string): ProviderClass | undefined {
    return this.providers.get(name.toLowerCase());
  }
}
