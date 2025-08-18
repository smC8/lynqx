// src/domains/payments/controllers/PaymentsController.ts
import {
  controller,
  httpPost,
  httpGet,
  requestBody,
  requestParam,
  queryParam,
} from "inversify-express-utils";
import { inject } from "inversify";
import { IPaymentsService } from "../interfaces/IPaymentsService";
import { TYPES } from "../../../types";

@controller("/payments")
export class PaymentsController {
  constructor(
    @inject(TYPES.IPaymentsService)
    private paymentsService: IPaymentsService
  ) {}

  @httpPost("/")
  async createPayment(
    @queryParam("tenantId") tenantId: string,
    @queryParam("provider") providerName: string,
    @requestBody() payload: any
  ) {
    return await this.paymentsService.createPayment(
      tenantId,
      providerName,
      payload
    );
  }

  @httpGet("/:paymentId")
  async getPaymentStatus(
    @queryParam("tenantId") tenantId: string,
    @queryParam("provider") providerName: string,
    @requestParam("paymentId") paymentId: string
  ) {
    return await this.paymentsService.getPaymentStatus(
      tenantId,
      providerName,
      paymentId
    );
  }
}
