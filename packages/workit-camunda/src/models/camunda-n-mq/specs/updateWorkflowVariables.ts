export interface IUpdateWorkflowVariables<T = any> {
  processInstanceId: string;
  variables: T;
}
