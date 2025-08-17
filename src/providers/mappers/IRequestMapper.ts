export interface IRequestMapper {
  toProviderRequest(canonical: any, tenantCfg?: any): Promise<any> | any;
}
