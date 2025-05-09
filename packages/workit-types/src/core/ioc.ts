/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
export interface IIoC {
  bindToObject<T = any>(obj: T, serviceIdentifier: symbol | string, named?: string): void;
  bind<T = any>(
    serviceIdentifier: string,
    ctor: new (...args: any[]) => T,
    targetNamed: string,
    singletonMode?: boolean,
  ): void;
  get<T>(serviceIdentifier: symbol | string, named?: string | symbol): T;
  /**
   * Useful for getting task instance for a specific workflow.
   * It can check if there is a task for a specific workflow version or it will rollback to the serviceIdentifier if nothing is boundNamed.
   * Otherwise it will throw an error
   */
  getTask<T = any>(serviceIdentifier: symbol | string, workflow?: { bpmnProcessId: string; version: number }): T;

  bindTask(
    ctor: any,
    serviceIdentifier: string | symbol,
    workflow: { bpmnProcessId: string; version?: number },
    dependencies?: (symbol | string)[],
    singletonMode?: boolean,
  ): void;
}
