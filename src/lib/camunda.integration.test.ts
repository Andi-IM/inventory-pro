import { describe, it, expect } from "vitest";
import net from "net";
import { CamundaClient } from "./camunda";

// Helper function to check if the port is open before running integration tests
const checkConnection = (urlStr: string, timeout = 1000): Promise<boolean> => {
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

describe("CamundaClient Integration Tests", () => {
  const baseUrl = process.env.CAMUNDA_REST_URL || "http://localhost:8080/engine-rest";
  const client = new CamundaClient({ baseUrl, userId: "test-integration-user" });

  it("should check if Camunda REST API is running and search tasks", async () => {
    const isReachable = await checkConnection(baseUrl, 1000);
    if (!isReachable) {
      console.warn(`[Integration Test] Camunda engine is not running at ${baseUrl}. Skipping integration test...`);
      expect(true).toBe(true);
      return;
    }

    try {
      const tasks = await client.searchUserTasks({ active: true });
      console.log(`[Integration Test] Successfully connected to Camunda engine. Active tasks:`, tasks.length);
      expect(Array.isArray(tasks)).toBe(true);
    } catch (error: unknown) {
      const err = error as Error;
      // Fail the test if there is a real server error instead of a connection error
      throw new Error(`Integration test failed with error: ${err.message}`);
    }
  });
});
