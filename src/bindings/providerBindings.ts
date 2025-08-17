// Optional: a module to programmatically register compiled provider modules into the DI container
import container from '../container';
import { ProviderRegistry } from '../providers/registry';

export function bindProvidersToContainer() {
  const registry = container.get(ProviderRegistry);
  // Example usage: iterate domains and providers, and bind provider ctors to container if desired
  // for (const domain of ['payments']) {
  //   for (const providerName of registry.listProviders(domain)) {
  //     const ctor = registry.resolveProviderCtor(domain, providerName);
  //     container.bind(`Provider:${domain}:${providerName}`).toConstructor(ctor as any);
  //   }
  // }
}