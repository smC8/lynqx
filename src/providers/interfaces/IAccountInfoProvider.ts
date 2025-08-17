import { IProvider } from "./IProvider";

export interface IAccountInfoProvider extends IProvider {
  fetchAccountDetails?(tenantId: string, request: any, ctx?: any): Promise<any>;
}
