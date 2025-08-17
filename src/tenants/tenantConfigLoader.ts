import { ConfigLoader } from '../common/config/ConfigLoader';
import path from 'path';

export type TenantProviderConfig = Record<string, any>;
export type TenantConfig = {
  id: string;
  providers?: Record<string, TenantProviderConfig>;
};

export class TenantConfigLoader {
  private directory: string;

  constructor(directory = path.resolve(process.cwd(), 'tenants')) {
    this.directory = directory;
  }

  load(tenantId: string): TenantConfig | null {
    try {
      const file = path.join(this.directory, `${tenantId}.yml`);
      return ConfigLoader.loadYaml<TenantConfig>(file);
    } catch (e) {
      return null;
    }
  }
}