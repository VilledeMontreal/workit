/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { optional } from 'inversify';
import { Configs, IAPIConfig as IElasticExporterConfig, ZBElasticClient } from 'zeebe-elasticsearch-client';
import { ZBClient, ZBWorker } from 'zeebe-node';
// FIXME: dist folder
import { CompleteFn } from 'zeebe-node/dist/lib/interfaces';
import { PaginationUtils } from '../camunda-n-mq/paginationUtils';
import { ICamundaService } from '../camunda-n-mq/specs/camundaService';
import { IClient } from '../camunda-n-mq/specs/client';
import { ICreateWorkflowInstance } from '../camunda-n-mq/specs/createWorkflowInstance';
import { ICreateWorkflowInstanceResponse } from '../camunda-n-mq/specs/createWorkflowInstanceResponse';
import { IDeployWorkflowResponse } from '../camunda-n-mq/specs/deployWorkflowResponse';
import { IMessage } from '../camunda-n-mq/specs/message';
import { IPagination } from '../camunda-n-mq/specs/pagination';
import { IPaginationOptions } from '../camunda-n-mq/specs/paginationOptions';
import { IPublishMessage } from '../camunda-n-mq/specs/publishMessage';
import { IUpdateWorkflowRetry } from '../camunda-n-mq/specs/updateWorkflowRetry';
import { IUpdateWorkflowVariables } from '../camunda-n-mq/specs/updateWorkflowVariables';
import { IWorkflow } from '../camunda-n-mq/specs/workflow';
import { IWorkflowClient } from '../camunda-n-mq/specs/workflowClient';
import {
  IWorkflowDefinition,
  IWorkflowDefinitionKey,
  IWorkflowDefinitionRequest,
  IWorkflowProcessIdDefinition
} from '../camunda-n-mq/specs/workflowDefinition';
import { IWorkflowOptions } from '../camunda-n-mq/specs/workflowOptions';
import { IPayload } from './specs/payload';
import { IZeebeOptions } from './specs/zeebeOptions';
import { ZeebeMessage } from './zeebeMessage';
// export interface IZeebeClient {
//   [custom: string]: any;
// }

export class ZeebeClient<TVariables = any, TProps = any, RVariables = TVariables> implements IClient, IWorkflowClient {
  private readonly _client: ZBClient;
  private readonly _exporterClient: ZBElasticClient;
  private _worker: ZBWorker<TVariables, TProps, RVariables> | undefined;
  private readonly _config: IZeebeOptions;
  private readonly _exporterConfig: Partial<IElasticExporterConfig> | undefined;
  constructor(
    config: IZeebeOptions,
    @optional() client?: ZBClient,
    @optional() exporterConfig?: Partial<IElasticExporterConfig>
  ) {
    this._client = client || new ZBClient(config.baseUrl, config);
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
  public subscribe(
    onMessageReceived: (message: IMessage<TVariables, TProps>, service: ICamundaService) => Promise<void>
  ): Promise<void> {
    this._worker = this._client.createWorker(
      this._config.workerId || 'some-random-id',
      this._config.topicName,
      async (payload: IPayload<TVariables, TProps>, complete: CompleteFn<TVariables>) => {
        const [message, service] = ZeebeMessage.wrap<TVariables, TProps>(payload, complete, this._client);
        await onMessageReceived(message, service);
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
  public async getWorkflows(options?: Partial<IWorkflowOptions & IPaginationOptions>): Promise<IPagination<IWorkflow>> {
    this.validateExporterConfig();
    const params = { _source_excludes: 'bpmnXml' };
    const workflowOptions = { params };
    workflowOptions.params = PaginationUtils.setElasticPaginationParams(params, options);
    const criteria = this.setWorkflowCriteria(options);
    const result = await this._exporterClient.getWorkflows(criteria, workflowOptions);
    const elasticResult = result.data.hits;
    const data = elasticResult.hits.map(doc => {
      const workflow = doc._source;
      return {
        bpmnProcessId: workflow.bpmnProcessId,
        version: workflow.version,
        workflowKey: workflow.key.toString(),
        resourceName: workflow.resourceName
      };
    });

    return {
      paging: PaginationUtils.getPagingFromOptions(elasticResult.total, options),
      items: data
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
  public cancelWorkflowInstance(instance: string): Promise<void> {
    this.validateNumber(instance);
    return this._client.cancelWorkflowInstance(instance as any); // TODO: will be fixed https://github.com/zeebe-io/zeebe/issues/2680
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
  private validateNumber(variable: string) {
    const value = Number(variable);
    if (!Number.isInteger(value)) {
      throw new Error(`
      workflowInstanceKey value is malformed
      `);
    }
  }

  private setWorkflowCriteria(options?: Partial<IWorkflowOptions & IPaginationOptions>) {
    if (!options) {
      return {};
    }
    return { bpmnProcessId: options.bpmnProcessId };
  }
}
