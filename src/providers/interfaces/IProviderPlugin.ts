import { IPaymentProvider } from "../../domains/payments/interfaces/IPaymentProvider";
import { IAccountInfoProvider } from "../../domains/account-info/interfaces/IAccountInfoProvider";

/**
 * Keep plugins generic — they accept tenantConfig and canonical requests.
 * The ProviderRegistry will wrap plugin implementations to inject tenantConfig automatically.
 */
export type CanonicalRequest = {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  query?: Record<string, any>;
  body?: any;
  headers?: Record<string, string>;
};

export type CanonicalResponse = {
  success: boolean;
  data?: any;
  error?: any;
};

export interface IProviderPlugin {
  /**
   * A provider must expose a stable name (e.g. "chase", "plaid").
   */
  name: string;

  /**
   * Provider-level init hook (optional).
   * Called once by the registry during load if present.
   */
  init?(staticProviderConfig?: any): Promise<void> | void;

  /**
   * Generic request entrypoint providers should support.
   * Domain-specific method signatures (createPayment, fetchAccount) are allowed,
   * but the registry/wrapper will use this fallback if present.
   *
   * IMPORTANT: This expects tenantConfig merged/validated by the registry.
   */
  sendRequest?(tenantConfig: any, request: CanonicalRequest): Promise<CanonicalResponse>;

    /** Domain adapters this plugin provides (use either or both) */
  payment?: IPaymentProvider;
  accountInfo?: IAccountInfoProvider;
}
