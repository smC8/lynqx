import { IPaymentProvider, CanonicalPaymentRequest, CanonicalPaymentResponse } 
  from "../domains/payments/interfaces/IPaymentProvider";
import { IConfigLoader } from "../common/config/IConfigLoader";

export class PaymentProviderWrapper {
  constructor(
    private provider: IPaymentProvider,
    private configLoader: IConfigLoader
  ) {}

  async createPayment(tenantId: string, payload: any): Promise<CanonicalPaymentResponse> {
    const tenantConfig = await this.configLoader.loadTenantConfig(tenantId);
    if (this.provider.init) {
      await this.provider.init(tenantId, tenantConfig ?? {});
    }

    // Map raw payload -> your canonical request
    const canonical: CanonicalPaymentRequest = {
      amount: payload.amount,
      currency: payload.currency,
      beneficiaryAccount: payload.account,
      beneficiaryName: payload.name,
      remitterAccount: payload.fromAccount,
      metadata: payload.metadata,
    };

    return this.provider.makePayment(canonical);
  }

  async getPaymentStatus(tenantId: string, paymentId: string): Promise<CanonicalPaymentResponse> {
    const tenantConfig = await this.configLoader.loadTenantConfig(tenantId);
    if (this.provider.init) {
      await this.provider.init(tenantId, tenantConfig ?? {});
    }
    if (!this.provider.getPaymentStatus) {
      throw new Error("Provider does not support status check");
    }
    return this.provider.getPaymentStatus(paymentId);
  }
}
