export type TenantProviderCredentials = {
  [providerName: string]: {
    clientId?: string;
    clientSecret?: string;
    apiKey?: string;
    headers?: Record<string, string>;
    queryParams?: Record<string, string>;
    other?: Record<string, any>;
  };
};

export type TenantConfig = {
  tenantId: string;
  providers?: TenantProviderCredentials;
  defaults?: {
    timeoutMs?: number;
  };
};

