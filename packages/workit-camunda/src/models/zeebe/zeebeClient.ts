// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { optional } from 'inversify';
import { Configs, IAPIConfig as IElasticExporterConfig, ZBElasticClient } from 'zeebe-elasticsearch-client';
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
import {
  IWorkflowDefinition,
  IWorkflowDefinitionKey,
  IWorkflowDefinitionRequest,
  IWorkflowProcessIdDefinition
} from '../camunda-n-mq/specs/workflowDefinition';
import { ICCInstrumentationHandler } from '../core/instrumentations/specs/instrumentation';
import { IPayload } from './specs/payload';
import { IWorkflowResponse } from './specs/workflowDeployResponse';
import { IZeebeOptions } from './specs/zeebeOptions';
import { ZeebeMessage } from './zeebeMessage';
// export interface IZeebeClient {
//   [custom: string]: any;
// }

export class ZeebeClient<WorkerInputVariables = any, CustomHeaderShape = any, WorkerOutputVariables = any>
  implements IClient, IWorkflowClient {
  private readonly _client: ZBClient;
  private readonly _exporterClient: ZBElasticClient;
  private _worker: ZBWorker<WorkerInputVariables, CustomHeaderShape, WorkerOutputVariables> | undefined;
  private readonly _config: IZeebeOptions;
  private readonly _exporterConfig: Partial<IElasticExporterConfig> | undefined;
  private readonly _apm: ICCInstrumentationHandler;
  constructor(
    config: IZeebeOptions,
    apm: ICCInstrumentationHandler,
    @optional() client?: ZBClient,
    @optional() exporterConfig?: Partial<IElasticExporterConfig>
  ) {
    this._client = client || new ZBClient(config.baseUrl, config);
    this._apm = apm;
    this._config = config;
    this._exporterConfig = exporterConfig;
    if (!exporterConfig) {
      // tslint:disable-next-line: no-console
      console.log(
        "warning: no exporterConfig has been provided to Zeebe. getWorkflow and getWorkflows methods won't work. "
      );
    }
    this._exporterClient = new ZBElasticClient(new Configs(exporterConfig));
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
    this.validateExporterConfig();
    const result = await this._exporterClient.getWorkflows({});
    const data = result.data.hits.hits.map(doc => {
      const workflow = doc._source;
      return {
        bpmnProcessId: workflow.bpmnProcessId,
        version: workflow.version,
        workflowKey: workflow.key.toString(),
        resourceName: workflow.resourceName
      };
    });

    return {
      workflows: data
    };
  }
  public async getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition> {
    this.validateExporterConfig();
    this.validateObject();
    const key = Number((payload as IWorkflowDefinitionKey).workflowKey);
    const response = await this._exporterClient.getWorkflows({
      key: !isNaN(key) ? key : undefined,
      bpmnProcessId: (payload as IWorkflowProcessIdDefinition).bpmnProcessId,
      version: (payload as IWorkflowProcessIdDefinition).version,
      latestVersion: typeof (payload as IWorkflowProcessIdDefinition).version !== 'number'
    });

    const data = response.data.hits.hits[0];

    if (!data) {
      throw new Error('Not found');
    }

    const doc = data._source;

    return {
      version: doc.version,
      resourceName: doc.resourceName,
      bpmnXml: doc.bpmnXml,
      workflowKey: doc.key.toString(),
      bpmnProcessId: doc.bpmnProcessId
    };
  }
  public updateVariables<T = any>(model: IUpdateWorkflowVariables<Partial<T>>): Promise<void> {
    return this._client.setVariables<T>({
      elementInstanceKey: model.processInstanceId,
      variables: model.variables,
      local: !!model.local
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
      variables: payload.variables,
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

  private validateExporterConfig() {
    if (!this._exporterConfig) {
      throw new Error(`
      Please, refer to the warning when you instiate this class. You must pass exporterConfig to the Ctor in order to use this method.
      For now, we are only compatible with elastic indexes that operate produce. If you use different indexes or different exporter, please raise an issue.
      `);
    }
  }
  private validateObject() {
    if (!this._exporterConfig) {
      throw new Error(`
        Object passed to the method can't be undefined
      `);
    }
  }
}
