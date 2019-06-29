import { ICreateWorkflowInstance } from './createWorkflowInstance';
import { ICreateWorkflowInstanceResponse } from './createWorkflowInstanceResponse';
import { IDeployWorkflowResponse } from './deployWorkflowResponse';
import { IPublishMessage } from './publishMessage';
import { IUpdateWorkflowRetry } from './updateWorkflowRetry';
import { IUpdateWorkflowVariables } from './updateWorkflowVariables';
import { IWorkflowDefinition, IWorkflowDefinitionRequest } from './workflowDefinition';
import { IWorkflowResponse } from './workflowResponse';

export interface IWorkflowClient {
  deployWorkflow(absPath: string): Promise<Readonly<IDeployWorkflowResponse>>;
  getWorkflows(): Promise<Readonly<IWorkflowResponse>>;
  updateVariables(payload: IUpdateWorkflowVariables): Promise<void>;
  updateJobRetries(payload: IUpdateWorkflowRetry): Promise<void>;
  publishMessage<T = any>(payload: IPublishMessage<T, any>): Promise<void>;
  cancelWorkflowInstance(instance: number | string): Promise<void>;
  createWorkflowInstance<T>(payload: ICreateWorkflowInstance<T>): Promise<ICreateWorkflowInstanceResponse>;
  resolveIncident(incidentKey: string): Promise<void>;
  getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition>;
}
