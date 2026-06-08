import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { CamundaClient } from "./camunda";

describe("CamundaClient Unit Tests", () => {
  let client: CamundaClient;
  const baseUrl = "http://localhost:8080/engine-rest";

  beforeEach(() => {
    client = new CamundaClient(baseUrl);
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("searchUserTasks", () => {
    it("should search and map active user tasks correctly", async () => {
      const mockRawTasks = [
        {
          id: "task-1",
          name: "Verify Application",
          taskDefinitionKey: "user_task_verify",
          processInstanceId: "proc-instance-123",
          formKey: "application-form",
          created: "2026-06-08T00:00:00.000+0000",
          assignee: "john_doe",
        },
      ];

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawTasks,
      } as unknown as Response);

      const filter = { active: true, assignee: "john_doe" };
      const tasks = await client.searchUserTasks(filter);

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/task`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(filter),
      });

      expect(tasks).toHaveLength(1);
      expect(tasks[0]).toEqual({
        key: "task-1",
        userTaskKey: "task-1",
        name: "Verify Application",
        elementId: "user_task_verify",
        processInstanceKey: "proc-instance-123",
        formKey: "application-form",
        externalFormReference: "application-form",
        creationDate: "2026-06-08T00:00:00.000+0000",
        creationTime: "2026-06-08T00:00:00.000+0000",
        assignee: "john_doe",
      });
    });
  });

  describe("startProcessInstance", () => {
    it("should start a process instance and serialize variables", async () => {
      const mockResponse = {
        id: "new-proc-inst-id",
        definitionId: "definition-key-1:1:123",
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockResponse,
      } as unknown as Response);

      const variables = { amount: 1500, applicant: "Alice" };
      const result = await client.startProcessInstance("loan_process", variables);

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/process-definition/key/loan_process/start`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables: {
            amount: { value: 1500 },
            applicant: { value: "Alice" },
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
    it("should fetch details of a specific user task", async () => {
      const mockRawTask = {
        id: "task-abc",
        name: "Approve Request",
        taskDefinitionKey: "task_approve",
        processInstanceId: "proc-abc",
        formKey: null,
        created: "2026-06-08T01:00:00.000+0000",
        assignee: null,
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawTask,
      } as unknown as Response);

      const task = await client.getUserTask("task-abc");

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/task/task-abc`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(task.key).toBe("task-abc");
      expect(task.name).toBe("Approve Request");
    });
  });

  describe("getTaskVariables", () => {
    it("should fetch and flatten task variables correctly", async () => {
      const mockRawVariables = {
        score: { value: 95, type: "Integer" },
        approved: { value: true, type: "Boolean" },
        remarks: { value: "Excellent score", type: "String" },
      };

      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 200,
        json: async () => mockRawVariables,
      } as unknown as Response);

      const variables = await client.getTaskVariables("task-123");

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/task/task-123/variables`, {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      expect(variables).toEqual({
        score: 95,
        approved: true,
        remarks: "Excellent score",
      });
    });
  });

  describe("completeUserTask", () => {
    it("should complete a user task with variables", async () => {
      vi.mocked(fetch).mockResolvedValue({
        ok: true,
        status: 204, // No Content
      } as unknown as Response);

      const completionVars = { managerNotes: "Looks good" };
      await client.completeUserTask("task-999", completionVars);

      expect(fetch).toHaveBeenCalledWith(`${baseUrl}/task/task-999/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          variables: {
            managerNotes: { value: "Looks good" },
          },
        }),
      });
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
