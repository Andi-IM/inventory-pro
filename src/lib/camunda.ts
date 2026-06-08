// ADR: Adopt Camunda 7 REST Client & Identity-Bound Integration
// See: docs/decisions/0003-adopt-camunda-7-rest-client.md
// See: docs/decisions/0007-enforce-identity-bound-workflow-integration.md

import { 
  Task, 
  ProcessInstance, 
  SearchTasksFilter, 
  CamundaTaskResponse, 
  CamundaVariableValue 
} from "../types/camunda";

export class CamundaClient {
  private baseUrl: string;
  private userId?: string;
  private roles: string[];

  constructor(options: { baseUrl?: string; userId?: string; roles?: string[] } = {}) {
    this.baseUrl = options.baseUrl || process.env.CAMUNDA_REST_URL || "http://localhost:8080/engine-rest";
    this.userId = options.userId;
    this.roles = options.roles || [];

    // Strip trailing slash if present
    if (this.baseUrl.endsWith("/")) {
      this.baseUrl = this.baseUrl.slice(0, -1);
    }
  }

  /**
   * Helper method to perform HTTP requests
   */
  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = {
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorMsg = `HTTP Error ${response.status}: ${response.statusText}`;
      try {
        const errBody = await response.json();
        if (errBody && errBody.message) {
          errorMsg = `${errBody.type || "RestException"}: ${errBody.message}`;
        }
      } catch {
        // Fall back to HTTP status text if response is not JSON
      }
      throw new Error(errorMsg);
    }

    if (response.status === 204) {
      return {} as T;
    }

    return response.json() as Promise<T>;
  }

  /**
   * Serialize simple variables to Camunda's object format
   */
  private serializeVariables(variables?: Record<string, unknown>): Record<string, CamundaVariableValue> | undefined {
    if (!variables || Object.keys(variables).length === 0) {
      return undefined;
    }

    const serialized: Record<string, CamundaVariableValue> = {};
    for (const [key, value] of Object.entries(variables)) {
      serialized[key] = { value };
    }
    return serialized;
  }

  /**
   * Flatten Camunda's typed variables to a simple key-value object
   */
  private flattenVariables(rawVariables: Record<string, CamundaVariableValue>): Record<string, unknown> {
    const flattened: Record<string, unknown> = {};
    if (!rawVariables) {
      return flattened;
    }

    for (const [key, valObj] of Object.entries(rawVariables)) {
      flattened[key] = valObj ? valObj.value : null;
    }
    return flattened;
  }

  /**
   * Maps Camunda task format to the application schema
   */
  private mapTask(raw: CamundaTaskResponse): Task {
    return {
      key: raw.id,
      userTaskKey: raw.id,
      name: raw.name,
      elementId: raw.taskDefinitionKey,
      processInstanceKey: raw.processInstanceId,
      formKey: raw.formKey,
      externalFormReference: raw.formKey,
      creationDate: raw.created,
      creationTime: raw.created,
      assignee: raw.assignee,
    };
  }

  /**
   * Search for active user tasks with identity enforcement
   */
  async searchUserTasks(filter: SearchTasksFilter = {}): Promise<Task[]> {
    if (!this.userId) {
      throw new Error("Identity Context Missing: userId is required for searching tasks.");
    }

    // Enforce that the user can only see tasks where they are the assignee or a candidate
    // This uses a complex query to include both direct assignments and group memberships
    const identityFilter = {
      ...filter,
      orQueries: [
        ...(filter.orQueries || []),
        {
          assignee: this.userId
        },
        {
          candidateUser: this.userId,
          candidateGroups: this.roles.length > 0 ? this.roles : undefined,
          includeAssignedTasks: true
        }
      ]
    };

    const rawTasks = await this.request<CamundaTaskResponse[]>("/task", {
      method: "POST",
      body: JSON.stringify(identityFilter),
    });

    return Array.isArray(rawTasks) ? rawTasks.map(task => this.mapTask(task)) : [];
  }

  /**
   * Start a process instance by process definition key
   */
  async startProcessInstance(processDefinitionKey: string, variables: Record<string, unknown> = {}): Promise<ProcessInstance> {
    const payload = {
      variables: {
        ...this.serializeVariables(variables),
        // Automatically inject the initiator identity
        initiator: { value: this.userId, type: "String" }
      }
    };

    const raw = await this.request<{ id: string; definitionId: string }>(
      `/process-definition/key/${processDefinitionKey}/start`,
      {
        method: "POST",
        body: JSON.stringify(payload),
      }
    );

    return {
      processInstanceKey: raw.id,
      id: raw.id,
      definitionId: raw.definitionId,
    };
  }

  /**
   * Get task details with identity verification
   */
  async getUserTask(taskKey: string): Promise<Task> {
    const task = await this.request<CamundaTaskResponse>(`/task/${taskKey}`, {
      method: "GET",
    });

    // Verification: Ensure the user is allowed to see this specific task
    if (this.userId && task.assignee !== this.userId) {
      // If not assigned, check candidate status (this is simplified, ideally 
      // we'd use a more robust check if Camunda's GET /task/{id} doesn't enforce this)
      const candidateCheck = await this.searchUserTasks({ taskId: taskKey });
      if (candidateCheck.length === 0) {
        throw new Error("Unauthorized: You do not have access to this task.");
      }
    }

    return this.mapTask(task);
  }

  /**
   * Get variables for a specific task - inherits identity check from getUserTask
   */
  async getTaskVariables(taskKey: string): Promise<Record<string, unknown>> {
    // First verify task access
    await this.getUserTask(taskKey);

    const raw = await this.request<Record<string, CamundaVariableValue>>(`/task/${taskKey}/variables`, {
      method: "GET",
    });
    return this.flattenVariables(raw);
  }

  /**
   * Complete a user task with identity verification
   */
  async completeUserTask(taskKey: string, variables: Record<string, unknown> = {}): Promise<void> {
    // Verify the user is authorized for this task before completing
    const task = await this.getUserTask(taskKey);

    if (task.assignee && task.assignee !== this.userId) {
      throw new Error(`Unauthorized: Task is assigned to ${task.assignee}, but you are ${this.userId}.`);
    }

    const payload = {
      variables: this.serializeVariables(variables)
    };

    await this.request<void>(`/task/${taskKey}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
