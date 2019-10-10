/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SpanContext, SpanKind, TraceOptions, Tracer } from '@opencensus/core';
import debug = require('debug');
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
  IWorkflowProps
} from 'workit-types';
import { SERVICE_IDENTIFIER } from '../../../config/constants/identifiers';
import { IoC } from '../../IoC';
import { isWorkitPropagator } from '../../opentelemetry/specs/workitFormat';
import { Interceptors } from '../interceptors';

const log = debug('workit:processHandler');

@injectable()
export class SCProcessHandler<T = any, K extends IWorkflowProps = IWorkflowProps> extends EventEmitter
  implements IProcessHandler {
  protected readonly _config: Partial<IProcessHandlerConfig>;
  protected readonly _success: ISuccessStrategy<ICamundaService>;
  protected readonly _failure: IFailureStrategy<ICamundaService>;
  protected readonly _tracer: Tracer;
  constructor(
    @inject(SERVICE_IDENTIFIER.success_strategy) successStrategy: ISuccessStrategy<ICamundaService>,
    @inject(SERVICE_IDENTIFIER.failure_strategy) failureStrategy: IFailureStrategy<ICamundaService>,
    @inject(SERVICE_IDENTIFIER.tracer) tracer: Tracer,
    @inject(SERVICE_IDENTIFIER.process_handler_config) @optional() config?: IProcessHandlerConfig
  ) {
    super();
    this._tracer = tracer;
    this._config = config || {};
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
    return this._ocHandle(message, service);
  };

  private _ocHandle = (message: IMessage<T, K>, service: ICamundaService): Promise<void> => {
    log('handling message with tracing');
    const { properties } = message;
    const identifier = properties.activityId;
    let spanContext: SpanContext | null = null;

    const propagation = this._tracer.propagation as unknown;
    const spanOptions: TraceOptions = {
      name: identifier,
      kind: SpanKind.SERVER
    };
    if (isWorkitPropagator(propagation)) {
      spanContext = propagation.extractFromMessage(message);
      spanOptions.spanContext = spanContext || undefined;
    }

    return this._tracer.startRootSpan(spanOptions, rootSpan => {
      this._tracer.wrapEmitter(this);

      rootSpan.addAttribute('wf.activityId', identifier);
      rootSpan.addAttribute('wf.processInstanceId', properties.processInstanceId);
      rootSpan.addAttribute('wf.workflowInstanceKey', properties.workflowInstanceKey);

      if (properties.businessKey) {
        rootSpan.addAttribute('wf.businessKey', properties.businessKey);
      }

      rootSpan.addAttribute('wf.retries', properties.retries || 0);
      rootSpan.addAttribute('wf.topicName', properties.topicName);
      rootSpan.addAttribute('worker.id', properties.workerId);

      return this._handler(message, service, () => rootSpan.end());
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
