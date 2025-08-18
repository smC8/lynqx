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

export type CanonicalErrorPayload = {
  code: string;
  message: string;
  httpStatus: number;
  provider?: string;
  details?: any;
};

export class CanonicalError extends Error {
  code: string;
  httpStatus: number;
  provider?: string;
  details?: any;

  constructor(payload: CanonicalErrorPayload) {
    super(payload.message);
    this.code = payload.code;
    this.httpStatus = payload.httpStatus;
    this.provider = payload.provider;
    this.details = payload.details;
  }
}


