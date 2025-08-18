import { injectable, inject } from "inversify";
import { IAccountInfoService } from "../interfaces/IAccountInfoService";
import { TYPES } from "../../../types";
import { IProviderRegistry } from "../../../providers/interfaces/IProviderRegistry";
import { IConfigLoader } from "../../../common/config/IConfigLoader";
import { ProviderError } from "../../../common/errors/ProviderError";

@injectable()
export class AccountInfoService implements IAccountInfoService {
  constructor(
    @inject(TYPES.IProviderRegistry) private registry: IProviderRegistry,
    @inject(TYPES.IConfigLoader) private configLoader: IConfigLoader
  ) {}

  async fetchAccount(tenantId: string, providerName: string, payload: any) {
    const tenantCfg = await this.configLoader.loadTenantConfig(tenantId);
    if (!tenantCfg) throw new ProviderError("Tenant configuration not found", { statusCode: 400 });

    const provider = this.registry.getAccountInfoProvider(providerName);
    if (!provider || !provider.fetchAccountDetails) {
      throw new ProviderError(`Account-info provider not found: ${providerName}`, { statusCode: 404 });
    }

    try {
      return await provider.fetchAccountDetails(tenantId, providerName, payload.accountId);
    } catch (err) {
      throw err;
    }
  }
}
