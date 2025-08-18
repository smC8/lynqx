// README - how to add a provider plugin (summary)
1. Create folder `src/providers/<provider-name>`
2. Export a `providers` object from the folder, e.g.
   ```js
   module.exports = {
     providers: {
       payments: {
         chase: ChasePaymentsProviderCtor
       }
     }
   }
   ```
3. Implement provider class to match `IPaymentProvider` interface and include `init()` to accept tenant config.
4. Add tenant YAML files under `/tenants/<tenantId>.yml` containing provider-specific credentials.

## Rationale
Here’s the clean, senior-architect way to slice it (Hexagonal/Ports-and-Adapters):

## What belongs where (and why)

* **Domain contracts live under `src/domains/**`**
  These are your *ports*. They define the canonical request/response shapes and the behaviors the domain needs. They must not depend on provider plumbing or metadata.

  * `src/domains/payments/interfaces/IPaymentProvider.ts` (+ canonical types)
  * `src/domains/account-info/interfaces/IAccountInfoProvider.ts` (+ canonical types)

* **Provider/plugin plumbing lives under `src/providers/**`**
  These are your *adapters + registry + metadata*. A plugin may host one or more domain adapters (e.g., a plugin can expose a Payment adapter and/or an AccountInfo adapter).

  * `src/providers/interfaces/IProviderPlugin.ts` (name, init, optional generic `sendRequest`, **and references to domain adapters**)
  * `src/providers/registry.ts` (keeps a map of provider **plugins**, not raw domain adapters)
  * `src/providers/PaymentProviderWrapper.ts` (maps raw payload ⇄ canonical, loads tenant config, calls domain adapter)

### Why this separation?

* Domains stay pure and stable (no `name`, no registry concerns).
* Providers/plugins supply **metadata** (`name`) and bundle **domain adapters** (e.g., `.payment`, `.accountInfo`).
* The registry doesn’t cast/blindly assert types—it **knows** which domain adapters a plugin exposes.

---

## What to change (concretely)

### 1) Keep exactly one `IPaymentProvider` (in **domains**). Delete the duplicate under `providers/`

Delete:
`src/providers/interfaces/IPaymentProvider.ts`
(It currently re-exports/mixes domain types and causes conflicts.)

**Final domain contract:**

`src/domains/payments/interfaces/IPaymentProvider.ts`

```ts
import { TenantId } from "../../../common/types";

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
  status: "PENDING" | "SUCCESS" | "FAILED";
  raw?: any;
};

export interface IPaymentProvider {
  // tenant-aware init (optional for your providers, but wrapper will call if present)
  init?(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void> | void;

  makePayment(request: CanonicalPaymentRequest): Promise<CanonicalPaymentResponse>;
  getPaymentStatus?(paymentId: string): Promise<CanonicalPaymentResponse>;
}
```

> Note: I kept your original `makePayment` + optional `getPaymentStatus` to align with your earlier wrapper code and reduce churn.

### 2) Define the Account-Info domain contract (in **domains**) and use it everywhere

If you already have one, keep it there; otherwise:

`src/domains/account-info/interfaces/IAccountInfoProvider.ts`

```ts
import { TenantId } from "../../../common/types";

export type CanonicalAccountInfoResponse = {
  accountId: string;
  balances?: any;
  owner?: any;
  raw?: any;
};

export interface IAccountInfoProvider {
  // optional tenant init
  init?(tenantId: TenantId, tenantConfig: Record<string, any>): Promise<void> | void;

  // keep name consistent with your existing code if you already use 'fetchAccountDetails'
  fetchAccountDetails(accountId: string): Promise<CanonicalAccountInfoResponse>;
}
```

> If your existing repo already uses a different name/signature, keep that to avoid breaking code; the key is: **this lives under `domains/…` and is the single source of truth.**

### 3) Make `IProviderPlugin` the **bundle** that exposes domain adapters (no casting)

Update it to reference the domain adapters:

`src/providers/interfaces/IProviderPlugin.ts`

```ts
import { IPaymentProvider } from "../../domains/payments/interfaces/IPaymentProvider";
import { IAccountInfoProvider } from "../../domains/account-info/interfaces/IAccountInfoProvider";

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
  /** Stable identity (e.g., "chase", "plaid") */
  name: string;

  /** Optional global init for static provider config */
  init?(staticProviderConfig?: any): Promise<void> | void;

  /** Optional generic RPC-ish fallback, if you keep it */
  sendRequest?(tenantConfig: any, request: CanonicalRequest): Promise<CanonicalResponse>;

  /** Domain adapters this plugin provides (use either or both) */
  payment?: IPaymentProvider;
  accountInfo?: IAccountInfoProvider;
}
```

Now the registry never needs to cast a plugin to a domain adapter; it can just read `plugin.payment` or `plugin.accountInfo`.

### 4) Implement the `ProviderRegistry` against plugins (not raw adapters)

`src/providers/registry.ts`

```ts
import { injectable, inject } from "inversify";
import { TYPES } from "../types";
import { IProviderRegistry } from "./interfaces/IProviderRegistry";
import { IProviderPlugin } from "./interfaces/IProviderPlugin";
import { IPaymentProvider } from "../..//domains/payments/interfaces/IPaymentProvider";
import { IAccountInfoProvider } from "../..//domains/account-info/interfaces/IAccountInfoProvider";
import { PaymentProviderWrapper } from "../providers/PaymentProviderWrapper";
import { IConfigLoader } from "../common/config/IConfigLoader";

@injectable()
export class ProviderRegistry implements IProviderRegistry {
  private plugins = new Map<string, IProviderPlugin>();

  constructor(@inject(TYPES.IConfigLoader) private configLoader: IConfigLoader) {}

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
  }

  listProviders(): string[] {
    return Array.from(this.plugins.keys());
  }
}
```

…and ensure the interface matches:

`src/providers/interfaces/IProviderRegistry.ts`

```ts
import { IPaymentProvider } from "../../domains/payments/interfaces/IPaymentProvider";
import { IAccountInfoProvider } from "../../domains/account-info/interfaces/IAccountInfoProvider";
import { IProviderPlugin } from "./IProviderPlugin";
import { PaymentProviderWrapper } from "../PaymentProviderWrapper";

export interface IProviderRegistry {
  registerProvider(plugin: IProviderPlugin): void;

  registerPaymentProvider(name: string, provider: IPaymentProvider): void;
  registerAccountInfoProvider(name: string, provider: IAccountInfoProvider): void;

  getPaymentProvider(name: string): IPaymentProvider | undefined;
  getAccountInfoProvider(name: string): IAccountInfoProvider | undefined;

  getPaymentProviderWrapper(name: string): PaymentProviderWrapper | undefined;

  listProviders(): string[];
}
```

### 5) Keep the wrapper focused on mapping + tenant init

`src/providers/PaymentProviderWrapper.ts`

```ts
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
```

### 6) Service uses the wrapper (no direct provider calls)

`src/domains/payments/services/PaymentsService.ts`

```ts
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
```

### 7) Sample providers implement **domain** contracts; plugin bundles them + `name`

Example payment adapter:
`src/providers/chase/paymentAdapter.ts`

```ts
import { IPaymentProvider, CanonicalPaymentRequest, CanonicalPaymentResponse } 
  from "../../domains/payments/interfaces/IPaymentProvider";

export class ChasePaymentAdapter implements IPaymentProvider {
  async init(tenantId: string, tenantConfig: Record<string, any>) {
    // setup client with tenant secrets
  }

  async makePayment(req: CanonicalPaymentRequest): Promise<CanonicalPaymentResponse> {
    // map -> Chase API -> map back
    return { id: "chase-123", status: "PENDING" };
  }

  async getPaymentStatus(paymentId: string): Promise<CanonicalPaymentResponse> {
    return { id: paymentId, status: "SUCCESS" };
  }
}
```

Bundle as a plugin:
`src/providers/chase/index.ts`

```ts
import { IProviderPlugin } from "../interfaces/IProviderPlugin";
import { ChasePaymentAdapter } from "./paymentAdapter";
// (optionally) import ChaseAccountInfoAdapter

export const ChasePlugin: IProviderPlugin = {
  name: "chase",
  payment: new ChasePaymentAdapter(),
  // accountInfo: new ChaseAccountInfoAdapter(),
};
```

Register:

```ts
registry.registerProvider(ChasePlugin);
```

---

## TL;DR (rationale)

* **Domains define the “what”** (pure, canonical behavior + types).
* **Providers/plugins define the “who and how”** (name, init, and which domain adapters they expose).
* **Registry stores plugins**; **services use wrappers** to map payloads + load tenant config and invoke domain adapters.
* This eliminates the casting errors you saw and the “missing name” vs “missing makePayment” clashes.

If you align your files exactly like above and **remove the duplicate `src/providers/interfaces/IPaymentProvider.ts`**, your build issues around the registry and wrappers should disappear.
