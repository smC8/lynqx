import fs from "fs";
import path from "path";
import YAML from "yamljs";
import { injectable } from "inversify";
import { IConfigLoader } from "./IConfigLoader";
import { TenantConfig } from "./types";

/**
 * Loads provider configs from providers/<*>/provider.config.yml (static)
 * and tenant configs from tenants/<tenantId>.yml (sensitive)
 *
 * In production: tenant secrets should come from Vault / AWS Secrets Manager.
 */
@injectable()
export class ConfigLoader implements IConfigLoader {
  private providerConfigs: Record<string, any> = {};
  private tenantCache: Map<string, TenantConfig> = new Map();

  async loadProviderConfigs(): Promise<Record<string, any>> {
    if (Object.keys(this.providerConfigs).length) return this.providerConfigs;

    const providersDir = path.resolve(process.cwd(), "src", "providers");
    if (!fs.existsSync(providersDir)) return {};

    const dirs = fs.readdirSync(providersDir, { withFileTypes: true });
    for (const d of dirs) {
      if (!d.isDirectory()) continue;
      const cfgPath = path.join(providersDir, d.name, "provider.config.yml");
      if (fs.existsSync(cfgPath)) {
        try {
          const cfg = YAML.parse(fs.readFileSync(cfgPath, "utf8"));
          this.providerConfigs[d.name] = cfg;
        } catch (err) {
          // eslint-disable-next-line no-console
          console.warn(`Failed to parse provider config for ${d.name}`, err);
        }
      }
    }
    return this.providerConfigs;
  }

  async loadTenantConfig(tenantId: string): Promise<TenantConfig | null> {
    // In prod, use a secrets manager. Here we load from tenants/tenantId.yml
    const tenantsDir = path.resolve(process.cwd(), "src", "tenants");
    const p = path.join(tenantsDir, `${tenantId}.yml`);
    if (!fs.existsSync(p)) return null;
    const raw = YAML.parse(fs.readFileSync(p, "utf8"));
    const cfg: TenantConfig = {
      tenantId,
      ...raw,
    };
    this.tenantCache.set(tenantId, cfg);
    return cfg;
  }

  getCachedTenantConfig(tenantId: string): TenantConfig | null {
    return this.tenantCache.get(tenantId) ?? null;
  }
}
