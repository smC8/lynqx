import { TenantConfig } from "./types";

export interface IConfigLoader {
  loadProviderConfigs(): Promise<Record<string, any>>;
  loadTenantConfig(tenantId: string): Promise<TenantConfig | null>;
  getCachedTenantConfig(tenantId: string): TenantConfig | null;
}
