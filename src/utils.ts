/**
 * Helper utilities for Authalla SDK
 */

/**
 * Validates a base URL format
 */
export function validateBaseUrl(url: string): void {
  if (!url) {
    throw new Error("baseUrl is required");
  }

  try {
    const parsed = new URL(url);
    if (parsed.protocol !== "https:" && parsed.protocol !== "http:") {
      throw new Error(
        "baseUrl must use https:// protocol (or http:// for local development)"
      );
    }
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    throw new Error(`Invalid baseUrl format: ${url}. ${errorMessage}`);
  }
}

/**
 * Validates an access token
 */
export function validateAccessToken(token: string): void {
  if (!token || typeof token !== "string") {
    throw new Error("accessToken is required and must be a string");
  }

  if (token.trim().length === 0) {
    throw new Error("accessToken cannot be empty");
  }
}

/**
 * Creates a timeout promise that rejects after specified milliseconds
 */
export function timeoutPromise<T>(
  promise: Promise<T>,
  timeoutMs: number
): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) =>
      setTimeout(
        () => reject(new Error(`Request timeout after ${timeoutMs}ms`)),
        timeoutMs
      )
    ),
  ]);
}

/**
 * Normalizes base URL by removing trailing slash
 */
export function normalizeBaseUrl(url: string): string {
  return url.endsWith("/") ? url.slice(0, -1) : url;
}
