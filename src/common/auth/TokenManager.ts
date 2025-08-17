/**
 * Simple in-memory token manager. Real world: use cache + refresh semantics + secure store
 */
export class TokenManager {
  private cache: Map<string, { token: string; expiresAt: number }> = new Map();

  get(key: string) {
    const item = this.cache.get(key);
    if (!item) return null;
    if (Date.now() > item.expiresAt) {
      this.cache.delete(key);
      return null;
    }
    return item.token;
  }

  set(key: string, token: string, expiresInSeconds: number) {
    const expiresAt = Date.now() + expiresInSeconds * 1000 - 5000; // small skew
    this.cache.set(key, { token, expiresAt });
  }
}
