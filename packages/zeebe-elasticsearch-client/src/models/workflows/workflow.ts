export interface IWorkflow {
  id: string;
  key: number;
  partitionId: number;
  name: string;
  version: number;
  bpmnProcessId: string;
  bpmnXml: string;
  resourceName: string;
}
