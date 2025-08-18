// import { IPaymentProvider } from "../../domains/payments/interfaces/IPaymentProvider";
// import { CanonicalPaymentRequest, CanonicalPaymentResponse } from "../../domains/payments/interfaces/IPaymentProvider";

// export class MockPaymentProvider implements IPaymentProvider {
//   async createPayment(request: CanonicalPaymentRequest): Promise<CanonicalPaymentResponse> {
//     return {
//       success: true,
//       data: { paymentId: "mock-123", amount: request.amount, currency: request.currency }
//     };
//   }

//   async getPaymentStatus(paymentId: string): Promise<CanonicalPaymentResponse> {
//     return {
//       success: true,
//       data: { paymentId, status: "COMPLETED" }
//     };
//   }
// }
