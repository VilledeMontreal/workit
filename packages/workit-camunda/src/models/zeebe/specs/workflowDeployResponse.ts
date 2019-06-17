interface IWorkflowDeployResponse extends IWorkflowResponse {
  key: string;
}

interface IWorkflow {
  bpmnProcessId: string;
  version: number;
  workflowKey: string;
  resourceName: string;
}

interface IWorkflowResponse {
  workflows: IWorkflow[];
}
