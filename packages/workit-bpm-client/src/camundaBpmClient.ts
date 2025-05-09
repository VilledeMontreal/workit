/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IoC, NOOP_LOGGER, PluginLoader, SERVICE_IDENTIFIER } from '@villedemontreal/workit-core';
import {
  IBpmn,
  ICamundaClient,
  ICamundaConfig,
  ICamundaRepository,
  ICamundaService,
  IClient,
  ICreateWorkflowInstance,
  ICreateWorkflowInstanceResponse,
  IDeployWorkflowResponse,
  IHttpResponse,
  ILogger,
  IMessage,
  IPagination,
  IPaginationOptions,
  IPublishMessage,
  ITopicSubscription,
  IUpdateWorkflowRetry,
  IUpdateWorkflowVariables,
  IVariablePayload,
  IWorkflow,
  IWorkflowClient,
  IWorkflowDefinition,
  IWorkflowDefinitionRequest,
  IWorkflowOptions,
  IWorkflowProcessIdDefinition,
} from '@villedemontreal/workit-types';
import { CamundaMessage } from './camundaMessage';
import { CamundaRepository } from './repositories/camundaRepository';
import { PaginationUtils } from './utils/paginationUtils';

export class CamundaBpmClient implements IClient<ICamundaService>, IWorkflowClient {
  private static _getWorkflowParams(options?: Partial<IWorkflowOptions & IPaginationOptions>): any {
    const _params = {} as Record<string, unknown>;
    if (options && (options as IWorkflowOptions).bpmnProcessId) {
      _params.key = options.bpmnProcessId;
    }
    return PaginationUtils.setCamundaBpmPaginationParams(_params, options);
  }

  private readonly _client: ICamundaClient;

  private _topicSubscription: ITopicSubscription | undefined;

  private readonly _config: ICamundaConfig;

  private readonly _repo: ICamundaRepository;

  constructor(config: ICamundaConfig, client: ICamundaClient) {
    this._client = client;
    this._config = config;
    this._repo = new CamundaRepository(config);
    const pluginLoader = new PluginLoader(IoC, this._getLogger());
    if (config.plugins) {
      pluginLoader.load(config.plugins);
    }
  }

  public subscribe(onMessageReceived: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void> {
    this._topicSubscription = this._client.subscribe(
      this._config.topicName,
      this._config.subscriptionOptions,
      async (camundaObject: { task: IVariablePayload; taskService: any }) => {
        const [message, service] = CamundaMessage.wrap(camundaObject);
        await onMessageReceived(message, service);
      },
    );

    this._startSubscriber();

    return Promise.resolve();
  }

  public unsubscribe(): Promise<void> {
    try {
      if (this._topicSubscription) {
        this._topicSubscription.unsubscribe();
      }
      this._client.stop();
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async deployWorkflow(absPath: string): Promise<IDeployWorkflowResponse> {
    const result = await this._repo.deployWorkflow(`Deploy from ${this._config.workerId}`, absPath);
    const response = result.data;
    const deployedProcessDefinitionsId = Object.keys(response.deployedProcessDefinitions)[0];
    const definition = response.deployedProcessDefinitions[deployedProcessDefinitionsId];
    const workflows = [
      {
        bpmnProcessId: definition.key,
        workflowKey: definition.id,
        resourceName: definition.resource,
        version: definition.version,
      },
    ];
    return {
      workflows,
      key: response.id,
    };
  }

  public async getWorkflows(options?: Partial<IWorkflowOptions & IPaginationOptions>): Promise<IPagination<IWorkflow>> {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const params = CamundaBpmClient._getWorkflowParams(options);
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const apiOptions = { params };
    const requests: [
      Promise<IHttpResponse<IBpmn[]>>,
      Promise<
        IHttpResponse<{
          count: number;
        }>
      >,
    ] = [this._repo.getWorkflows(apiOptions), this._repo.getWorkflowCount(apiOptions)];
    const [result, repCount] = await Promise.all(requests);
    const bpmns = result.data;
    const workflows = bpmns.map((definition) => ({
      bpmnProcessId: definition.key,
      workflowKey: definition.id,
      resourceName: definition.resource,
      version: definition.version,
    }));

    return {
      paging: PaginationUtils.getPagingFromOptions(repCount.data.count, options),
      items: workflows,
    };
  }

  public async getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition> {
    let definition;
    if (this._hasBpmnProcessId(payload)) {
      definition = await this._repo.getWorkflow(payload.bpmnProcessId);
    } else {
      definition = await this._repo.getWorkflow(payload.workflowKey);
    }

    return {
      bpmnProcessId: definition.key,
      bpmnXml: definition.bpmn20Xml,
      resourceName: definition.resource,
      version: definition.version,
      workflowKey: definition.id,
    };
  }

  public async updateVariables<T = any>(model: IUpdateWorkflowVariables<Partial<T>>): Promise<void> {
    await this._repo.updateVariables(model.processInstanceId, model.variables);
  }

  public async updateJobRetries({ jobKey, retries }: IUpdateWorkflowRetry): Promise<void> {
    await this._repo.updateJobRetries(jobKey, retries);
  }

  public publishMessage<T, K>(payload: IPublishMessage<T, K>): Promise<void> {
    return this._repo.publishMessage({
      messageName: payload.name,
      processInstanceId: payload.messageId as string,
      correlationKeys: payload.correlation,
      variables: payload.variables,
    });
  }

  public async createWorkflowInstance<T>(model: ICreateWorkflowInstance<T>): Promise<ICreateWorkflowInstanceResponse> {
    const result = await this._repo.createWorkflowInstance(model.bpmnProcessId, model.variables);
    const response = result.data;
    const bpmnDef = response.definitionId.split(':');
    // TODO: fix this type issue
    return {
      bpmnProcessId: bpmnDef[0],
      version: bpmnDef[1] as unknown as number,
      workflowInstanceKey: response.id,
      workflowKey: response.definitionId,
    };
  }

  public cancelWorkflowInstance(instanceId: string): Promise<void> {
    return this._repo.cancelWorkflowInstance(instanceId);
  }

  public resolveIncident(incidentKey: string): Promise<void> {
    return this._repo.resolveIncident(incidentKey);
  }

  private _startSubscriber() {
    if (!this._config.autoPoll) {
      this._client.start();
    }
  }

  private _hasBpmnProcessId(request: IWorkflowDefinitionRequest): request is IWorkflowProcessIdDefinition {
    return (request as IWorkflowProcessIdDefinition).bpmnProcessId !== undefined;
  }

  private _getLogger(): ILogger {
    try {
      return IoC.get(SERVICE_IDENTIFIER.logger);
    } catch (error) {
      return NOOP_LOGGER;
    }
  }
}
