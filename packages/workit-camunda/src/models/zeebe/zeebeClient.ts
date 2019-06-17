// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { optional } from 'inversify';
import { ZBClient, ZBWorker } from 'zeebe-node';
import { ICamundaService } from '../camunda-n-mq/specs/camundaService';
import { IClient } from '../camunda-n-mq/specs/client';
import { ICreateWorkflowInstance } from '../camunda-n-mq/specs/createWorkflowInstance';
import { ICreateWorkflowInstanceResponse } from '../camunda-n-mq/specs/createWorkflowInstanceResponse';
import { IDeployWorkflowResponse } from '../camunda-n-mq/specs/deployWorkflowResponse';
import { IMessage } from '../camunda-n-mq/specs/message';
import { IPublishMessage } from '../camunda-n-mq/specs/publishMessage';
import { IUpdateWorkflowRetry } from '../camunda-n-mq/specs/updateWorkflowRetry';
import { IUpdateWorkflowVariables } from '../camunda-n-mq/specs/updateWorkflowVariables';
import { IWorkflowClient } from '../camunda-n-mq/specs/workflowClient';
import { IWorkflowDefinition, IWorkflowDefinitionRequest } from '../camunda-n-mq/specs/workflowDefinition';
import { ICCInstrumentationHandler } from '../core/instrumentations/specs/instrumentation';
import { IPayload } from './specs/payload';
import { IZeebeOptions } from './specs/zeebeOptions';
import { ZeebeMessage } from './zeebeMessage';
export interface IZeebeClient {
  [custom: string]: any;
}

export class ZeebeClient implements IClient, IWorkflowClient {
  private readonly _client: ZBClient;
  private _worker: ZBWorker | undefined;
  private readonly _config: IZeebeOptions;
  private readonly _apm: ICCInstrumentationHandler;

  constructor(config: IZeebeOptions, apm: ICCInstrumentationHandler, @optional() client?: ZBClient) {
    this._client = client || new ZBClient(config.baseUrl, config);
    this._apm = apm;
    this._config = config;
  }
  public subscribe(onMessageReceived: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void> {
    this._worker = this._client.createWorker(
      this._config.workerId || 'some-random-id',
      this._config.topicName,
      async (payload: IPayload, complete: (content: IPayload) => void) => {
        const [message, service] = ZeebeMessage.wrap(payload, complete, this._client, this._apm);
        try {
          await onMessageReceived(message, service);
        } catch (error) {
          this._apm.onMessageFailed(error, message);
        } finally {
          this._apm.onMessageSuccess(message);
        }
      },
      this._config
    );
    return Promise.resolve();
  }
  public async deployWorkflow(bpmnPath: string): Promise<IDeployWorkflowResponse> {
    const result = await this._client.deployWorkflow(bpmnPath);
    return {
      workflows: result.workflows,
      key: result.key.toString() // TODO: interface say number but it return string, need to PR to zeebe-node
    };
  }
  public async getWorkflows(): Promise<IWorkflowResponse> {
    return this._client.listWorkflows();
  }
  public async getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition> {
    return this._client.getWorkflow(payload);
  }
  public updateVariables<T = any>(model: IUpdateWorkflowVariables<T>): Promise<void> {
    return this._client.updateWorkflowInstancePayload({
      elementInstanceKey: model.processInstanceId,
      payload: model.variables
    });
  }
  public updateJobRetries(payload: IUpdateWorkflowRetry): Promise<void> {
    return this._client.updateJobRetries(payload);
  }
  /**
   * Publish a message event
   * If you don't specify correlationKey, message will be treated as message start event
   */
  public publishMessage<T>(payload: IPublishMessage<T, string>): Promise<void> {
    return this._client.publishMessage({
      correlationKey: payload.correlation || '__MESSAGE_START_EVENT__',
      payload: payload.variables,
      messageId: payload.messageId,
      timeToLive: payload.timeToLive,
      name: payload.name
    });
  }
  public createWorkflowInstance<T>(model: ICreateWorkflowInstance<T>): Promise<ICreateWorkflowInstanceResponse> {
    return this._client.createWorkflowInstance(model.bpmnProcessId, model.variables, model.version);
  }
  public cancelWorkflowInstance(instanceId: string): Promise<void> {
    return this._client.cancelWorkflowInstance(instanceId);
  }
  public resolveIncident(incidentKey: string): Promise<void> {
    return this._client.resolveIncident(incidentKey);
  }
  public unsubscribe(): Promise<void> {
    if (this._worker) {
      return this._worker.close();
    }
    return Promise.resolve();
  }
}
