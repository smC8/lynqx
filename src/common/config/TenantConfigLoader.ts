import { injectable, inject } from "inversify";
import { IConfigLoader } from "./IConfigLoader";
import { TenantConfig } from "./types";
import { TYPES } from "../../types";

/**
 * Thin wrapper to provide consistent tenant config retrieval semantics.
 * Uses your existing IConfigLoader implementation (ConfigLoader).
 *
 * Advantages:
 * - central place to add caching, overrides, merges with provider defaults, secret lookups
 * - convenient method signature for ProviderRegistry
 */

@injectable()
export class TenantConfigLoader {
  constructor(@inject(TYPES.IConfigLoader) private cfgLoader: IConfigLoader) {}

  /**
   * Returns tenant config merged with provider static defaults (if providerCfg provided).
   * The merge policy is shallow for headers/query and deep enough for common cases.
   */
  async getTenantConfig(tenantId: string, providerName?: string, providerCfg?: any): Promise<TenantConfig | null> {
    // Load tenant config (from YAML/DB/secrets via IConfigLoader)
    const tenantCfg = await this.cfgLoader.loadTenantConfig(tenantId);
    if (!tenantCfg) return null;

    // Optionally merge provider static config into tenant config for convenience
    if (providerName && providerCfg) {
      const tenantProviderCfg = tenantCfg.providers?.[providerName] ?? {};
      // merge: provider static defaults <- tenant overrides
      const merged = {
        ...providerCfg, // provider static defaults (baseUrl, default headers)
        ...tenantProviderCfg, // tenant credentials/overrides
        headers: {
          ...(providerCfg?.headers ?? {}),
          ...(tenantProviderCfg?.headers ?? {}),
        },
        queryParams: {
          ...(providerCfg?.queryParams ?? {}),
          ...(tenantProviderCfg?.queryParams ?? {}),
        },
      };
      return { ...tenantCfg, providers: { ...(tenantCfg.providers ?? {}), [providerName]: merged } };
    }

    return tenantCfg;
  }
}
