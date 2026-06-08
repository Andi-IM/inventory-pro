import { describe, it, expect } from "vitest";
import net from "net";

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
