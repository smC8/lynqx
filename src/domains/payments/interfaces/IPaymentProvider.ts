import { TenantId } from '../../../common/types'; //'../../common/types';

// import { ProviderError } from '../../common/errors/ProviderError'; //use this somewhere

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
  // tenant-aware init (optional for your providers, but wrapper will call if present)    
  init?(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void>; // TODO - Making this optional breaks PaymentProviderWrapper.ts
//   init(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void>;

  // make payment
  makePayment(request: CanonicalPaymentRequest): Promise<CanonicalPaymentResponse>;

  // optional: query status
  getPaymentStatus?(paymentId: string): Promise<CanonicalPaymentResponse>;
}

export interface IPaymentProviderConstructor {
  // classes that implement providers must have a no-arg constructor or factory
  new (...args: any[]): IPaymentProvider;
}