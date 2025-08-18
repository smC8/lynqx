// // src/domains/payments/services/PaymentsService.ts
// import { injectable } from "inversify";
// import { IPaymentsService } from "../interfaces/IPaymentsService";
// // import { PaymentProviderWrapper } from "../../../providers/PaymentProviderWrapper";
// import { IProviderRegistry } from "../../../providers/interfaces/IProviderRegistry";

// @injectable()
// export class PaymentsService implements IPaymentsService {
//     constructor(
//         private providerRegistry: IProviderRegistry
//     ) { }

//     async createPayment(
//         tenantId: string,
//         providerName: string,
//         payload: any) {
//         const wrapper = this.providerRegistry.getPaymentProviderWrapper(providerName);
//         if (!wrapper) {
//             throw new Error(`Provider ${providerName} not registered`);
//         }
//         return wrapper.createPayment(tenantId, payload);
//     }

//     async getPaymentStatus(
//         tenantId: string,
//         providerName: string,
//         paymentId: string): Promise<any> {
//         // delegate to wrapper
//         const wrapper = this.providerRegistry.getPaymentProviderWrapper(providerName);
//         if (!wrapper) {
//             throw new Error(`Provider ${providerName} not registered`);
//         }        
//         // return wrapper.getPaymentStatus(tenantId, providerName, paymentId);
//         return wrapper.getPaymentStatus(tenantId, paymentId);
//     }
// }
