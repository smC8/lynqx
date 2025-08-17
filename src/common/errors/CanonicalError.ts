// export interface CanonicalErrorPayload {
//   code: string; // machine code e.g., ERR_RATE_LIMIT
//   message: string; // human readable
//   httpStatus?: number; // optional
//   provider?: string;
//   details?: any;
// }

// export class CanonicalError extends Error {
//   public payload: CanonicalErrorPayload;

//   constructor(payload: CanonicalErrorPayload) {
//     super(payload.message);
//     this.payload = payload;
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }
export type CanonicalError = {
  code: string; // machine code e.g. ERR_RATE_LIMIT
  message: string; // human message
  provider?: string;
  httpStatus?: number;
  details?: any;
};
