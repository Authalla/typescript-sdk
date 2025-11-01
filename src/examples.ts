/**
 * Example usage of @authalla/sdk
 *
 * This file demonstrates various ways to use the SDK
 */

import {
  AuthallaClient,
  AuthallaValidationError,
  AuthallaAuthenticationError,
  AuthallaNetworkError,
} from "./index";

// ============================================================================
// Example 1: Basic Usage
// ============================================================================

async function basicExample() {
  // Initialize the client
  const client = new AuthallaClient({
    baseUrl: "https://my-tenant.authalla.com",
    accessToken: "eyJhbGciOiJSUzI1NiIs...",
  });

  try {
    // Get current profile
    const profile = await client.getProfile();
    console.log("Current profile:", profile);

    // Update profile
    const updated = await client.updateProfile({
      name: "John Doe",
    });
    console.log("Updated profile:", updated);
  } catch (error) {
    console.error("Error:", error);
  }
}

// ============================================================================
// Example 2: Error Handling
// ============================================================================

async function errorHandlingExample() {
  const client = new AuthallaClient({
    baseUrl: "https://my-tenant.authalla.com",
    accessToken: "some-token",
  });

  try {
    await client.updateProfile({ name: "" }); // Invalid: empty name
  } catch (error) {
    if (error instanceof AuthallaValidationError) {
      console.error("Validation error:", error.message);
      console.error("Error code:", error.code); // 'validation_error'
    } else if (error instanceof AuthallaAuthenticationError) {
      console.error("Auth error:", error.message);

      if (error.code === "invalid_token") {
        // Token expired or invalid - redirect to login
        console.log("Redirecting to login...");
      } else if (error.code === "insufficient_scope") {
        // Token lacks required scope
        console.error("Token needs profile scope");
      }
    } else if (error instanceof AuthallaNetworkError) {
      console.error("Network error:", error.message);
      // Maybe retry or show offline message
    } else {
      console.error("Unknown error:", error);
    }
  }
}

// ============================================================================
// Example 3: Token Management
// ============================================================================

async function tokenManagementExample() {
  const client = new AuthallaClient({
    baseUrl: "https://my-tenant.authalla.com",
    accessToken: "initial-token",
  });

  try {
    await client.updateProfile({ name: "John" });
  } catch (error) {
    if (error instanceof AuthallaAuthenticationError) {
      // Token expired, get a new one
      const newToken = await refreshAccessToken(); // Your token refresh logic

      // Update the client with new token
      client.setAccessToken(newToken);

      // Retry the request
      await client.updateProfile({ name: "John" });
    }
  }
}

// Mock function for example
async function refreshAccessToken(): Promise<string> {
  return "new-token";
}

// ============================================================================
// Example 4: Custom Domain Usage
// ============================================================================

async function customDomainExample() {
  // Using custom domain instead of tenant subdomain
  const client = new AuthallaClient({
    baseUrl: "https://auth.mycompany.com", // Your custom domain
    accessToken: "token",
  });

  const profile = await client.getProfile();
  console.log("Profile from custom domain:", profile);
}

// ============================================================================
// Example 5: Backend Usage (Node.js/Express)
// ============================================================================

// Express route handler example
async function backendExample(req: any, res: any) {
  try {
    const client = new AuthallaClient({
      baseUrl: "https://my-tenant.authalla.com",
      accessToken: req.session.accessToken, // Token from server-side session
    });

    const updated = await client.updateProfile({
      name: req.body.name,
    });

    res.json(updated);
  } catch (error) {
    if (error instanceof AuthallaValidationError) {
      res.status(400).json({ error: error.message });
    } else if (error instanceof AuthallaAuthenticationError) {
      res.status(401).json({ error: "Unauthorized" });
    } else {
      res.status(500).json({ error: "Internal server error" });
    }
  }
}

// ============================================================================
// Example 6: Validation Before Request
// ============================================================================

async function validationExample() {
  const client = new AuthallaClient({
    baseUrl: "https://my-tenant.authalla.com",
    accessToken: "token",
  });

  const name = "  John Doe  ";

  // The SDK automatically trims whitespace
  // But you can do your own validation first
  if (!name.trim()) {
    console.error("Name cannot be empty");
    return;
  }

  if (name.length > 255) {
    console.error("Name is too long");
    return;
  }

  // SDK will also validate, but this gives immediate feedback
  const updated = await client.updateProfile({ name });
  console.log("Updated:", updated);
}

// ============================================================================
// Example 7: Timeout Configuration
// ============================================================================

async function timeoutExample() {
  // Set a custom timeout (default is 30 seconds)
  const client = new AuthallaClient({
    baseUrl: "https://my-tenant.authalla.com",
    accessToken: "token",
    timeout: 10000, // 10 seconds
  });

  try {
    await client.updateProfile({ name: "John" });
  } catch (error) {
    if (error instanceof AuthallaNetworkError) {
      // Could be a timeout
      console.error("Request failed:", error.message);
    }
  }
}

// Export examples for testing
export {
  basicExample,
  errorHandlingExample,
  tokenManagementExample,
  customDomainExample,
  backendExample,
  validationExample,
  timeoutExample,
};
