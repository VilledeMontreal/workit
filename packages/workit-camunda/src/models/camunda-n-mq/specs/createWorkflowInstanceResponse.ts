export interface ICreateWorkflowInstanceResponse {
  workflowKey: string;
  bpmnProcessId: string;
  version: number;
  workflowInstanceKey: string;
}
