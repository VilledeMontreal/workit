/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IHttpResponse } from '../http/httpResponse';
import { IBpmn, IBpmnDeployResponse } from './bpmnDeployResponse';
import { ICamundaBpmCreateInstanceResponse } from './camundaBpmCreateInstanceResponse';
import { IProcessDefinition } from './processDefinition';
import { IProcessXmlDefinition } from './processXmlDefinition';

export interface ICamundaRepository {
  deployWorkflow(deployName: string, absPath: string): Promise<IHttpResponse<IBpmnDeployResponse>>;
  getWorkflows(options?: { params: Record<string, unknown> }): Promise<IHttpResponse<IBpmn[]>>;
  getWorkflowCount(options?: { params: Record<string, unknown> }): Promise<IHttpResponse<{ count: number }>>;
  getWorkflow(idOrKey: string): Promise<IProcessDefinition & IProcessXmlDefinition>;
  updateVariables<T = any>(processInstanceId: string, variables: T): Promise<IHttpResponse<void>>;
  updateJobRetries(id: string, retries: number): Promise<IHttpResponse<void>>;
  createWorkflowInstance<T = any>(
    idOrKey: string,
    variables: T
  ): Promise<IHttpResponse<ICamundaBpmCreateInstanceResponse>>;
  publishMessage<T = any, K = any>({
    messageName,
    processInstanceId,
    variables,
    correlationKeys,
  }: {
    messageName: string;
    processInstanceId: string;
    variables: T;
    correlationKeys: K;
  }): Promise<void>;
  resolveIncident(incidentKey: string): Promise<void>;
  cancelWorkflowInstance(id: string): Promise<void>;
}
