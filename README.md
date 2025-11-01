# @authalla/sdk

Official JavaScript SDK for Authalla OAuth2 user profile management.

[![npm version](https://img.shields.io/npm/v/@authalla/sdk.svg)](https://www.npmjs.com/package/@authalla/sdk)
[![TypeScript](https://img.shields.io/badge/TypeScript-Ready-blue.svg)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> **⚠️ Early Version Notice**: This is a very early version of the TypeScript SDK and is actively evolving. APIs may change, and new features are being added regularly. We recommend pinning to a specific version in production and checking the changelog for updates.

## Features

- 🔐 **Secure OAuth2 Integration** - Works seamlessly with Authalla's OAuth2 implementation
- 📦 **Lightweight** - Minimal dependencies, ~5KB gzipped
- 🎯 **TypeScript First** - Full type definitions included
- 🌐 **Framework Agnostic** - Works with vanilla JS, React, Angular, or any framework
- ⚡ **Modern** - Uses native fetch API
- 🛡️ **Error Handling** - Comprehensive error types for better debugging

## Installation

```bash
npm install @authalla/sdk
```

```bash
yarn add @authalla/sdk
```

```bash
pnpm add @authalla/sdk
```

## Quick Start

```typescript
import { AuthallaClient } from "@authalla/sdk";

// Initialize the client
const client = new AuthallaClient({
  baseUrl: "https://my-tenant.authalla.com", // or your custom domain
  accessToken: "your-oauth2-access-token",
});

// Get current user profile
const profile = await client.getProfile();
console.log(profile.name); // "John Doe"

// Update user profile
const updated = await client.updateProfile({
  name: "Jane Doe",
});
console.log(updated.name); // "Jane Doe"
```

## Configuration

### Base URL Format

The `baseUrl` should be in one of the following formats:

- **Tenant subdomain**: `https://{tenant_public_id}.authalla.com`
- **Custom domain**: `https://auth.yourdomain.com`

Examples:

```typescript
// Using tenant public ID
const client = new AuthallaClient({
  baseUrl: "https://my-company.authalla.com",
  accessToken: token,
});

// Using custom domain
const client = new AuthallaClient({
  baseUrl: "https://auth.mycompany.com",
  accessToken: token,
});
```

### Configuration Options

```typescript
interface AuthallaConfig {
  /**
   * Base URL of your Authalla instance
   * Format: https://{tenant_public_id}.authalla.com or https://{custom_domain}
   */
  baseUrl: string;

  /**
   * OAuth2 access token with 'profile' scope
   */
  accessToken: string;

  /**
   * Custom fetch implementation (optional, for testing or Node.js)
   * @default globalThis.fetch
   */
  fetch?: typeof fetch;

  /**
   * Request timeout in milliseconds
   * @default 30000 (30 seconds)
   */
  timeout?: number;
}
```

## API Reference

### AuthallaClient

#### Constructor

```typescript
new AuthallaClient(config: AuthallaConfig)
```

Creates a new Authalla client instance.

#### Methods

##### `getProfile(): Promise<UserProfile>`

Fetches the current user's profile information.

**Returns**: Promise that resolves to the user's profile data.

**Throws**:

- `AuthallaAuthenticationError` - If token is invalid or expired
- `AuthallaNetworkError` - If network request fails

**Example**:

```typescript
try {
  const profile = await client.getProfile();
  console.log(profile);
  // {
  //   sub: "user_123456",
  //   name: "John Doe",
  //   email: "john@example.com",
  //   email_verified: true,
  //   updated_at: "2025-10-30T12:34:56Z"
  // }
} catch (error) {
  if (error instanceof AuthallaAuthenticationError) {
    console.error("Token is invalid:", error.message);
  }
}
```

##### `updateProfile(data: UpdateProfileRequest): Promise<UserProfile>`

Updates the current user's profile information.

**Parameters**:

- `data.name` (string, required) - New name for the user
  - Must not be empty
  - Maximum 255 characters
  - Automatically trimmed

**Returns**: Promise that resolves to the updated user profile.

**Throws**:

- `AuthallaValidationError` - If validation fails (empty name, too long)
- `AuthallaAuthenticationError` - If token is invalid or lacks 'profile' scope
- `AuthallaNetworkError` - If network request fails

**Example**:

```typescript
try {
  const updated = await client.updateProfile({
    name: "Jane Smith",
  });
  console.log("Profile updated:", updated.name);
} catch (error) {
  if (error instanceof AuthallaValidationError) {
    console.error("Validation failed:", error.message);
  } else if (error instanceof AuthallaAuthenticationError) {
    if (error.code === "insufficient_scope") {
      console.error("Token lacks required scope");
    }
  }
}
```

##### `setAccessToken(token: string): void`

Updates the access token used for API requests.

**Parameters**:

- `token` (string, required) - New access token

**Example**:

```typescript
// After token refresh
client.setAccessToken(newAccessToken);
```

## Error Handling

The SDK provides typed error classes for better error handling:

### Error Types

- **`AuthallaError`** - Base error class
- **`AuthallaValidationError`** - Validation errors (empty name, too long, etc.)
- **`AuthallaAuthenticationError`** - Authentication errors (invalid token, insufficient scope)
- **`AuthallaNetworkError`** - Network/timeout errors
- **`AuthallaRateLimitError`** - Rate limit exceeded

### Error Properties

All errors include:

- `message` (string) - Human-readable error message
- `code` (string) - OAuth2 error code
- `status` (number) - HTTP status code (if applicable)
- `details` (any) - Additional error details

### Example Error Handling

```typescript
import {
  AuthallaClient,
  AuthallaValidationError,
  AuthallaAuthenticationError,
  AuthallaRateLimitError,
  AuthallaNetworkError,
} from "@authalla/sdk";

try {
  const updated = await client.updateProfile({ name: "" });
} catch (error) {
  if (error instanceof AuthallaValidationError) {
    // Handle validation errors
    console.error("Invalid input:", error.message);
  } else if (error instanceof AuthallaAuthenticationError) {
    // Handle auth errors
    if (error.code === "invalid_token") {
      // Token expired, redirect to login
      window.location.href = "/login";
    } else if (error.code === "insufficient_scope") {
      // Token lacks required scope
      console.error("Need profile scope");
    }
  } else if (error instanceof AuthallaRateLimitError) {
    // Handle rate limiting
    console.error("Too many requests, please try again later");
  } else if (error instanceof AuthallaNetworkError) {
    // Handle network errors
    console.error("Network error:", error.message);
  }
}
```

## Usage Examples

### Backend (Node.js/Express)

**Recommended approach for production applications**

```typescript
import express from "express";
import { AuthallaClient } from "@authalla/sdk";

const app = express();
app.use(express.json());

// Backend endpoint - token stored in session
app.put("/api/profile", async (req, res) => {
  try {
    const client = new AuthallaClient({
      baseUrl: "https://my-tenant.authalla.com",
      accessToken: req.session.accessToken, // Stored server-side
    });

    const updated = await client.updateProfile({
      name: req.body.name,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof AuthallaAuthenticationError) {
      res.status(401).json({ error: "Unauthorized" });
    } else if (error instanceof AuthallaValidationError) {
      res.status(400).json({ error: error.message });
    } else {
      res.status(500).json({ error: "Internal error" });
    }
  }
});
```

### Frontend (React)

```typescript
import { useState } from "react";
import { AuthallaClient, AuthallaValidationError } from "@authalla/sdk";

function ProfileEditor({ accessToken }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const client = new AuthallaClient({
    baseUrl: "https://my-tenant.authalla.com",
    accessToken: accessToken,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const updated = await client.updateProfile({ name });
      alert("Profile updated successfully!");
    } catch (err) {
      if (err instanceof AuthallaValidationError) {
        setError(err.message);
      } else {
        setError("Failed to update profile");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
      />
      {error && <p style={{ color: "red" }}>{error}</p>}
      <button type="submit" disabled={loading}>
        {loading ? "Updating..." : "Update Profile"}
      </button>
    </form>
  );
}
```

## Security Considerations

### Token Storage

**⚠️ IMPORTANT**: How you store access tokens depends on your architecture:

#### Option A: Backend-Backed (MOST SECURE - RECOMMENDED)

- Store tokens server-side (encrypted session, Redis, etc.)
- Use SDK on backend
- Frontend never sees tokens
- ✅ Immune to XSS attacks

#### Option B: SPA with Backend Proxy (RECOMMENDED FOR SPAs)

- Frontend stores only session cookie (HttpOnly, Secure)
- Backend handles all Authalla API calls
- SDK used on backend only
- ✅ Good security

#### Option C: Pure SPA (ACCEPTABLE - CLIENT ASSUMES RISK)

- Store tokens in memory (never localStorage!)
- Use short token lifetimes (5-15 minutes)
- Implement strict CSP
- ⚠️ Vulnerable to XSS attacks
- ⚠️ Client responsible for XSS protection

### Required OAuth2 Scopes

- `profile` - Required for updating user profile
- `email` - Optional, includes email in response

### Token Requirements

The access token must:

- Be a valid OAuth2 access token (not client credentials token)
- Have the `profile` scope
- Not be expired
- Be issued for the correct tenant

## TypeScript Support

The SDK is written in TypeScript and includes full type definitions:

```typescript
import type {
  AuthallaConfig,
  UserProfile,
  UpdateProfileRequest,
  OAuth2ErrorResponse,
} from "@authalla/sdk";

// Full autocomplete and type checking
const config: AuthallaConfig = {
  baseUrl: "https://my-tenant.authalla.com",
  accessToken: token,
  timeout: 10000,
};

const profile: UserProfile = await client.getProfile();
```

## Browser Support

- Chrome/Edge: Latest 2 versions
- Firefox: Latest 2 versions
- Safari: Latest 2 versions
- Node.js: 16.0.0 or higher

Requires native `fetch` API support or a polyfill.

## Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](../CONTRIBUTING.md) for details.

## License

MIT © Authalla

## Support

- 📖 [Documentation](https://docs.authalla.com)
- 💬 [GitHub Issues](https://github.com/Authalla/typescript-sdk)
- 📧 Email: hello@authalla.com
