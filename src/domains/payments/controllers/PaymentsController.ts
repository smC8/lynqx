import { controller, httpPost, request, response, requestParam } from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { TYPES } from "../../../types";
import { IPaymentsService } from "../interfaces/IPaymentsService";

@controller("/payments")
export class PaymentsController {
  constructor(@inject(TYPES.IPaymentsService) private paymentsService: IPaymentsService) {}

  @httpPost("/:providerName")
  public async createPayment(@request() req: Request, @response() res: Response) {
    const providerName = req.params.providerName;
    const tenantId = req.headers["x-tenant-id"] as string;
    const payload = req.body;
    if (!tenantId) return res.status(400).json({ error: "Missing x-tenant-id header" });

    const result = await this.paymentsService.createPayment(tenantId, providerName, payload);
    res.json({ data: result });
  }

  // Example status endpoint
  // GET /api/payments/:providerName/:paymentId
  @httpPost("/:providerName/:paymentId/status")
  public async getStatus(@request() req: Request, @response() res: Response) {
    const providerName = req.params.providerName;
    const tenantId = req.headers["x-tenant-id"] as string;
    const paymentId = req.params.paymentId;
    if (!tenantId) return res.status(400).json({ error: "Missing x-tenant-id header" });

    const result = await this.paymentsService.getPaymentStatus(tenantId, providerName, paymentId);
    res.json({ data: result });
  }
}

//Note: I used httpPost for status for simplicity; adapt to GET if desired (change decorator accordingly).