/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IIoC } from '@villedemontreal/workit-types';
import { Container, decorate, inject, injectable, multiInject } from 'inversify';
import { isObject } from 'util';

export { Container };

/**
 * Useful IOC (Inversion Of Control)
 * CORE identifier (aka name param in static method) use the following enum: SERVICE_IDENTIFIER
 */
export class IOC implements IIoC {
  public static charSplit = ':';

  private readonly _container: Container;

  constructor(container: Container) {
    this._container = container;
  }

  /**
   * return false if there is nothing to unbind
   */
  public unbind(name: string | symbol): boolean {
    if (!name) {
      throw new Error('we need to have a name');
    }

    try {
      this._container.unbind(name);
      return true;
    } catch (error) {
      return false;
    }
  }

  public isServiceBound(serviceIdentifier: symbol | string, name?: string): boolean {
    if (!serviceIdentifier) {
      throw new Error('param should not be empty');
    }

    try {
      if (name) {
        return this._container.isBoundNamed(serviceIdentifier, name);
      }
      return this._container.isBound(serviceIdentifier);
    } catch (e) {
      return false;
    }
  }

  /**
   * Bind your Class to a SERVICE_IDENTIFIER
   *
   * @param {*} ctor Constructor
   * @param {(string | symbol)} serviceIdentifier
   * @param {((symbol | string)[])} [dependencies]
   * @param {(string | symbol | null)} [named]
   * @param {boolean} [singletonMode=true] default true.
   */
  public bindTo(
    ctor: new (...args: any[]) => unknown,
    serviceIdentifier: string | symbol,
    dependencies?: (symbol | string)[],
    named?: string | symbol | null,
    singletonMode = true,
  ): void {
    IOC._inject(ctor, dependencies);

    const service = this._container.bind(serviceIdentifier).to(ctor);

    if (singletonMode) {
      service.inSingletonScope();
    }

    if (named) {
      service.whenTargetNamed(named);
    } else {
      service.whenTargetIsDefault();
    }
  }

  public bindToAsDefault(
    ctor: new (...args: any[]) => unknown,
    serviceIdentifier: string | symbol,
    dependencies?: (symbol | string)[],
  ): void {
    IOC._inject(ctor, dependencies);
    this._container.bind(serviceIdentifier).to(ctor).inSingletonScope().whenTargetIsDefault();
  }

  // todo: merge with bindTo
  public bindToObject(obj: any, serviceIdentifier: symbol | string, named?: string): void {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const newObj = IOC._overrideConfig(obj, serviceIdentifier);
    const service = this._container.bind(serviceIdentifier).toConstantValue(newObj);
    if (named) {
      service.whenTargetNamed(named);
    }
  }

  /**
   * @deprecated
   * Bind your Class to a SERVICE_IDENTIFIER
   * This method doesn't support dependencies
   * @template T
   * @param {string} serviceIdentifier
   * @param {*} ctor contstructor
   * @param {string} targetNamed
   * @param {boolean} [singletonMode=true] default true
   * @memberof IoC
   */
  public bind<T = any>(
    serviceIdentifier: string,
    ctor: new (...args: any[]) => T,
    targetNamed: string,
    singletonMode = true,
  ): void {
    const service = this._container.bind<T>(serviceIdentifier).to(ctor);

    if (singletonMode) {
      service.inSingletonScope();
    }

    service.whenTargetNamed(targetNamed);
  }

  public get<T>(serviceIdentifier: symbol | string, named?: string | symbol): T {
    if (named) {
      return this._container.isBoundNamed(serviceIdentifier, named)
        ? this._container.getNamed(serviceIdentifier, named)
        : this._container.get(serviceIdentifier);
    }
    return this._container.get(serviceIdentifier);
  }

  /**
   * Useful for getting task instance for a specific workflow.
   * It can check if there is a task for a specific workflow version or it will rollback to the serviceIdentifier if nothing is boundNamed.
   * Otherwise it will throw an error
   */
  public getTask<T = any>(
    serviceIdentifier: symbol | string,
    workflow?: { bpmnProcessId: string; version: number },
  ): T {
    if (!workflow) {
      return this._container.get(serviceIdentifier);
    }

    const workflowId = workflow.bpmnProcessId;
    const workflowVersion = workflow.version;
    const pattern = this.getWorkflowNamed(workflow);

    if (workflowVersion && this._container.isBoundNamed(serviceIdentifier, pattern)) {
      return this._container.getNamed(serviceIdentifier, pattern);
    }

    if (this._container.isBoundNamed(serviceIdentifier, workflowId)) {
      return this._container.getNamed(serviceIdentifier, workflowId);
    }
    return this._container.get(serviceIdentifier);
  }

  public bindTask(
    ctor: new (...args: any[]) => unknown,
    serviceIdentifier: string | symbol,
    workflow: { bpmnProcessId: string; version?: number },
    dependencies?: (symbol | string)[],
    singletonMode = true,
  ): void {
    const named = this.getWorkflowNamed(workflow);
    this.bindTo(ctor, serviceIdentifier, dependencies, named, singletonMode);
  }

  public getWorkflowNamed(workflow: { bpmnProcessId: string; version?: number }): string {
    IOC._validateWorkflow(workflow);

    const workflowId = workflow.bpmnProcessId;
    const workflowVersion = workflow.version;
    // can't be 0
    if (workflowVersion) {
      return `${workflowId}${IOC.charSplit}${workflowVersion}`;
    }

    return workflowId;
  }

  /**
   * Warning: You should not use this or you know what you are doing.
   * Container is exposed for avoiding to block developpers.
   * Container is Inversify Object.
   * If you need to use it, please create a ticket on Github and describe your use case.
   * @memberof IoC
   */
  public getContainer(): Container {
    return this._container;
  }

  /**
   * Seems Hacky, we should look to use inversify factory in order to inject config and then override.
   *
   */
  private static _overrideConfig<T = any>(obj: T, serviceIdentifier: string | symbol): T {
    if (!obj) {
      return obj;
    }

    const id = serviceIdentifier.toString();
    let newObj = obj;

    if (id === 'camunda_external_config' || id === 'Symbol(camunda_external_config)') {
      newObj = { ...obj, autoPoll: false };
    }

    return newObj;
  }

  private static _inject(ctor: any, dependencies?: (string | symbol)[]) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      decorate(injectable(), ctor);
      (dependencies || []).forEach((dependency, index) => {
        let injection: (target: any, targetKey: string, index?: number) => void;
        if (typeof dependency === 'string' && dependency.endsWith('[]')) {
          injection = multiInject(dependency);
        } else {
          injection = inject(dependency);
        }
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        decorate(injection as ClassDecorator | ParameterDecorator | MethodDecorator, ctor, index);
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
