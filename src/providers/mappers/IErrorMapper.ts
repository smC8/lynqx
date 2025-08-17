import { CanonicalError } from "../../common/errors/CanonicalError";

export interface IErrorMapper {
  toCanonical(err: any, tenantCfg?: any): CanonicalError;
}
