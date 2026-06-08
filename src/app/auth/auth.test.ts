import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { signUpWithEmail } from "./sign-up/actions";
import { signInWithEmail } from "./sign-in/actions";
import { auth } from "@/lib/auth/server";

// Mock the redirect from next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock the auth object from @/lib/auth/server
vi.mock("@/lib/auth/server", () => ({
  auth: {
    signUp: {
      email: vi.fn(),
    },
    signIn: {
      email: vi.fn(),
    },
    signOut: vi.fn(),
  },
}));

vi.mock("next/headers", () => ({
  cookies: vi.fn(() => ({
    set: vi.fn(),
    get: vi.fn(),
    delete: vi.fn(),
  })),
}));

vi.mock("@/lib/db", () => ({
  prisma: {
    user: {
      findUnique: vi.fn(),
    },
    $queryRawUnsafe: vi.fn(async () => []),
  },
  query: vi.fn(async () => []),
}));

vi.mock("@/lib/auth/authorization", () => ({
  getUserRole: vi.fn(async () => 'peminjam'),
  getUserPermissions: vi.fn(async () => []),
  getRolePermissions: vi.fn(async () => []),
}));

vi.mock("@/lib/auth/jwt", () => ({
  signAuthState: vi.fn(async () => 'mock-jwt-token'),
}));

describe("Auth Server Actions Unit Tests", () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("signUpWithEmail Server Action", () => {
    it("should return error when ALLOW_SIGN_UP feature flag is disabled", async () => {
      vi.stubEnv("NEXT_PUBLIC_ALLOW_SIGN_UP", "false");

      const formData = new FormData();
      formData.append("email", "test@example.com");
      formData.append("name", "Test User");
      formData.append("password", "secret123");

      const result = await signUpWithEmail(null, formData);
      expect(result).toEqual({ error: "Registration is currently disabled." });
      expect(auth.signUp.email).not.toHaveBeenCalled();
    });

    it("should register user when feature flag is enabled", async () => {
      vi.stubEnv("NEXT_PUBLIC_ALLOW_SIGN_UP", "true");
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(auth.signUp.email).mockResolvedValue({ data: { user: { id: "1" } }, error: null } as any);

      const formData = new FormData();
      formData.append("email", "newuser@example.com");
      formData.append("name", "New User");
      formData.append("password", "secretPassword");

      await signUpWithEmail(null, formData);

      expect(auth.signUp.email).toHaveBeenCalledWith({
        email: "newuser@example.com",
        name: "New User",
        password: "secretPassword",
      });
    });

    it("should return error when email is missing", async () => {
      vi.stubEnv("NEXT_PUBLIC_ALLOW_SIGN_UP", "true");

      const formData = new FormData();
      formData.append("name", "New User");
      formData.append("password", "secretPassword");

      const result = await signUpWithEmail(null, formData);
      expect(result).toEqual({ error: "Email address must be provided." });
    });
  });

  describe("signInWithEmail Server Action", () => {
    it("should call sign-in and redirect on success", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(auth.signIn.email).mockResolvedValue({ data: { session: { id: "session-1" } }, error: null } as any);

      const formData = new FormData();
      formData.append("email", "john@example.com");
      formData.append("password", "password123");

      await signInWithEmail(null, formData);

      expect(auth.signIn.email).toHaveBeenCalledWith({
        email: "john@example.com",
        password: "password123",
      });
    });

    it("should return error if sign-in fails", async () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      vi.mocked(auth.signIn.email).mockResolvedValue({ data: null, error: { message: "Invalid credentials" } } as any);

      const formData = new FormData();
      formData.append("email", "john@example.com");
      formData.append("password", "wrongpassword");

      const result = await signInWithEmail(null, formData);
      expect(result).toEqual({ error: "Invalid credentials" });
    });
  });
});
