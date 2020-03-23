/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { injectable } from 'inversify';
import 'reflect-metadata';
import { ICamundaService, IFailureStrategy, IMessage, IWorkflowProps } from 'workit-types';

// eslint-disable-next-line
const stringify = require('fast-safe-stringify');

@injectable()
export class FailureStrategySimple implements IFailureStrategy<ICamundaService> {
  constructor() {
    console.log('warning: You should not use this failure strategy class in production');
  }

  public async handle(error: any, message: IMessage<unknown, IWorkflowProps>, service: ICamundaService): Promise<void> {
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

    console.log(
      JSON.stringify({
        errorMessage: error.message,
        errorDetails: stringify(error),
        retries,
        retryTimeout: 1000 * retries * 2
      })
    );

    await service.nack({
      ...error,
      retries,
      retryTimeout: 1000 * retries * 2
    });
  }
}
