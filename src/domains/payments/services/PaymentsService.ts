// // src/domains/payments/services/PaymentService.ts
// import { injectable } from "inversify";
// import { TenantConfigLoader } from "../../../tenants/tenantConfigLoader";
// import { ProviderRegistry } from "../../../providers/registry/ProviderRegistry";
// import { IPaymentProvider } from "../../../providers/interfaces/IPaymentProvider";

// @injectable()
// export class PaymentService {
//   async processPayment(tenantId: string, payload: any): Promise<any> {
//     const tenantConfig = new TenantConfigLoader().load(tenantId);
//     if (!tenantConfig) throw new Error(`Tenant ${tenantId} not found`);

//     const providerName = tenantConfig.providers?.payments?.provider;
//     if (!providerName) throw new Error(`No payment provider configured for ${tenantId}`);

//     const ProviderClass = ProviderRegistry.getProvider(providerName);
//     if (!ProviderClass) throw new Error(`Provider ${providerName} not found`);

//     const provider: IPaymentProvider = new ProviderClass();
//     return provider.initiatePayment(payload);
//   }
// }


import { injectable, inject } from "inversify";
import { IPaymentsService } from "../interfaces/IPaymentsService";
import { TYPES } from "../../../types";
import { IProviderRegistry } from "../../../providers/interfaces/IProviderRegistry";
import { ProviderError } from "../../../common/errors/ProviderError";

@injectable()
export class PaymentsService implements IPaymentsService {
  constructor(
    @inject(TYPES.IProviderRegistry) private registry: IProviderRegistry
  ) {}

  async createPayment(tenantId: string, providerName: string, payload: any) {
    const wrapper = this.registry.getPaymentProviderWrapper(providerName);
    if (!wrapper) {
      throw new ProviderError(`Payment provider not found: ${providerName}`, { statusCode: 404 });
    }
    return wrapper.createPayment(tenantId, payload);
  }

  async getPaymentStatus(tenantId: string, providerName: string, paymentId: string) {
    const wrapper = this.registry.getPaymentProviderWrapper(providerName);
    if (!wrapper) {
      throw new ProviderError(`Payment provider not found: ${providerName}`, { statusCode: 404 });
    }
    return wrapper.getPaymentStatus(tenantId, paymentId);
  }
}
