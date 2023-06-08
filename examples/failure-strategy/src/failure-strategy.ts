/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ICamundaService, IFailureStrategy, IMessage, IWorkflowProps } from '@villedemontreal/workit-types';
import axios, { AxiosError } from 'axios';

export interface IHandlerStrategy extends IFailureStrategy<ICamundaService> {
  isHandled(error: any, message: IMessage<unknown, IWorkflowProps>): boolean;
}

export class FailureStrategySimple implements IFailureStrategy<ICamundaService> {
  private readonly _handlers: IHandlerStrategy[];

  constructor(handlers: IHandlerStrategy[]) {
    this._handlers = handlers || [];
  }

  public async handle(error: any, message: IMessage<unknown, IWorkflowProps>, service: ICamundaService): Promise<void> {
    let isHandled = false;
    await this._handlers.reduce(async (promise, handler) => {
      await promise;
      isHandled = handler.isHandled(error, message);
      if (!isHandled) {
        return;
      }

      await handler.handle(error, message, service);
    }, Promise.resolve());

    if (!isHandled) {
      const { properties } = message;
      let retries = properties.retries as number;
      if (!retries) {
        retries = 1;
      } else {
        retries += 1;
      }

      if (retries > 20) {
        retries = 0;
      }
      await service.nack({
        ...error,
        retries,
        retryTimeout: 1000 * retries * 2,
      });
    }
  }
}

export class AxiosNotFoundHandler implements IHandlerStrategy {
  public isHandled(error: AxiosError<unknown>, message: IMessage<unknown, unknown>): boolean {
    return error.isAxiosError && error.response?.status === 404;
  }

  public async handle(
    error: AxiosError<unknown>,
    message: IMessage<unknown, IWorkflowProps>,
    service: ICamundaService
  ): Promise<void> {
    try {
      await axios.post(`http://localhost:8080/engine-rest/external-task/${message.properties.jobKey}/bpmnError`, {
        workerId: 'demo',
        errorCode: 'not_found',
      });
    } catch (err) {
      console.log('Woops!');
      console.log(error, err);
    }
  }
}
