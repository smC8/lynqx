// README - how to add a provider plugin (summary)
1. Create folder `src/providers/<provider-name>`
2. Export a `providers` object from the folder, e.g.
   ```js
   module.exports = {
     providers: {
       payments: {
         chase: ChasePaymentsProviderCtor
       }
     }
   }
   ```
3. Implement provider class to match `IPaymentProvider` interface and include `init()` to accept tenant config.
4. Add tenant YAML files under `/tenants/<tenantId>.yml` containing provider-specific credentials.