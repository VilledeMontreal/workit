/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IoC, NOOP_LOGGER, PluginLoader, SERVICE_IDENTIFIER } from '@villedemontreal/workit-core';
import { SERVICE_IDENTIFIER as SF_SERVICE_IDENTIFIER } from './config/constants/identifiers';
import {
  ICamundaConfig,
  ICamundaService,
  IClient,
  ICreateWorkflowInstance,
  ICreateWorkflowInstanceResponse,
  IDeployWorkflowResponse,
  ILogger,
  IMessage,
  IPagination,
  IPaginationOptions,
  IPublishMessage,
  IUpdateWorkflowRetry,
  IUpdateWorkflowVariables,
  IWorkflow,
  IWorkflowClient,
  IWorkflowDefinition,
  IWorkflowDefinitionRequest,
  IWorkflowOptions,
  IStepFunctionClientConfig,
} from '@villedemontreal/workit-types';
import { SfnMessage } from './sfnMessage';
import { SQSClient } from '@aws-sdk/client-sqs';
import * as sqsConsumer from 'sqs-consumer';
import { randomUUID } from 'crypto';
import { inject, injectable, optional } from 'inversify';
import { Message } from '@aws-sdk/client-sqs';
import { StepFunctionRepository } from './repositories/stepFunctionRepository';

export type IConfig = Partial<ICamundaConfig> & IStepFunctionClientConfig;

@injectable()
export class SFnSQSClient implements IClient<ICamundaService>, IWorkflowClient {
  private _topicSubscription!: sqsConsumer.Consumer;

  private readonly _config: IConfig;

  private readonly _repo: StepFunctionRepository;

  constructor(
    @inject(SF_SERVICE_IDENTIFIER.stepfunction_config) config: IConfig,
    @inject(SF_SERVICE_IDENTIFIER.stepfunction_repository) @optional() repo?: StepFunctionRepository,
  ) {
    this._config = config;
    this._repo = repo || new StepFunctionRepository(this._config);
    const pluginLoader = new PluginLoader(IoC, this._getLogger());
    if (config.plugins) {
      pluginLoader.load(config.plugins);
    }
  }

  public subscribe(onMessageReceived: (message: IMessage, service: ICamundaService) => Promise<void>): Promise<void> {
    // check if we have a specialized sqs config
    let config: IConfig;
    if (IoC.isServiceBound(SF_SERVICE_IDENTIFIER.sqs_config)) {
      config = IoC.get(SF_SERVICE_IDENTIFIER.sqs_config);
    } else {
      config = this._config;
    }

    this._topicSubscription = sqsConsumer.Consumer.create({
      queueUrl: this._config.queueUrl,
      waitTimeSeconds: this._config.waitTimeSeconds,
      handleMessage: async (message: Message) => {
        const [msg, service] = SfnMessage.wrap(message, this._repo);
        await onMessageReceived(msg, service);
      },
      sqs: new SQSClient(config),
    });

    this._startSubscriber();

    return Promise.resolve();
  }

  public unsubscribe(): Promise<void> {
    try {
      if (this._topicSubscription) {
        this._topicSubscription.stop();
      }
      return Promise.resolve();
    } catch (error) {
      return Promise.reject(error);
    }
  }

  public async deployWorkflow(absPath: string, override?: any): Promise<IDeployWorkflowResponse> {
    // TODO: specialize any
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    const result = await this._repo.deployWorkflow(absPath, override);

    if (!result.stateMachineArn) {
      throw new Error('Cannot deploy workflow');
    }

    const workflows = [
      {
        bpmnProcessId: result.stateMachineArn,
        workflowKey: result.stateMachineArn,
        resourceName: result.stateMachineArn,
        version: 1,
      },
    ];

    return {
      workflows,
      key: result.stateMachineArn,
    };
  }

  public async getWorkflows(options?: Partial<IWorkflowOptions & IPaginationOptions>): Promise<IPagination<IWorkflow>> {
    // use https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sfn/command/ListStateMachinesCommand/
    return Promise.reject(new Error('Not implemented exception'));
  }

  public async getWorkflow(payload: IWorkflowDefinitionRequest): Promise<IWorkflowDefinition> {
    // https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sfn/command/DescribeStateMachineCommand/
    return Promise.reject(new Error('Not implemented exception'));
  }

  public async updateVariables<T = any>(model: IUpdateWorkflowVariables<Partial<T>>): Promise<void> {
    return Promise.reject(
      new Error('Not implemented exception ! Step function cannot update variable outside the pipeline'),
    );
  }

  public async updateJobRetries({ jobKey, retries }: IUpdateWorkflowRetry): Promise<void> {
    return Promise.reject(
      new Error(
        'Not implemented exception ! This is only usefull for Camunda BPM/Zeebe, Step function handles everything on his side',
      ),
    );
  }

  public publishMessage<T, K>(payload: IPublishMessage<T, K>): Promise<void> {
    // could be used but not with sqs service (perhaps with Amazon EventBridge or MQ)
    return Promise.reject(new Error('Not implemented exception, please use createWorkflowInstance method'));
  }

  public async createWorkflowInstance<T>(model: ICreateWorkflowInstance<T>): Promise<ICreateWorkflowInstanceResponse> {
    const input = {
      stateMachineArn: model.bpmnProcessId,
      name: randomUUID(),
      input: JSON.stringify(model.variables),
    };
    const response = await this._repo.startExecution(input);
    if (!response.executionArn) {
      throw new Error('Cannot create workflow instance');
    }

    return {
      bpmnProcessId: model.bpmnProcessId,
      version: 1,
      workflowInstanceKey: response.executionArn,
      workflowKey: model.bpmnProcessId,
    };
  }

  public cancelWorkflowInstance(instanceId: string): Promise<void> {
    // use https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sfn/command/StopExecutionCommand/
    return Promise.reject(new Error('Not implemented exception'));
  }

  public resolveIncident(incidentKey: string): Promise<void> {
    // perhaps we could use redrive command
    return Promise.reject(new Error('Not implemented exception'));
  }

  private _startSubscriber() {
    this._topicSubscription.start();
  }

  private _getLogger(): ILogger {
    try {
      return IoC.get(SERVICE_IDENTIFIER.logger);
    } catch (error) {
      return NOOP_LOGGER;
    }
  }
}
