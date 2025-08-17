import { TenantId } from '../../common/types';
import { ProviderError } from '../../common/errors/ProviderError';

export type CanonicalPaymentRequest = {
  amount: number;
  currency: string;
  beneficiaryAccount: string;
  beneficiaryName?: string;
  remitterAccount?: string;
  metadata?: Record<string, any>;
};

export type CanonicalPaymentResponse = {
  id: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED';
  raw?: any;
};

export interface IPaymentProvider {
  // initialize provider with tenant-specific config
  init(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void>;

  // make payment
  makePayment(request: CanonicalPaymentRequest): Promise<CanonicalPaymentResponse>;

  // optional: query status
  getPaymentStatus?(paymentId: string): Promise<CanonicalPaymentResponse>;
}

export interface IPaymentProviderConstructor {
  // classes that implement providers must have a no-arg constructor or factory
  new (...args: any[]): IPaymentProvider;
}