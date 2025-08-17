// src/providers/ProviderRegistry.ts
import fs from "fs";
import path from "path";
import { IProviderPlugin } from "../types/provider";

export class ProviderRegistry {
  private providers: Map<string, IProviderPlugin> = new Map();

  constructor(private providersDir: string) {}

  /**
   * Auto-discovers and registers all provider plugins
   */
  public async loadProviders(): Promise<void> {
    const files = fs.readdirSync(this.providersDir);

    for (const file of files) {
      // only load compiled .js files (safe scanning)
      if (!file.endsWith(".js")) continue;

      const fullPath = path.join(this.providersDir, file);

      try {
        const mod = await import(fullPath);
        const ProviderClass = mod.default || mod.Provider;

        if (!ProviderClass) {
          console.warn(`No default export in ${file}, skipping`);
          continue;
        }

        const instance: IProviderPlugin = new ProviderClass();

        if (!instance.name) {
          console.warn(`Provider in ${file} missing name, skipping`);
          continue;
        }

        this.providers.set(instance.name, instance);
        console.log(`✅ Loaded provider: ${instance.name}`);
      } catch (err) {
        console.error(`❌ Failed to load provider ${file}:`, err);
      }
    }
  }

  /**
   * Get provider instance by name
   */
  public getProvider(name: string): IProviderPlugin | undefined {
    return this.providers.get(name);
  }

  /**
   * List all loaded providers
   */
  public listProviders(): string[] {
    return Array.from(this.providers.keys());
  }
}
