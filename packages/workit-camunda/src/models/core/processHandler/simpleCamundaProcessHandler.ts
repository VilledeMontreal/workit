import debug = require('debug');
import { EventEmitter } from 'events';
import { inject, injectable, optional } from 'inversify';
import 'reflect-metadata';
import { SERVICE_IDENTIFIER } from '../../../config/constants/identifiers';
import { ICamundaService } from '../../camunda-n-mq/specs/camundaService';
import { IMessage } from '../../camunda-n-mq/specs/message';
import { IoC } from '../../IoC';
import { Interceptors } from '../interceptors';
import { IFailureStrategy } from '../specs/failureStrategy';
import { ISuccessStrategy } from '../specs/successStrategy';
import { ITask } from '../specs/task';
import { IProcessHandler } from './specs/processHandler';
import { IProcessHandlerConfig } from './specs/processHandlerConfig';

const log = debug('workit:processHandler');

@injectable()
export class SCProcessHandler<T = any, K = any> extends EventEmitter implements IProcessHandler {
  protected readonly _config: Partial<IProcessHandlerConfig>;
  protected readonly _success: ISuccessStrategy;
  protected readonly _failure: IFailureStrategy;
  constructor(
    @inject(SERVICE_IDENTIFIER.success_strategy) successStrategy: ISuccessStrategy,
    @inject(SERVICE_IDENTIFIER.failure_strategy) failureStrategy: IFailureStrategy,
    @inject(SERVICE_IDENTIFIER.process_handler_config) @optional() config?: IProcessHandlerConfig
  ) {
    super();
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
    const { properties } = message;
    const identifier = properties.activityId;
    let msg = message;

    try {
      this.emit('message', msg);
      const workflowCriteria = {
        bpmnProcessId: properties.bpmnProcessId,
        version: properties.workflowDefinitionVersion
      };
      const task = IoC.getTask<ITask<IMessage>>(identifier, workflowCriteria);
      msg = await Interceptors.execute(this._config.interceptors, message);
      msg = await task.execute(msg);

      await this._success.handle(msg, service);
      this.emit('message-handled', null, msg);
    } catch (e) {
      log(e.message);
      await this._failure.handle(e, message, service);
      this.emit('message-handled', e, message);
    }
  };
}
