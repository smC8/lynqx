// export class ProviderError extends Error {
//   public providerName: string;
//   public statusCode?: number;
//   public raw?: any;

//   constructor(providerName: string, message: string, statusCode?: number, raw?: any) {
//     super(message);
//     this.providerName = providerName;
//     this.statusCode = statusCode;
//     this.raw = raw;
//     Object.setPrototypeOf(this, new.target.prototype);
//   }
// }
export class ProviderError extends Error {
  public providerName?: string;
  public statusCode?: number;
  public raw?: any;
  public isCanonicalError?: boolean = false;

  constructor(message: string, opts?: { providerName?: string; statusCode?: number; raw?: any }) {
    super(message);
    this.providerName = opts?.providerName;
    this.statusCode = opts?.statusCode;
    this.raw = opts?.raw;
  }
}
