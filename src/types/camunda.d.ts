export interface CamundaVariableValue {
  value: unknown;
  type?: string;
}

export interface CamundaTaskResponse {
  id: string;
  name: string;
  taskDefinitionKey: string;
  processInstanceId: string;
  formKey: string | null;
  created: string;
  assignee: string | null;
  owner?: string | null;
  description?: string | null;
  priority?: number;
  processDefinitionId?: string;
  suspended?: boolean;
  tenantId?: string | null;
}

export interface Task {
  key: string;
  userTaskKey: string;
  name: string;
  elementId: string;
  processInstanceKey: string;
  formKey: string | null;
  externalFormReference: string | null;
  creationDate: string;
  creationTime: string;
  assignee: string | null;
}

export interface ProcessInstance {
  processInstanceKey: string;
  id: string;
  definitionId: string;
}

export interface SearchTasksFilter {
  processDefinitionKey?: string;
  active?: boolean;
  assignee?: string;
  candidateGroups?: string[];
  candidateUser?: string;
  orQueries?: SearchTasksFilter[];
  taskId?: string;
}

export interface RestExceptionResponse {
  type: string;
  message: string;
}
