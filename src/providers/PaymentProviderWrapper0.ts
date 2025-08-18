// // src/providers/PaymentProviderWrapper.ts
// import { IPaymentProvider } from "../domains/payments/interfaces/IPaymentProvider";
// import {
//   CanonicalPaymentRequest,
//   CanonicalPaymentResponse,
// } from "../domains/payments/interfaces/IPaymentProvider";
// // import { TenantConfigLoader } from "../tenants/tenantConfigLoader";
// import { ConfigLoader } from "../common/config/ConfigLoader";

// const configLoader = new ConfigLoader();

// export class PaymentProviderWrapper {
//   constructor(
//     private provider: IPaymentProvider,
//     // private tenantConfigLoader: typeof configLoader // TODO check this if it is ok
//   ) {}

//   async createPayment(
//     tenantId: string,
//     payload: any
//   ): Promise<CanonicalPaymentResponse> {
//     // 1) Load tenant config from /tenants/<tenantId>.yml
//     // const tenantConfig = this.tenantConfigLoader.loadTenantConfig(tenantId); // TODO check this if it is ok
//     const tenantConfig = await configLoader.loadTenantConfig(tenantId);
//     if (!tenantConfig) {
//       throw new Error(`No tenant config found for tenant '${tenantId}'`);
//     }

//     // 2) Resolve provider-specific config using provider's class name as key
//     const providerKey = this.provider.constructor.name;
//     const providerConfig = tenantConfig.providers?.[providerKey];
//     if (!providerConfig) {
//       throw new Error(
//         `No provider config found for provider '${providerKey}' for tenant '${tenantId}'`
//       );
//     }

//     // 3) Initialize provider with tenant-specific config
//     await this.provider.init(tenantId, providerConfig);

//     // 4) Map incoming payload → CanonicalPaymentRequest (adjust if your payload differs)
//     const canonicalRequest: CanonicalPaymentRequest = {
//       amount: payload.amount,
//       currency: payload.currency,
//       beneficiaryAccount: payload.account,
//       beneficiaryName: payload.name,
//       remitterAccount: payload.fromAccount,
//       metadata: payload.metadata,
//     };

//     // 5) Delegate to provider
//     return this.provider.makePayment(canonicalRequest);
//   }

//   async getPaymentStatus(
//     tenantId: string,
//     paymentId: string
//   ): Promise<CanonicalPaymentResponse> {
//     // const tenantConfig = this.tenantConfigLoader.load(tenantId);
//     const tenantConfig = await configLoader.loadTenantConfig(tenantId);
//     if (!tenantConfig) {
//       throw new Error(`No tenant config found for tenant '${tenantId}'`);
//     }

//     const providerKey = this.provider.constructor.name;
//     const providerConfig = tenantConfig.providers?.[providerKey];
//     if (!providerConfig) {
//       throw new Error(
//         `No provider config found for provider '${providerKey}' for tenant '${tenantId}'`
//       );
//     }

//     await this.provider.init(tenantId, providerConfig);

//     if (!this.provider.getPaymentStatus) {
//       throw new Error(
//         `Provider '${providerKey}' does not support status checks`
//       );
//     }

//     return this.provider.getPaymentStatus(paymentId);
//   }
// }
