/**
 * Generic interface that provider implementations can implement.
 * Each domain-specific interface will extend this.
 */
export interface IProvider {
  name: string;
  init?(options?: any): Promise<void>;
}
