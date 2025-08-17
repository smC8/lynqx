import { injectable, inject } from "inversify";
import { IPaymentsService } from "../interfaces/IPaymentsService";
import { TYPES } from "../../../types";
import { IProviderRegistry } from "../../../providers/interfaces/IProviderRegistry";
import { ProviderError } from "../../../common/errors/ProviderError";
import { IConfigLoader } from "../../../common/config/IConfigLoader";

/**
 * Service implements the canonical behaviour, delegates to provider implementation
 * after mapping canonical -> provider request/response via provider plugin.
 */
@injectable()
export class PaymentsService implements IPaymentsService {
  constructor(
    @inject(TYPES.IProviderRegistry) private registry: IProviderRegistry,
    @inject(TYPES.IConfigLoader) private configLoader: IConfigLoader
  ) {}

async createPayment(tenantId: string, providerName: string, payload: any) {
  // Get wrapper from registry
  const wrapper = this.registry.getPaymentProviderWrapper(providerName);
  if (!wrapper) {
    throw new ProviderError(`Payment provider not found: ${providerName}`, { statusCode: 404 });
  }

  try {
    return await wrapper.createPayment(tenantId, payload);
  } catch (err) {
    // provider-level errors should already be-normalized by plugin -> can be further wrapped here
    throw err;
  }
}

async getPaymentStatus(tenantId: string, providerName: string, paymentId: string) {
  const wrapper = this.registry.getPaymentProviderWrapper(providerName);
  if (!wrapper) {
    throw new ProviderError(`Payment provider not found: ${providerName}`, { statusCode: 404 });
  }
  try {
    return await wrapper.getPaymentStatus(tenantId, paymentId);
  } catch (err) {
    throw err;
  }
}
