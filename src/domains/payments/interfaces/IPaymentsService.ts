export interface IPaymentsService {
  createPayment(tenantId: string, providerName: string, payload: any): Promise<any>;
  getPaymentStatus(tenantId: string, providerName: string, paymentId: string): Promise<any>;
}
