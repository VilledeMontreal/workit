export interface IPropertiesBase {
  activityId: string;
  jobKey: string;
  processInstanceId: string;
  workflowKey: string;
  workflowInstanceKey: string;
  workflowDefinitionVersion: number;
  bpmnProcessId: string;
  retries: number | null;
  lockExpirationTime: Date;
  topicName: string;
  workerId: string;
  [custom: string]: any;
}
