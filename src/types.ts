export const TYPES = {
  // Domain services
  IPaymentsService: Symbol.for("IPaymentsService"),
  IAccountInfoService: Symbol.for("IAccountInfoService"),

  // Provider infra
  IProviderRegistry: Symbol.for("IProviderRegistry"),

  // Config
  IConfigLoader: Symbol.for("IConfigLoader"),
};
