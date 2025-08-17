export interface IAccountInfoService {
  fetchAccount(tenantId: string, providerName: string, payload: any): Promise<any>;
}
