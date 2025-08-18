// export interface IPaymentsService {
//   createPayment(tenantId: string, providerName: string, payload: any): Promise<any>;
//   getPaymentStatus(tenantId: string, providerName: string, paymentId: string): Promise<any>;
// }

import { CanonicalPaymentRequest, CanonicalPaymentResponse } from "./IPaymentProvider";

export interface IPaymentsService {
  createPayment(
    tenantId: string,
    providerName: string,
    payload: CanonicalPaymentRequest
  ): Promise<CanonicalPaymentResponse>;

  getPaymentStatus(
    tenantId: string,
    providerName: string,
    paymentId: string
  ): Promise<CanonicalPaymentResponse>;
}
