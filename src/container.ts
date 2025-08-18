// src/container.ts
import { Container } from "inversify";
import { ProviderRegistry } from "./providers/registry/ProviderRegistry";

const container = new Container();

// 🔹 Load all plugins at startup
ProviderRegistry.loadProviders();

// export { container };
export default container;


// import { Container } from "inversify";
// import { TYPES } from "./types";
// import { PaymentsService } from "./domains/payments/services/PaymentsService";
// import { IPaymentsService } from "./domains/payments/interfaces/IPaymentsService";
// import { AccountInfoService } from "./domains/account-info/services/AccountInfoService";
// import { IAccountInfoService } from "./domains/account-info/interfaces/IAccountInfoService";
// import { ProviderRegistry } from "./providers/registry";
// import { IProviderRegistry } from "./providers/interfaces/IProviderRegistry";
// import { ConfigLoader } from "./common/config/ConfigLoader";
// import { IConfigLoader } from "./common/config/IConfigLoader";

// // Create container
// const container = new Container({ defaultScope: "Singleton" });

// // Bind services (domain level)
// container.bind<IPaymentsService>(TYPES.IPaymentsService).to(PaymentsService);
// container.bind<IAccountInfoService>(TYPES.IAccountInfoService).to(AccountInfoService);

// // Bind providers registry
// container.bind<IProviderRegistry>(TYPES.IProviderRegistry).to(ProviderRegistry);

// // Bind config loader
// container.bind<IConfigLoader>(TYPES.IConfigLoader).to(ConfigLoader);

// // Note: providers will register themselves into the registry (or registry auto-discovers)

// export default container;
