import "reflect-metadata";
import express from "express";
import bodyParser from "body-parser";
import container from "./container";
import { InversifyExpressServer } from "inversify-express-utils";
import { errorMiddleware } from "./common/errors/ErrorMiddleware";
import { correlationMiddleware } from "./common/observability/correlation";
import "./domains/payments/controllers/PaymentsController"; // controller decorators registration
import "./domains/account-info/controllers/AccountInfoController";
import { ProviderRegistry } from "./providers/registry"; // or TYPES bound registry

async function bootstrap() {
  const server = new InversifyExpressServer(container, null, { rootPath: "/api" });

  server.setConfig((app) => {
    app.use(bodyParser.json());
    app.use(correlationMiddleware);
    // TODO: add request logging middleware
  });

  server.setErrorConfig((app) => {
    app.use(errorMiddleware);
  });

  const app = server.build();

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    // eslint-disable-next-line no-console
    console.log(`Server listening on port ${port}`);
  });
}

bootstrap().catch((err) => {
  // eslint-disable-next-line no-console
  console.error("Failed to bootstrap app", err);
  process.exit(1);
});
