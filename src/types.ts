/**
 * TypeScript type definitions for Authalla SDK
 */

/**
 * Configuration options for AuthallaClient
 */
export interface AuthallaConfig {
  /**
   * Base URL of the Authalla instance
   * Format: https://{tenant_public_id}.authalla.com or https://{custom_domain}.authalla.com
   * @example "https://my-tenant.authalla.com"
   * @example "https://auth.mycompany.com"
   */
  baseUrl: string;

  /**
   * OAuth2 access token for authentication
   * Must have the 'profile' scope to update user information
   */
  accessToken: string;

  /**
   * Custom fetch implementation (for testing or Node.js environments)
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
}

/**
 * User profile information returned from Authalla API
 */
export interface UserProfile {
  /** Unique identifier for the user (public ID) */
  sub: string;

  /** User's full name */
  name: string;

  /** User's email address (included if 'email' scope was granted) */
  email?: string;

  /** Whether the user's email has been verified (included if 'email' scope was granted) */
  email_verified?: boolean;

  /** ISO 8601 timestamp of when the profile was last updated */
  updated_at?: string;

  /** URL to user's profile picture (future) */
  picture?: string;
}

/**
 * Request payload for updating user profile
 */
export interface UpdateProfileRequest {
  /**
   * New name for the user
   * - Must not be empty or whitespace-only
   * - Maximum length: 255 characters
   * - Will be automatically trimmed
   */
  name: string;
}

/**
 * Standard OAuth2 error response
 */
export interface OAuth2ErrorResponse {
  /** Error code following OAuth2 error code conventions */
  error: string;

  /** Human-readable description of the error */
  error_description?: string;

  /** URI to documentation about this error */
  error_uri?: string;

  /** Additional error details (validation errors, etc.) */
  details?: any;
}
