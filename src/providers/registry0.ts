// import fs from "fs";
// import path from "path";
// import { injectable, inject } from "inversify";
// import { IProviderPlugin, CanonicalRequest, CanonicalResponse } from "./interfaces/IProviderPlugin";
// import { IProviderRegistry } from "./interfaces/IProviderRegistry";
// import { IConfigLoader } from "../common/config/IConfigLoader";
// import { TenantConfigLoader } from "../common/config/TenantConfigLoader";
// import { TYPES } from "../types";

// /**
//  * ProviderRegistry:
//  * - Auto-discovers provider modules under dist/providers/<provider>/index.js (safe)
//  * - Accepts provider modules exporting:
//  *      - register(registry) function (preferred) OR
//  *      - default export class implementing IProviderPlugin
//  * - Wraps provider plugin instances with a tenant-aware wrapper so callers supply tenantId + canonical request only.
//  *
//  * Important: This registry is intended to be bound in Inversify container as singleton.
//  */

// @injectable()
// export class ProviderRegistry implements IProviderRegistry {
//   private paymentProviders: Map<string, IProviderPlugin> = new Map();
//   private accountInfoProviders: Map<string, IProviderPlugin> = new Map();
//   private genericProviders: Map<string, IProviderPlugin> = new Map();

//   // path to compiled providers (runtime). Default: dist/providers
//   private providersDistDir: string;

//   constructor(
//     @inject(TYPES.IConfigLoader) private configLoader: IConfigLoader,
//     @inject(TYPES.IConfigLoader) private _unusedForTypeHarmony?: IConfigLoader // keep DI metadata consistent
//   ) {
//     // default runtime dir (adjustable for your deployment)
//     this.providersDistDir = path.resolve(process.cwd(), "dist", "providers");
//   }

//   /**
//    * DISCOVERY:
//    * Scan dist/providers for provider folders and try to import their index.js
//    * This keeps runtime safe (we only load compiled JS) and avoids loading TS files at runtime.
//    */
//   public async loadProviders(): Promise<void> {
//     if (!fs.existsSync(this.providersDistDir)) {
//       // nothing to load
//       console.warn(`ProviderRegistry: providers dir not found: ${this.providersDistDir}`);
//       return;
//     }

//     const entries = fs.readdirSync(this.providersDistDir, { withFileTypes: true });
//     for (const e of entries) {
//       if (!e.isDirectory()) continue;
//       const providerDir = path.join(this.providersDistDir, e.name);
//       const entryJs = path.join(providerDir, "index.js");

//       if (!fs.existsSync(entryJs)) {
//         console.warn(`ProviderRegistry: no index.js for provider ${e.name}, skipping`);
//         continue;
//       }

//       try {
//         // dynamic import of the provider module
//         const mod = await import(entryJs);

//         // if module exports a register function, call it passing this registry
//         if (typeof mod.register === "function") {
//           try {
//             await mod.register(this);
//             console.log(`ProviderRegistry: executed register() for ${e.name}`);
//           } catch (regErr) {
//             console.warn(`ProviderRegistry: register() for ${e.name} threw error`, regErr);
//           }
//           continue;
//         }

//         // else, check default export class or Provider export
//         const ProviderCtor = mod.default || mod.Provider;
//         if (!ProviderCtor) {
//           console.warn(`ProviderRegistry: provider module ${e.name} had no default export or register(), skipping`);
//           continue;
//         }

//         // instantiate provider (if it has init hook, call later)
//         const instance: IProviderPlugin = new ProviderCtor();

//         // if provider exposes init and provider.config static is present, try to load provider.static config
//         // provider static config can be included in dist/providers/<name>/provider.config.json (optional)
//         const staticCfgPathJson = path.join(providerDir, "provider.config.json");
//         let staticCfg = undefined;
//         if (fs.existsSync(staticCfgPathJson)) {
//           try {
//             staticCfg = JSON.parse(fs.readFileSync(staticCfgPathJson, "utf8"));
//           } catch (err) {
//             console.warn(`ProviderRegistry: failed to read static config for ${e.name}`, err);
//           }
//         }

//         // call provider init if present
//         if (typeof instance.init === "function") {
//           try {
//             await instance.init(staticCfg);
//           } catch (initErr) {
//             console.warn(`ProviderRegistry: init() for ${e.name} failed`, initErr);
//           }
//         }

//         // register in generic providers map
//         this.genericProviders.set(instance.name, instance);
//         console.log(`ProviderRegistry: loaded provider ${instance.name} (generic)`);
//       } catch (err) {
//         console.error(`ProviderRegistry: failed to import provider module ${entryJs}`, err);
//       }
//     }
//   }

//   /**
//    * Register functions used by provider modules that prefer to self-register
//    */
//   registerPaymentProvider(name: string, provider: IProviderPlugin) {
//     this.paymentProviders.set(name, provider);
//     this.genericProviders.set(name, provider);
//   }

//   registerAccountInfoProvider(name: string, provider: IProviderPlugin) {
//     this.accountInfoProviders.set(name, provider);
//     this.genericProviders.set(name, provider);
//   }

//   // ======= GETTERS that return tenant-aware wrappers =======

//   /**
//    * Returns a wrapper that accepts (tenantId, canonical payload) and internally loads tenantConfig,
//    * merges provider static config, then invokes provider methods.
//    *
//    * Usage:
//    *   const wrapper = registry.getPaymentProviderWrapper('chase');
//    *   await wrapper.createPayment(tenantId, payload);
//    */
//   getPaymentProviderWrapper(name: string) {
//     const provider = this.paymentProviders.get(name) || this.genericProviders.get(name);
//     if (!provider) return undefined;

//     const registry = this;
//     return {
//       async createPayment(tenantId: string, canonicalPayload: any) {
//         // load provider static defaults if present (from compiled provider.config.json)
//         const providerStaticCfg = registry.loadProviderStaticConfig(name);
//         // load tenant config merged with provider static config using the IConfigLoader
//         const tenantCfg = await registry.configLoader.loadTenantConfig(tenantId);
//         if (!tenantCfg) throw new Error(`Tenant config not found for ${tenantId}`);

//         const mergedTenantProviderCfg = {
//           ...(providerStaticCfg ?? {}),
//           ...((tenantCfg.providers && tenantCfg.providers[name]) ?? {}),
//           headers: {
//             ...(providerStaticCfg?.headers ?? {}),
//             ...((tenantCfg.providers && tenantCfg.providers[name] && tenantCfg.providers[name].headers) ?? {}),
//           },
//         };

//         // call provider domain-specific method if available
//         if ((provider as any).createPayment) {
//           return await (provider as any).createPayment(mergedTenantProviderCfg, canonicalPayload);
//         }

//         // fallback to generic sendRequest
//         if (provider.sendRequest) {
//           const req = {
//             method: "POST",
//             endpoint: "/payments",
//             body: canonicalPayload,
//           } as CanonicalRequest;
//           return await provider.sendRequest(mergedTenantProviderCfg, req);
//         }

//         throw new Error(`Provider ${name} does not implement createPayment or sendRequest`);
//       },

//       async getPaymentStatus(tenantId: string, paymentId: string) {
//         const providerStaticCfg = registry.loadProviderStaticConfig(name);
//         const tenantCfg = await registry.configLoader.loadTenantConfig(tenantId);
//         if (!tenantCfg) throw new Error(`Tenant config not found for ${tenantId}`);
//         const mergedTenantProviderCfg = {
//           ...(providerStaticCfg ?? {}),
//           ...((tenantCfg.providers && tenantCfg.providers[name]) ?? {}),
//         };

//         if ((provider as any).getPaymentStatus) {
//           return await (provider as any).getPaymentStatus(mergedTenantProviderCfg, paymentId);
//         }

//         if (provider.sendRequest) {
//           const req: CanonicalRequest = {
//             method: "GET",
//             endpoint: `/payments/${paymentId}`,
//           };
//           return await provider.sendRequest(mergedTenantProviderCfg, req);
//         }

//         throw new Error(`Provider ${name} does not implement getPaymentStatus or sendRequest`);
//       },
//     };
//   }

//   getAccountInfoProviderWrapper(name: string) {
//     const provider = this.accountInfoProviders.get(name) || this.genericProviders.get(name);
//     if (!provider) return undefined;

//     const registry = this;
//     return {
//       async fetchAccountDetails(tenantId: string, canonicalPayload: any) {
//         const providerStaticCfg = registry.loadProviderStaticConfig(name);
//         const tenantCfg = await registry.configLoader.loadTenantConfig(tenantId);
//         if (!tenantCfg) throw new Error(`Tenant config not found for ${tenantId}`);

//         const mergedTenantProviderCfg = {
//           ...(providerStaticCfg ?? {}),
//           ...((tenantCfg.providers && tenantCfg.providers[name]) ?? {}),
//         };

//         if ((provider as any).fetchAccountDetails) {
//           return await (provider as any).fetchAccountDetails(mergedTenantProviderCfg, canonicalPayload);
//         }

//         if (provider.sendRequest) {
//           const req: CanonicalRequest = {
//             method: "POST",
//             endpoint: "/account-info",
//             body: canonicalPayload,
//           };
//           return await provider.sendRequest(mergedTenantProviderCfg, req);
//         }

//         throw new Error(`Provider ${name} does not implement fetchAccountDetails or sendRequest`);
//       },
//     };
//   }

//   /**
//    * Load static provider config at runtime (from dist/providers/<name>/provider.config.json)
//    */
//   private loadProviderStaticConfig(providerName: string): any | undefined {
//     try {
//       const cfgPath = path.join(this.providersDistDir, providerName, "provider.config.json");
//       if (!fs.existsSync(cfgPath)) return undefined;
//       const raw = fs.readFileSync(cfgPath, "utf8");
//       return JSON.parse(raw);
//     } catch (err) {
//       console.warn(`ProviderRegistry: failed to load static config for ${providerName}`, err);
//       return undefined;
//     }
//   }

//   // legacy getters (for backward compatibility)
//   getPaymentProvider(name: string) {
//     return this.paymentProviders.get(name) || this.genericProviders.get(name);
//   }

//   getAccountInfoProvider(name: string) {
//     return this.accountInfoProviders.get(name) || this.genericProviders.get(name);
//   }

//   listProviders(): string[] {
//     return Array.from(new Set([
//       ...Array.from(this.genericProviders.keys()),
//       ...Array.from(this.paymentProviders.keys()),
//       ...Array.from(this.accountInfoProviders.keys()),
//     ]));
//   }
// }
