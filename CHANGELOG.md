# Changelog

All notable changes to the Authalla SDK will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [1.0.0] - 2025-10-30

### Added

- Initial release of Authalla SDK
- `AuthallaClient` class for interacting with Authalla OAuth2 API
- `updateProfile()` method to update user profile information (name)
- `getProfile()` method to fetch current user profile
- TypeScript support with full type definitions
- Comprehensive error handling with custom error classes:
  - `AuthallaError` - Base error class
  - `AuthallaValidationError` - Validation errors
  - `AuthallaAuthenticationError` - Authentication/token errors
  - `AuthallaNetworkError` - Network-related errors
  - `AuthallaRateLimitError` - Rate limiting errors
- Built-in validation for profile fields (name length, empty values)
- Detailed error messages with OAuth2 error codes
- Complete test suite with vitest
- ESM and CommonJS module support
- Example usage documentation
- TypeScript type definitions

### Features

- Framework-agnostic design (works with vanilla JS, React, Vue, Angular, etc.)
- Secure token handling with Bearer authentication
- Automatic error parsing from API responses
- Full TypeScript support with exported types
- URL validation for baseUrl configuration
- Token validation before making requests

### Security

- HTTPS enforcement (URLs must use https:// scheme)
- Secure Bearer token authentication
- No token storage in SDK (client manages tokens)
- Input validation to prevent malformed requests

[1.0.0]: https://github.com/hequ/authalla-oauth2-server/releases/tag/v1.0.0
