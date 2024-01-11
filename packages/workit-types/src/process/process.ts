/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IProcessHandler } from './processHandler';

export interface IProcess {
  on(event: 'starting' | 'running' | 'stopping' | 'stopped', listener: () => void): this;
  start(): void;
  run(): Promise<void>;
  stop(): Promise<void>;
  getProcessHandler(): IProcessHandler;
}
