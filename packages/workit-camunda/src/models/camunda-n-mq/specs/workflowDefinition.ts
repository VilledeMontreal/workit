export interface IWorkflowDefinition extends IWorkflowProcessIdDefinition, IWorkflowDefinitionKey {
  version: number;
  resourceName: string;
  bpmnXml: string;
}

export type IWorkflowDefinitionRequest = IWorkflowProcessIdDefinition | IWorkflowDefinitionKey;

export interface IWorkflowProcessIdDefinition {
  /**
   * Warning: Camunda BPM platform is not compatible with "version" property due to API restriction,
   * please use workflowKey. Because workflowKey includes "version" in Camunda BPM plateform
   */
  version?: number;

  /**
   * See your BPMN process id on your BPMN file
   *
   * Example:
   * - CamundaBPM: "DEMO" not compatible with version property due to API restriction, please use workflowKey
   * - Zeebe: "DEMO" and use version property to target the right workflow version.
   */
  bpmnProcessId: string;
}

export interface IWorkflowDefinitionKey {
  /**
   * Example:
   * - CamundaBPM: "DEMO:2:weqw-qweweqw-fhdjfh-sjjss"
   * - Zeebe: "3211"
   */
  workflowKey: string;
}
