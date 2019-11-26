/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Container, decorate, inject, injectable, multiInject } from 'inversify';
import { isObject } from 'util';
import { container } from './config/container';

export { Container };

/**
 * Useful IoC
 * CORE identifier (aka name param in static method) use the following enum: SERVICE_IDENTIFIER
 */
export class IoC {
  public static charSplit = ':';
  /**
   * return false if there is nothing to unbind
   */
  public static unbind(name: string | symbol): boolean {
    if (!name) {
      throw new Error('we need to have a name');
    }

    try {
      container.unbind(name);
      return true;
    } catch (error) {
      return false;
    }
  }
  public static isServiceBound(serviceIdentifier: symbol | string, name?: string): boolean {
    if (!serviceIdentifier) {
      throw new Error('param should not be empty');
    }

    try {
      if (name) {
        return container.isBoundNamed(serviceIdentifier, name);
      }
      return container.isBound(serviceIdentifier);
    } catch (e) {
      return false;
    }
  }
  /**
   * Bind your Class to a SERVICE_IDENTIFIER
   *
   * @static
   * @param {*} ctor Constructor
   * @param {(string | symbol)} serviceIdentifier
   * @param {((symbol | string)[])} [dependencies]
   * @param {(string | symbol | null)} [named]
   * @param {boolean} [singletonMode=true] default true.
   */
  public static bindTo(
    ctor: any,
    serviceIdentifier: string | symbol,
    dependencies?: (symbol | string)[],
    named?: string | symbol | null,
    singletonMode = true
  ): void {
    IoC._inject(ctor, dependencies);

    const service = container.bind(serviceIdentifier).to(ctor);

    if (singletonMode) {
      service.inSingletonScope();
    }

    if (named) {
      service.whenTargetNamed(named);
    } else {
      service.whenTargetIsDefault();
    }
  }
  public static bindToAsDefault(
    ctor: any,
    serviceIdentifier: string | symbol,
    dependencies?: (symbol | string)[]
  ): void {
    IoC._inject(ctor, dependencies);
    container
      .bind(serviceIdentifier)
      .to(ctor)
      .inSingletonScope()
      .whenTargetIsDefault();
  }
  // todo: merge with bindTo
  public static bindToObject(obj: any, serviceIdentifier: symbol | string, named?: string): void {
    this._overrideConfig(obj, serviceIdentifier);
    const service = container.bind(serviceIdentifier).toConstantValue(obj);
    if (named) {
      service.whenTargetNamed(named);
    }
  }
  /**
   * @deprecated
   * Bind your Class to a SERVICE_IDENTIFIER
   * This method doesn't support dependencies
   * @static
   * @template T
   * @param {string} serviceIdentifier
   * @param {*} ctor contstructor
   * @param {string} targetNamed
   * @param {boolean} [singletonMode=true] default true
   * @memberof IoC
   */
  public static bind<T>(serviceIdentifier: string, ctor: any, targetNamed: string, singletonMode = true): void {
    const service = container.bind<T>(serviceIdentifier).to(ctor);

    if (singletonMode) {
      service.inSingletonScope();
    }

    service.whenTargetNamed(targetNamed);
  }
  public static get<T>(serviceIdentifier: symbol | string, named?: string | symbol): T {
    if (named) {
      return container.isBoundNamed(serviceIdentifier, named)
        ? container.getNamed(serviceIdentifier, named)
        : container.get(serviceIdentifier);
    }
    return container.get(serviceIdentifier);
  }

  /**
   * Useful for getting task instance for a specific workflow.
   * It can check if there is a task for a specific workflow version or it will rollback to the serviceIdentifier if nothing is boundNamed.
   * Otherwise it will throw an error
   */
  public static getTask<T = any>(
    serviceIdentifier: symbol | string,
    workflow?: { bpmnProcessId: string; version: number }
  ): T {
    if (!workflow) {
      return container.get(serviceIdentifier);
    }

    const workflowId = workflow.bpmnProcessId;
    const workflowVersion = workflow.version;
    const pattern = IoC.getWorkflowNamed(workflow);

    if (workflowVersion && container.isBoundNamed(serviceIdentifier, pattern)) {
      return container.getNamed(serviceIdentifier, pattern);
    }

    if (container.isBoundNamed(serviceIdentifier, workflowId)) {
      return container.getNamed(serviceIdentifier, workflowId);
    }
    return container.get(serviceIdentifier);
  }
  public static bindTask(
    ctor: any,
    serviceIdentifier: string | symbol,
    workflow: { bpmnProcessId: string; version?: number },
    dependencies?: (symbol | string)[],
    singletonMode = true
  ): void {
    const named = IoC.getWorkflowNamed(workflow);
    IoC.bindTo(ctor, serviceIdentifier, dependencies, named, singletonMode);
  }

  public static getWorkflowNamed(workflow: { bpmnProcessId: string; version?: number }): string {
    IoC._validateWorkflow(workflow);

    const workflowId = workflow.bpmnProcessId;
    const workflowVersion = workflow.version;
    // can't be 0
    if (workflowVersion) {
      return `${workflowId}${IoC.charSplit}${workflowVersion}`;
    }

    return workflowId;
  }

  /**
   * Warning: You should not use this or you know what you are doing.
   * Container is exposed for avoiding to block developpers.
   * Container is Inversify Object.
   * If you need to use it, please create a ticket on Github and describe your use case.
   * @static
   * @memberof IoC
   */
  public static getContainer(): Container {
    return container;
  }

  /**
   * Seems Hacky, we should look to use inversify factory in order to inject config and then override.
   *
   */
  private static _overrideConfig(obj: any, serviceIdentifier: string | symbol): void {
    if (!obj) {
      return;
    }

    const id = serviceIdentifier.toString();
    if (id === 'camunda_external_config' || id === 'Symbol(camunda_external_config)') {
      obj.autoPoll = false;
    }
  }

  private static _inject(ctor: any, dependencies?: (string | symbol)[]) {
    try {
      decorate(injectable(), ctor);
      (dependencies || []).forEach((dependency, index) => {
        // review this code when possible. use arrow function instead.
        let injection: (target: any, targetKey: string, index?: number) => void;
        if (typeof dependency === 'string' && dependency.endsWith('[]')) {
          injection = multiInject(dependency);
        } else {
          injection = inject(dependency);
        }
        decorate(injection, ctor, index);
      });
    } catch {
      //
    }
  }

  private static _validateWorkflow(workflow: { bpmnProcessId: string; version?: number }): void {
    if (!isObject(workflow) || typeof workflow.bpmnProcessId !== 'string') {
      throw new Error('workflow object is required');
    }
  }
}
