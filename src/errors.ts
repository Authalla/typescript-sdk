/**
 * Error classes for Authalla SDK
 */

/**
 * Base error class for all Authalla SDK errors
 */
export class AuthallaError extends Error {
  /**
   * OAuth2 error code
   */
  public readonly code: string;

  /**
   * HTTP status code
   */
  public readonly status?: number;

  /**
   * Additional error details
   */
  public readonly details?: unknown;

  constructor(
    message: string,
    code: string,
    status?: number,
    details?: unknown
  ) {
    super(message);
    this.name = "AuthallaError";
    this.code = code;
    this.status = status;
    this.details = details;

    // Maintains proper stack trace for where our error was thrown (only available on V8)
    if (
      typeof Error !== "undefined" &&
      "captureStackTrace" in Error &&
      typeof (Error as { captureStackTrace?: unknown }).captureStackTrace ===
        "function"
    ) {
      (
        Error as {
          captureStackTrace: (error: Error, constructor: unknown) => void;
        }
      ).captureStackTrace(this, AuthallaError);
    }
  }
}

/**
 * Error thrown when validation fails (e.g., empty name, name too long)
 */
export class AuthallaValidationError extends AuthallaError {
  constructor(message: string, details?: unknown) {
    super(message, "validation_error", 400, details);
    this.name = "AuthallaValidationError";
  }
}

/**
 * Error thrown when authentication fails (e.g., invalid token, expired token)
 */
export class AuthallaAuthenticationError extends AuthallaError {
  constructor(
    message: string,
    code: string = "invalid_token",
    status: number = 401,
    details?: unknown
  ) {
    super(message, code, status, details);
    this.name = "AuthallaAuthenticationError";
  }
}

/**
 * Error thrown when network requests fail
 */
export class AuthallaNetworkError extends AuthallaError {
  constructor(message: string, originalError?: unknown) {
    super(message, "network_error", undefined, originalError);
    this.name = "AuthallaNetworkError";
  }
}

/**
 * Error thrown when rate limit is exceeded
 */
export class AuthallaRateLimitError extends AuthallaError {
  constructor(message: string = "Rate limit exceeded") {
    super(message, "rate_limit_exceeded", 429);
    this.name = "AuthallaRateLimitError";
  }
}
