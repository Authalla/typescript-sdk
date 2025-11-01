/**
 * Authalla SDK - Main client implementation
 */

import {
  AuthallaConfig,
  UserProfile,
  UpdateProfileRequest,
  OAuth2ErrorResponse,
} from "./types";
import {
  AuthallaError,
  AuthallaValidationError,
  AuthallaAuthenticationError,
  AuthallaNetworkError,
  AuthallaRateLimitError,
} from "./errors";
import {
  validateBaseUrl,
  validateAccessToken,
  normalizeBaseUrl,
  timeoutPromise,
} from "./utils";

/**
 * Main client for interacting with Authalla OAuth2 API
 *
 * @example
 * ```typescript
 * const client = new AuthallaClient({
 *   baseUrl: 'https://my-tenant.authalla.com',
 *   accessToken: 'eyJhbGciOiJSUzI1NiIs...'
 * });
 *
 * // Get current user profile
 * const profile = await client.getProfile();
 *
 * // Update user profile
 * const updated = await client.updateProfile({ name: 'John Doe' });
 * ```
 */
export class AuthallaClient {
  private readonly baseUrl: string;
  private accessToken: string;
  private readonly fetchImpl: typeof fetch;
  private readonly timeout: number;

  /**
   * Creates a new AuthallaClient instance
   *
   * @param config - Configuration options
   * @throws {Error} If config is invalid
   */
  constructor(config: AuthallaConfig) {
    validateBaseUrl(config.baseUrl);
    validateAccessToken(config.accessToken);

    this.baseUrl = normalizeBaseUrl(config.baseUrl);
    this.accessToken = config.accessToken;
    // Bind fetch to globalThis to preserve context in browser environments
    this.fetchImpl = config.fetch || globalThis.fetch.bind(globalThis);
    this.timeout = config.timeout || 30000;

    if (!this.fetchImpl) {
      throw new Error(
        "fetch is not available. Please provide a fetch implementation in config.fetch"
      );
    }
  }

  /**
   * Updates the access token
   *
   * @param token - New access token
   * @throws {Error} If token is invalid
   */
  public setAccessToken(token: string): void {
    validateAccessToken(token);
    this.accessToken = token;
  }

  /**
   * Gets the current user's profile information
   *
   * @returns User profile data
   * @throws {AuthallaAuthenticationError} If token is invalid or expired
   * @throws {AuthallaNetworkError} If network request fails
   * @throws {AuthallaError} For other errors
   *
   * @example
   * ```typescript
   * const profile = await client.getProfile();
   * console.log(profile.name); // "John Doe"
   * ```
   */
  public async getProfile(): Promise<UserProfile> {
    return this.request<UserProfile>("GET", "/oauth2/userinfo");
  }

  /**
   * Updates the current user's profile information
   *
   * @param data - Profile data to update
   * @returns Updated user profile
   * @throws {AuthallaValidationError} If validation fails
   * @throws {AuthallaAuthenticationError} If token is invalid or lacks required scope
   * @throws {AuthallaNetworkError} If network request fails
   * @throws {AuthallaError} For other errors
   *
   * @example
   * ```typescript
   * const updated = await client.updateProfile({
   *   name: 'John Doe'
   * });
   * console.log(updated.name); // "John Doe"
   * ```
   */
  public async updateProfile(data: UpdateProfileRequest): Promise<UserProfile> {
    // Client-side validation
    const trimmedName = data.name?.trim();

    if (!trimmedName) {
      throw new AuthallaValidationError("Name cannot be empty");
    }

    if (trimmedName.length > 255) {
      throw new AuthallaValidationError("Name cannot exceed 255 characters");
    }

    return this.request<UserProfile>("PUT", "/oauth2/me", {
      name: trimmedName,
    });
  }

  /**
   * Internal method to make HTTP requests
   */
  private async request<T>(
    method: "GET" | "PUT" | "POST" | "DELETE",
    path: string,
    body?: Record<string, unknown>
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;

    const headers: Record<string, string> = {
      Authorization: `Bearer ${this.accessToken}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    };

    const options: RequestInit = {
      method,
      headers,
    };

    if (body && (method === "PUT" || method === "POST")) {
      options.body = JSON.stringify(body);
    }

    try {
      const response = await timeoutPromise(
        this.fetchImpl(url, options),
        this.timeout
      );

      // Handle non-2xx responses
      if (!response.ok) {
        await this.handleErrorResponse(response);
      }

      // Parse JSON response
      const data = await response.json();
      return data as T;
    } catch (error) {
      // If it's already an Authalla error, rethrow it
      if (error instanceof AuthallaError) {
        throw error;
      }

      // Network or timeout error
      throw new AuthallaNetworkError(
        `Network request failed: ${(error as Error).message}`,
        error
      );
    }
  }

  /**
   * Handles error responses from the API
   */
  private async handleErrorResponse(response: Response): Promise<never> {
    let errorData: OAuth2ErrorResponse | null = null;

    try {
      errorData = await response.json();
    } catch {
      // If we can't parse JSON, use status text
      errorData = {
        error: "unknown_error",
        error_description: response.statusText || "Unknown error occurred",
      };
    }

    const errorCode = errorData?.error || "unknown_error";
    const errorMessage = errorData?.error_description || "An error occurred";
    const details = errorData?.details;

    // Map to appropriate error class based on status code and error code
    switch (response.status) {
      case 400:
        if (errorCode === "validation_error") {
          throw new AuthallaValidationError(errorMessage, details);
        }
        throw new AuthallaError(errorMessage, errorCode, 400, details);

      case 401:
        throw new AuthallaAuthenticationError(
          errorMessage,
          errorCode,
          401,
          details
        );

      case 403:
        if (errorCode === "insufficient_scope") {
          throw new AuthallaAuthenticationError(
            errorMessage,
            errorCode,
            403,
            details
          );
        }
        throw new AuthallaError(errorMessage, errorCode, 403, details);

      case 404:
        throw new AuthallaError(errorMessage, errorCode, 404, details);

      case 429:
        throw new AuthallaRateLimitError(errorMessage);

      case 500:
      case 503:
        throw new AuthallaError(
          errorMessage,
          errorCode,
          response.status,
          details
        );

      default:
        throw new AuthallaError(
          errorMessage,
          errorCode,
          response.status,
          details
        );
    }
  }
}
