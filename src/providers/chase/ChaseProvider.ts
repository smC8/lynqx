// src/providers/chase/ChaseProvider.ts
import axios, { AxiosError } from "axios";
import { IProviderPlugin, CanonicalRequest, CanonicalResponse, ProviderError } from "../../types/provider";

interface ChaseTenantConfig {
  baseUrl: string;
  clientId: string;
  clientSecret: string;
  customHeaders?: Record<string, string>;
}

export default class ChaseProvider implements IProviderPlugin {
  public readonly name = "chase";

  /**
   * Example: Map canonical request → Chase API request
   */
  async sendRequest(
    tenantConfig: ChaseTenantConfig,
    request: CanonicalRequest
  ): Promise<CanonicalResponse> {
    try {
      const chaseReq = this.mapRequest(tenantConfig, request);

      const res = await axios(chaseReq);

      return this.mapResponse(res.data);
    } catch (err) {
      throw this.mapError(err);
    }
  }

  /**
   * Map canonical request to Chase API spec
   */
  private mapRequest(
    tenantConfig: ChaseTenantConfig,
    request: CanonicalRequest
  ) {
    const headers = {
      "X-Client-Id": tenantConfig.clientId,
      "X-Client-Secret": tenantConfig.clientSecret,
      ...tenantConfig.customHeaders,
    };

    return {
      method: request.method,
      url: `${tenantConfig.baseUrl}${request.endpoint}`,
      headers,
      params: request.query,
      data: request.body,
    };
  }

  /**
   * Normalize Chase response into canonical format
   */
  private mapResponse(data: any): CanonicalResponse {
    return {
      success: true,
      data: {
        transactionId: data?.txnId || null,
        amount: data?.amt || null,
        status: data?.stat || "unknown",
      },
    };
  }

  /**
   * Normalize errors into platform-wide format
   */
  private mapError(error: any): ProviderError {
    if (axios.isAxiosError(error)) {
      const err = error as AxiosError<any>;
      return {
        code: err.response?.status?.toString() || "NETWORK_ERROR",
        message: err.response?.data?.message || err.message,
        provider: this.name,
        raw: err.response?.data,
      };
    }

    return {
      code: "UNKNOWN_ERROR",
      message: (error as Error).message,
      provider: this.name,
      raw: error,
    };
  }
}
