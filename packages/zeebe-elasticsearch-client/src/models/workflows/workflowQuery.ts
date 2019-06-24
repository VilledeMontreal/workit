export interface IWorkflowQuery {
  key: number;
  version: number;
  /**
   * This is like processDefinitionKey in Camunda BPMN
   */
  bpmnProcessId: string;
  /**
   * Only include those workflows that are latest versions. Value may only be true, as false is the default behavior.
   */
  latestVersion: boolean;
}
