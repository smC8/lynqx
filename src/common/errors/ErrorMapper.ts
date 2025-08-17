import { ProviderError } from './ProviderError';
import { CanonicalError, CanonicalErrorPayload } from './CanonicalError';

// Example: provider-specific mappers can be loaded from provider plugin. This is the generic fallback mapper.
export class ErrorMapper {
  static mapProviderError(err: ProviderError): CanonicalError {
    const payload: CanonicalErrorPayload = {
      code: 'ERR_PROVIDER_UNKNOWN',
      message: err.message || 'Provider error',
      httpStatus: err.statusCode || 502,
      provider: err.providerName,
      details: err.raw,
    };
    return new CanonicalError(payload);
  }
}