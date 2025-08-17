// src/domains/payments/routes.ts
import { Router } from "express";
import { ProviderRegistry } from "../../providers/ProviderRegistry";
import { CanonicalRequest } from "../../types/provider";

const router = Router();
const registry = new ProviderRegistry(`${__dirname}/../../providers`);

// load once at app start
registry.loadProviders();

router.post("/:provider/payments", async (req, res) => {
  const { provider } = req.params;
  const providerPlugin = registry.getProvider(provider);

  if (!providerPlugin) {
    return res.status(404).json({ error: "Provider not found" });
  }

  try {
    const tenantConfig = req.body.tenantConfig; // normally loaded from DB
    const canonicalRequest: CanonicalRequest = {
      method: "POST",
      endpoint: "/payments/initiate",
      body: req.body.payment,
    };

    const response = await providerPlugin.sendRequest(
      tenantConfig,
      canonicalRequest
    );

    res.json(response);
  } catch (err: any) {
    res.status(500).json(err);
  }
});

export default router;
