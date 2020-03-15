/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SpanKind, SpanOptions, Tracer } from '@opentelemetry/api';
import { EventEmitter } from 'events';
import { inject, injectable, optional } from 'inversify';
import 'reflect-metadata';
import {
  ICamundaService,
  IFailureStrategy,
  IMessage,
  IProcessHandler,
  IProcessHandlerConfig,
  ISuccessStrategy,
  ITask,
  ITracerPropagator,
  IWorkflowProps
} from 'workit-types';
import { SERVICE_IDENTIFIER } from '../config/constants/identifiers';
import { Interceptors } from '../interceptors';
import { IoC, kernel } from '../config/container';

import debug = require('debug');

const log = debug('workit:processHandler');

@injectable()
export class SCProcessHandler<T = any, K extends IWorkflowProps = IWorkflowProps> extends EventEmitter
  implements IProcessHandler {
  protected readonly _config: Partial<IProcessHandlerConfig>;

  protected readonly _success: ISuccessStrategy<ICamundaService>;

  protected readonly _failure: IFailureStrategy<ICamundaService>;

  protected readonly _propagation: ITracerPropagator;

  protected readonly _tracer: Tracer;

  constructor(
    @inject(SERVICE_IDENTIFIER.success_strategy) successStrategy: ISuccessStrategy<ICamundaService>,
    @inject(SERVICE_IDENTIFIER.failure_strategy) failureStrategy: IFailureStrategy<ICamundaService>,
    @inject(SERVICE_IDENTIFIER.tracer) tracer: Tracer,
    @inject(SERVICE_IDENTIFIER.process_handler_config) @optional() config?: IProcessHandlerConfig
  ) {
    super();
    this._tracer = tracer;
    this._config = config || ({} as IProcessHandlerConfig);
    this._propagation = this._config.propagation || IoC.get(SERVICE_IDENTIFIER.tracer_propagator);
    this._success = successStrategy;
    this._failure = failureStrategy;
  }

  /**
   * Camunda Process Handler
   * T = message.body type
   * K = message.properties.customHeaders type
   */
  public handle = async (message: IMessage<T, K>, service: ICamundaService): Promise<void> => {
    log('handling message');
    return this._otHandle(message, service);
  };

  private _otHandle = (message: IMessage<T, K>, service: ICamundaService): Promise<void> => {
    log('handling message with tracing');
    const { properties } = message;
    const identifier = properties.activityId;
    const spanOptions: SpanOptions = {
      kind: SpanKind.SERVER,
      attributes: {
        'wf.activityId': identifier,
        'wf.processInstanceId': properties.processInstanceId,
        'wf.workflowInstanceKey': properties.workflowInstanceKey,
        'wf.retries': properties.retries || 0,
        'wf.topicName': properties.topicName,
        'worker.id': properties.workerId
      }
    };
    spanOptions.parent = this._propagation.extractFromMessage(message);

    const span = this._tracer.startSpan(identifier, spanOptions);
    return this._tracer.withSpan(span, () => {
      this._tracer.bind(this);

      if (properties.businessKey) {
        span.setAttribute('wf.businessKey', properties.businessKey);
      }

      return this._handler(message, service, () => span.end());
    });
  };

  private _handler = async (message: IMessage<T, K>, service: ICamundaService, callback?: () => void) => {
    let msg: IMessage = message;
    const { properties } = message;
    try {
      this.emit('message', msg);

      const workflowCriteria = {
        bpmnProcessId: properties.bpmnProcessId,
        version: properties.workflowDefinitionVersion
      };

      const task = IoC.getTask<ITask<IMessage>>(properties.activityId, workflowCriteria);
      msg = await Interceptors.execute(this._config.interceptors, message);
      msg = await task.execute(msg);

      await this._success.handle(msg, service);
      this.emit('message-handled', null, msg);
    } catch (e) {
      log(e.message);
      await this._failure.handle(e, message, service);
      this.emit('message-handled', e, message);
    } finally {
      if (callback) {
        callback();
      }
    }
  };
}

kernel.bind(SERVICE_IDENTIFIER.process_handler).to(SCProcessHandler);
