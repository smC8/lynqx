// src/types/provider.ts
export interface CanonicalRequest {
  method: "GET" | "POST" | "PUT" | "DELETE";
  endpoint: string;
  query?: Record<string, any>;
  body?: any;
}

export interface CanonicalResponse {
  success: boolean;
  data: any;
}

export interface ProviderError {
  code: string;
  message: string;
  provider: string;
  raw?: any;
}

export interface IProviderPlugin {
  name: string;
  sendRequest(
    tenantConfig: any,
    request: CanonicalRequest
  ): Promise<CanonicalResponse>;
}
