import { IProviderPlugin } from "../../interfaces/IProviderPlugin";
import { ChasePaymentAdapter } from "./paymentAdapter";
// (optionally) import ChaseAccountInfoAdapter

export const ChasePlugin: IProviderPlugin = {
  name: "chase",
  payment: new ChasePaymentAdapter(),
  // accountInfo: new ChaseAccountInfoAdapter(),
};
