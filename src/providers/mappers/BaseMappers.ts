import { IRequestMapper } from "./IRequestMapper";
import { IResponseMapper } from "./IResponseMapper";
import { IErrorMapper } from "./IErrorMapper";
import { CanonicalError } from "../../common/errors/CanonicalError";

/**
 * Provide no-op implementations that provider plugins can extend.
 */

export class NoopRequestMapper implements IRequestMapper {
  toProviderRequest(canonical: any) {
    return canonical;
  }
}

export class NoopResponseMapper implements IResponseMapper {
  toCanonical(response: any) {
    return response;
  }
}

export class NoopErrorMapper implements IErrorMapper {
  toCanonical(err: any): CanonicalError {
    return {
      code: err?.code || "ERR_PROVIDER",
      message: err?.message || "Provider error",
      httpStatus: err?.status || 502,
      details: err?.data ?? err,
    };
  }
}
