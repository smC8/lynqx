import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { IProviderRegistry } from "./interfaces/IProviderRegistry";
import { IProviderPlugin } from "./interfaces/IProviderPlugin";
import { IPaymentProvider } from "../domains/payments/interfaces/IPaymentProvider";
import { IAccountInfoProvider } from "../domains/account-info/interfaces/IAccountInfoProvider";
import { PaymentProviderWrapper } from "../providers/PaymentProviderWrapper";
import { IConfigLoader } from "../common/config/IConfigLoader";

@injectable()
export class ProviderRegistry implements IProviderRegistry {
  private plugins = new Map<string, IProviderPlugin>();

  constructor(@inject(TYPES.IConfigLoader) private configLoader: IConfigLoader) {}

//   registerProvider(name: string, plugin: IProviderPlugin): void {
  registerProvider(plugin: IProviderPlugin): void {
    this.plugins.set(plugin.name, plugin);
  }

  /** Back-compat helpers (optional) */
  registerPaymentProvider(name: string, provider: IPaymentProvider): void {
    const existing = this.plugins.get(name) ?? { name };
    this.plugins.set(name, { ...existing, payment: provider });
  }

  registerAccountInfoProvider(name: string, provider: IAccountInfoProvider): void {
    const existing = this.plugins.get(name) ?? { name };
    this.plugins.set(name, { ...existing, accountInfo: provider });
  }

  getPaymentProvider(name: string): IPaymentProvider | undefined {
    return this.plugins.get(name)?.payment;
  }

  getAccountInfoProvider(name: string): IAccountInfoProvider | undefined {
    return this.plugins.get(name)?.accountInfo;
  }

  getPaymentProviderWrapper(name: string): PaymentProviderWrapper | undefined {
    const provider = this.getPaymentProvider(name);
    return provider ? new PaymentProviderWrapper(provider, this.configLoader) : undefined;
    // return provider ? new PaymentProviderWrapper(provider) : undefined;
  }

  listProviders(): string[] {
    return Array.from(this.plugins.keys());
  }
}
