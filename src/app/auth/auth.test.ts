import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import net from "net";
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

// Helper function to check if the port is open
const checkConnection = (urlStr: string, timeout = 1500): Promise<boolean> => {
  return new Promise((resolve) => {
    try {
      const url = new URL(urlStr);
      const port = url.port ? parseInt(url.port, 10) : (url.protocol === "https:" ? 443 : 80);
      const host = url.hostname;

      const socket = net.connect(port, host, () => {
        socket.end();
        resolve(true);
      });

      socket.setTimeout(timeout);
      socket.on("timeout", () => {
        socket.destroy();
        resolve(false);
      });

      socket.on("error", () => {
        socket.destroy();
        resolve(false);
      });
    } catch {
      resolve(false);
    }
  });
};

describe("Neon Auth Connection Integration Test", () => {
  const baseUrl = process.env.NEON_AUTH_BASE_URL || "https://ep-lucky-base-apc0016d.neonauth.c-7.us-east-1.aws.neon.tech/neondb/auth";

  it("should check if Neon Auth API is reachable", async () => {
    const isReachable = await checkConnection(baseUrl, 1500);
    console.log(`[Neon Auth Integration Test] Reachability check for ${baseUrl}:`, isReachable ? "ONLINE" : "OFFLINE");
    expect(isReachable).toBe(true);
  });
});

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
