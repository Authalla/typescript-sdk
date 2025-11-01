/**
 * Authalla JavaScript SDK
 *
 * Official SDK for interacting with Authalla OAuth2 user profile management API.
 *
 * @packageDocumentation
 */

// Export main client
export { AuthallaClient } from "./client";

// Export types
export type {
  AuthallaConfig,
  UserProfile,
  UpdateProfileRequest,
  OAuth2ErrorResponse,
} from "./types";

// Export errors
export {
  AuthallaError,
  AuthallaValidationError,
  AuthallaAuthenticationError,
  AuthallaNetworkError,
  AuthallaRateLimitError,
} from "./errors";
