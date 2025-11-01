import { describe, it, expect, beforeEach, vi } from "vitest";
import { AuthallaClient } from "../src/client";
import { AuthallaError, AuthallaAuthenticationError } from "../src/errors";

// Mock fetch globally
global.fetch = vi.fn();

describe("AuthallaClient", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("constructor", () => {
    it("should create a client with valid configuration", () => {
      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "test-token",
      });

      expect(client).toBeInstanceOf(AuthallaClient);
    });

    it("should throw error for invalid baseUrl", () => {
      expect(() => {
        new AuthallaClient({
          baseUrl: "not-a-url",
          accessToken: "test-token",
        });
      }).toThrow("Invalid baseUrl");
    });

    it("should throw error for empty accessToken", () => {
      expect(() => {
        new AuthallaClient({
          baseUrl: "https://tenant123.authalla.com",
          accessToken: "",
        });
      }).toThrow("accessToken is required");
    });
  });

  describe("updateProfile", () => {
    it("should successfully update profile", async () => {
      const mockResponse = {
        sub: "123456789",
        name: "John Doe",
        email: "john@example.com",
        email_verified: true,
        updated_at: "2024-10-30T12:34:56Z",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "test-token",
      });

      const result = await client.updateProfile({ name: "John Doe" });

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://tenant123.authalla.com/oauth2/me",
        {
          method: "PUT",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ name: "John Doe" }),
        }
      );
    });

    it("should throw validation error for empty name", async () => {
      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "test-token",
      });

      await expect(client.updateProfile({ name: "" })).rejects.toThrow(
        "Name cannot be empty"
      );
    });

    it("should throw validation error for name too long", async () => {
      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "test-token",
      });

      const longName = "a".repeat(256);
      await expect(client.updateProfile({ name: longName })).rejects.toThrow(
        "Name cannot exceed 255 characters"
      );
    });

    it("should handle invalid token error", async () => {
      (global.fetch as any).mockResolvedValueOnce({
        ok: false,
        status: 401,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => ({
          error: "invalid_token",
          error_description: "The access token is invalid",
        }),
      });

      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "invalid-token",
      });

      await expect(client.updateProfile({ name: "John Doe" })).rejects.toThrow(
        AuthallaAuthenticationError
      );
    });

    it("should handle network errors", async () => {
      (global.fetch as any).mockRejectedValueOnce(new Error("Network error"));

      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "test-token",
      });

      await expect(client.updateProfile({ name: "John Doe" })).rejects.toThrow(
        AuthallaError
      );
    });
  });

  describe("getProfile", () => {
    it("should successfully get profile", async () => {
      const mockResponse = {
        sub: "123456789",
        name: "John Doe",
        email: "john@example.com",
        email_verified: true,
        updated_at: "2024-10-30T12:34:56Z",
      };

      (global.fetch as any).mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Headers({ "content-type": "application/json" }),
        json: async () => mockResponse,
      });

      const client = new AuthallaClient({
        baseUrl: "https://tenant123.authalla.com",
        accessToken: "test-token",
      });

      const result = await client.getProfile();

      expect(result).toEqual(mockResponse);
      expect(global.fetch).toHaveBeenCalledWith(
        "https://tenant123.authalla.com/oauth2/userinfo",
        {
          method: "GET",
          headers: {
            Accept: "application/json",
            Authorization: "Bearer test-token",
            "Content-Type": "application/json",
          },
        }
      );
    });
  });
});
