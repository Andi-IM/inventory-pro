import { 
  Task, 
  ProcessInstance, 
  SearchTasksFilter, 
  CamundaTaskResponse, 
  CamundaVariableValue 
} from "../types/camunda";

export class CamundaClient {
  private baseUrl: string;

  constructor(baseUrl?: string) {
    this.baseUrl = baseUrl || process.env.CAMUNDA_REST_URL || "http://localhost:8080/engine-rest";
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
   * Search for active user tasks
   */
  async searchUserTasks(filter: SearchTasksFilter = {}): Promise<Task[]> {
    const rawTasks = await this.request<CamundaTaskResponse[]>("/task", {
      method: "POST",
      body: JSON.stringify(filter),
    });

    return Array.isArray(rawTasks) ? rawTasks.map(task => this.mapTask(task)) : [];
  }

  /**
   * Start a process instance by process definition key
   */
  async startProcessInstance(processDefinitionKey: string, variables: Record<string, unknown> = {}): Promise<ProcessInstance> {
    const payload = {
      variables: this.serializeVariables(variables)
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
   * Get task details
   */
  async getUserTask(taskKey: string): Promise<Task> {
    const raw = await this.request<CamundaTaskResponse>(`/task/${taskKey}`, {
      method: "GET",
    });
    return this.mapTask(raw);
  }

  /**
   * Get variables for a specific task
   */
  async getTaskVariables(taskKey: string): Promise<Record<string, unknown>> {
    const raw = await this.request<Record<string, CamundaVariableValue>>(`/task/${taskKey}/variables`, {
      method: "GET",
    });
    return this.flattenVariables(raw);
  }

  /**
   * Complete a user task with optional variables
   */
  async completeUserTask(taskKey: string, variables: Record<string, unknown> = {}): Promise<void> {
    const payload = {
      variables: this.serializeVariables(variables)
    };

    await this.request<void>(`/task/${taskKey}/complete`, {
      method: "POST",
      body: JSON.stringify(payload),
    });
  }
}
