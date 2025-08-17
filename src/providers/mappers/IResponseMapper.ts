export interface IResponseMapper {
  toCanonical(response: any, tenantCfg?: any): Promise<any> | any;
}
