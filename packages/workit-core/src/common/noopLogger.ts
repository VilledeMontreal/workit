/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { ILogger } from 'workit-types';

/** No-op implementation of ILogger */
export class NoopLogger implements ILogger {
  // By default does nothing
  public debug(message: string, ...args: unknown[]) {}

  // By default does nothing
  public error(message: string, ...args: unknown[]) {}

  // By default does nothing
  public warn(message: string, ...args: unknown[]) {}

  // By default does nothing
  public info(message: string, ...args: unknown[]) {}
}

export const NOOP_LOGGER = new NoopLogger();
