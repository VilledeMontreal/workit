/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { injectable, optional, inject } from 'inversify';
import 'reflect-metadata';
import { ICamundaService, IFailureStrategy, IMessage, IWorkflowProps, ILogger } from 'workit-types';
import { SERVICE_IDENTIFIER } from '../config/constants/identifiers';
import { NOOP_LOGGER } from '../common/noopLogger';

// eslint-disable-next-line
const stringify = require('fast-safe-stringify');

@injectable()
export class FailureStrategySimple implements IFailureStrategy<ICamundaService> {
  private readonly _logger: ILogger;

  constructor(@inject(SERVICE_IDENTIFIER.logger) @optional() logger: ILogger = NOOP_LOGGER) {
    this._logger = logger;
    this._logger.debug('warning: You should not use this failure strategy class in production');
  }

  public async handle<T extends Error>(
    error: T,
    message: IMessage<unknown, IWorkflowProps>,
    service: ICamundaService
  ): Promise<void> {
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

    this._logger.debug(
      JSON.stringify({
        errorMessage: error.message,
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
        errorDetails: stringify(error),
        retries,
        retryTimeout: 1000 * retries * 2,
      })
    );

    await service.nack({
      ...error,
      retries,
      retryTimeout: 1000 * retries * 2,
    });
  }
}
