import { IPaymentProvider } from "./IPaymentProvider";
import { IAccountInfoProvider } from "./IAccountInfoProvider";

export interface IProviderRegistry {
  registerPaymentProvider(name: string, provider: IPaymentProvider): void;
  registerAccountInfoProvider(name: string, provider: IAccountInfoProvider): void;

  getPaymentProvider(name: string): IPaymentProvider | undefined;
  getAccountInfoProvider(name: string): IAccountInfoProvider | undefined;

  listProviders(): string[];
}
