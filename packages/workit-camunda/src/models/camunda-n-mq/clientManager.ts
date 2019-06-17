// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import debug = require('debug');
import { injectable, unmanaged } from 'inversify';
import 'reflect-metadata';
import { ICreateWorkflowInstance } from './specs/createWorkflowInstance';
import { ICreateWorkflowInstanceResponse } from './specs/createWorkflowInstanceResponse';
import { IDeployWorkflowResponse } from './specs/deployWorkflowResponse';
import { IPublishMessage } from './specs/publishMessage';
import { IUpdateWorkflowRetry } from './specs/updateWorkflowRetry';
import { IUpdateWorkflowVariables } from './specs/updateWorkflowVariables';
import { IWorkflowClient } from './specs/workflowClient';
import { IWorkflowDefinition, IWorkflowDefinitionRequest } from './specs/workflowDefinition';
import { IWorkflowResponse } from './specs/workflowResponse';

const log = debug('workit:clientManager');
@injectable()
export abstract class ClientManager<TClient extends IWorkflowClient> implements IWorkflowClient {
  protected readonly _client: TClient;
  constructor(@unmanaged() client: TClient) {
    this._client = client;
  }
  public deployWorkflow(bpmnPath: string): Promise<IDeployWorkflowResponse> {
    log(`Deploying workflow from path: "${bpmnPath}"`);
    return this._client.deployWorkflow(bpmnPath);
  }
  public getWorkflows(): Promise<IWorkflowResponse> {
    log(`Getting workflows`);
    return this._client.getWorkflows();
  }
  public getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition> {
    return this._client.getWorkflow(payload);
  }
  /**
   * Notice that you cannot pass "File" in variables for now.
   */
  public updateVariables(payload: IUpdateWorkflowVariables): Promise<void> {
    return this._client.updateVariables(payload);
  }
  public async updateJobRetries(payload: IUpdateWorkflowRetry): Promise<void> {
    await this._client.updateJobRetries(payload);
  }
  public publishMessage<T, K>(payload: IPublishMessage<T, K>): Promise<void> {
    return this._client.publishMessage(payload);
  }
  public createWorkflowInstance<T>(model: ICreateWorkflowInstance<T>): Promise<ICreateWorkflowInstanceResponse> {
    return this._client.createWorkflowInstance(model);
  }
  public resolveIncident(incidentKey: string): Promise<void> {
    return this._client.resolveIncident(incidentKey);
  }
  public cancelWorkflowInstance(instanceId: string): Promise<void> {
    return this._client.cancelWorkflowInstance(instanceId);
  }
}
