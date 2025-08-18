import { TenantId } from '../../../common/types'; //'../../common/types';

export type CanonicalAccountInfoResponse = {
  accountId: string;
  balances?: any;
  owner?: any;
  raw?: any;
};

export interface IAccountInfoProvider {
  // initialize provider with tenant-specific config (Optional)
  // TODO Making this Optional will break the Account-info equivalent of PaymentProviderWrapper.ts
  init?(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void>;
  // init(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void>;

  // fetchAccountDetails
  fetchAccountDetails(tenantId: string, provider: string, accountId: string): Promise<CanonicalAccountInfoResponse>;
    // fetchAccountDetails(accountId: string): Promise<CanonicalAccountInfoResponse>;


  // optional: query status
  getStatementStatus?(paymentId: string): Promise<CanonicalAccountInfoResponse>;
}

export interface IPaymentProviderConstructor {
  // classes that implement providers must have a no-arg constructor or factory
  new (...args: any[]): IAccountInfoProvider;
}