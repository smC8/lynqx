import { IProvider } from "./IProvider";

export interface IPaymentProvider extends IProvider {
  // Accept canonical payment request and return canonical response
  createPayment?(tenantId: string, request: any, ctx?: any): Promise<any>;
  getPaymentStatus?(tenantId: string, paymentId: string, ctx?: any): Promise<any>;
}
