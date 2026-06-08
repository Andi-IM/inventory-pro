import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CamundaClient } from "./camunda";

describe("CamundaClient Unit Tests", () => {
  let client: CamundaClient;
  const baseUrl = "http://localhost:8080/engine-rest";
  const testUserId = "user-123";
  const testRoles = ["admin", "peminjam"];

  beforeEach(() => {
    client = new CamundaClient({ baseUrl, userId: testUserId, roles: testRoles });
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchUserTasks", () => {
    it("should enforce identity filtering in search query", async () => {
      const mockRawTasks = [
        {
          id: "task-1",
          name: "Verify Application",
          taskDefinitionKey: "user_task_verify",
          processInstanceId: "proc-instance-123",
          formKey: "application-form",
          created: "2026-06-08T00:00:00.000+0000",
          assignee: testUserId,
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawTasks,
      } as unknown as Response);

      const filter = { active: true };
      const tasks = await client.searchUserTasks(filter);

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...filter,
          orQueries: [
            {
              assignee: testUserId,
            },
            {
              candidateUser: testUserId,
              candidateGroups: testRoles,
              includeAssignedTasks: true,
            },
          ],
        }),
      });

      expect(tasks).toHaveLength(1);
    });

    it("should throw error if userId is missing", async () => {
      const anonymousClient = new CamundaClient({ baseUrl });
      await expect(anonymousClient.searchUserTasks()).rejects.toThrow("Identity Context Missing");
    });
  });

  describe("startProcessInstance", () => {
    it("should inject initiator variable when starting process", async () => {
      const mockResponse = {
        id: "new-proc-inst-id",
        definitionId: "definition-key-1:1:123",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const variables = { amount: 1500 };
      const result = await client.startProcessInstance("loan_process", variables);

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/process-definition/key/loan_process/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables: {
            amount: { value: 1500 },
            initiator: { value: testUserId, type: "String" }
          },
        }),
      });

      expect(result).toEqual({
        processInstanceKey: "new-proc-inst-id",
        id: "new-proc-inst-id",
        definitionId: "definition-key-1:1:123",
      });
    });
  });

  describe("getUserTask", () => {
    it("should allow access if user is assignee", async () => {
      const mockRawTask = {
        id: "task-abc",
        name: "Approve Request",
        taskDefinitionKey: "task_approve",
        processInstanceId: "proc-abc",
        formKey: null,
        created: "2026-06-08T01:00:00.000+0000",
        assignee: testUserId,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      const task = await client.getUserTask("task-abc");
      expect(task.key).toBe("task-abc");
    });

    it("should allow access if user is candidate (via search check)", async () => {
      const mockRawTask = {
        id: "task-unassigned",
        name: "Candidate Task",
        taskDefinitionKey: "task_candidate",
        processInstanceId: "proc-123",
        formKey: null,
        created: "2026-06-08T01:00:00.000+0000",
        assignee: null,
      };

      // First fetch: returns the task details
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      // Second fetch (search check): returns the task in list
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [mockRawTask],
      } as unknown as Response);

      const task = await client.getUserTask("task-unassigned");
      expect(task.key).toBe("task-unassigned");
    });

    it("should deny access if user is not assignee or candidate", async () => {
      const mockRawTask = {
        id: "task-other",
        assignee: "other-user",
      };

      // First fetch: returns the task assigned to someone else
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      // Second fetch (search check): returns empty list (not a candidate)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => [],
      } as unknown as Response);

      await expect(client.getUserTask("task-other")).rejects.toThrow("Unauthorized");
    });
  });

  describe("getTaskVariables", () => {
    it("should fetch and flatten task variables correctly", async () => {
      const mockRawTask = { id: "task-123", assignee: testUserId };
      const mockRawVariables = {
        score: { value: 95, type: "Integer" },
      };

      // Mock getUserTask (fetch #1)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      // Mock variables (fetch #2)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRawVariables,
      } as unknown as Response);

      const variables = await client.getTaskVariables("task-123");

      expect(variables).toEqual({ score: 95 });
    });
  });

  describe("completeUserTask", () => {
    it("should deny completion if task is assigned to someone else", async () => {
      const mockRawTask = {
        id: "task-999",
        assignee: "someone-else",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      await expect(client.completeUserTask("task-999")).rejects.toThrow("Unauthorized");
    });

    it("should allow completion if assigned to current user", async () => {
      const mockRawTask = {
        id: "task-999",
        assignee: testUserId,
      };

      // Mock getUserTask (fetch #1)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      // Mock complete (fetch #2)
      vi.mocked(fetch).mockResolvedValueOnce({
        ok: true,
        status: 204,
      } as unknown as Response);

      await client.completeUserTask("task-999");
      expect(fetch).toHaveBeenCalledTimes(2);
    });
  });

  describe("Error Handling", () => {
    it("should parse and throw rest exception details on request failure", async () => {
      const mockErrorResponse = {
        type: "InvalidRequestException",
        message: "Process definition with key 'unknown' does not exist",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        json: async () => mockErrorResponse,
      } as unknown as Response);

      await expect(
        client.startProcessInstance("unknown")
      ).rejects.toThrow("InvalidRequestException: Process definition with key 'unknown' does not exist");
    });

    it("should fall back to standard HTTP error when response is not JSON", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        json: async () => {
          throw new Error("HTML response");
        },
      } as unknown as Response);

      await expect(client.getUserTask("task-abc")).rejects.toThrow("HTTP Error 500: Internal Server Error");
    });
  });
});
