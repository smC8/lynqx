import { IPaymentProvider } from '../../domains/payments/interfaces/IPaymentProvider';
import { IAccountInfoProvider } from "../../domains/account-info/interfaces/IAccountInfoProvider";
import { PaymentProviderWrapper } from "../PaymentProviderWrapper";
import { IProviderPlugin } from "./IProviderPlugin";

export interface IProviderRegistry {
  // Generic registration for any provider plugin
  // registerProvider(name: string, provider: IProviderPlugin): void;
    registerProvider(plugin: IProviderPlugin): void;


  // Keep domain-specific accessors
  registerPaymentProvider(name: string, provider: IPaymentProvider): void;
  registerAccountInfoProvider(name: string, provider: IAccountInfoProvider): void;

  // Retrieval
  getPaymentProvider(name: string): IPaymentProvider | undefined;
  getAccountInfoProvider(name: string): IAccountInfoProvider | undefined;

  // Wrappers
  getPaymentProviderWrapper(providerName: string): PaymentProviderWrapper | undefined;

  // Utility
  listProviders(): string[];
}
