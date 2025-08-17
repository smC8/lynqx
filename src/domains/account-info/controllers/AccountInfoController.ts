import { controller, httpPost, request, response } from "inversify-express-utils";
import { Request, Response } from "express";
import { inject } from "inversify";
import { TYPES } from "../../../types";
import { IAccountInfoService } from "../interfaces/IAccountInfoService";

@controller("/account-info")
export class AccountInfoController {
  constructor(@inject(TYPES.IAccountInfoService) private service: IAccountInfoService) {}

  @httpPost("/:providerName")
  public async fetch(@request() req: Request, @response() res: Response) {
    const providerName = req.params.providerName;
    const tenantId = req.headers["x-tenant-id"] as string;
    const payload = req.body;
    if (!tenantId) return res.status(400).json({ error: "Missing x-tenant-id header" });

    const result = await this.service.fetchAccount(tenantId, providerName, payload);
    res.json({ data: result });
  }
}
