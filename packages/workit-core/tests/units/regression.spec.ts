/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Regression tests to ensure no breaking changes after package updates.
 * These tests verify core functionality that must remain stable.
 */

import 'reflect-metadata';
import { Container } from 'inversify';
import { IOC, Container as ExportedContainer } from '../../src/IoC';
import { Worker } from '../../src/worker';
import { TaskBase } from '../../src/specs/taskBase';
import { SCProcessHandler } from '../../src/processHandler/simpleCamundaProcessHandler';
import { FailureStrategySimple } from '../../src/strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../../src/strategies/SuccessStrategySimple';
import { NoopLogger } from '../../src/common/noopLogger';
import {
  isFunction,
  isObject,
  andArrayWith,
  isArrayOfFunctions,
  isEmptyArray,
  parseCommaSeparatedBaggage,
} from '../../src/utils/utils';
import { IMessage, IWorkflowProps } from '@villedemontreal/workit-types';
import { trace } from '@opentelemetry/api';

const NOOP_TRACER = trace.getTracer('workit:test:regression');

describe('Regression Tests - Package Update Safety', () => {
  describe('IoC Container (inversify integration)', () => {
    let container: Container;
    let ioc: IOC;

    beforeEach(() => {
      container = new Container();
      ioc = new IOC(container);
    });

    it('should properly export Container from inversify', () => {
      expect(ExportedContainer).toBe(Container);
    });

    it('should bind and resolve services correctly', () => {
      const testValue = { key: 'test-value' };
      const identifier = Symbol('test');

      ioc.bindToObject(testValue, identifier);
      const resolved = ioc.get(identifier);

      expect(resolved).toEqual(testValue);
    });

    it('should check if service is bound', () => {
      const identifier = Symbol('test');
      expect(ioc.isServiceBound(identifier)).toBe(false);

      ioc.bindToObject({}, identifier);
      expect(ioc.isServiceBound(identifier)).toBe(true);
    });

    it('should unbind services', () => {
      const identifier = Symbol('test');
      ioc.bindToObject({}, identifier);

      expect(ioc.unbind(identifier)).toBe(true);
      expect(ioc.isServiceBound(identifier)).toBe(false);
    });

    it('should return false when unbinding non-existent service', () => {
      const identifier = Symbol('non-existent');
      expect(ioc.unbind(identifier)).toBe(false);
    });

    it('should bind multiple services with named bindings', () => {
      const identifier = Symbol('multi');
      ioc.bindToObject({ id: 1 }, identifier, 'first');
      ioc.bindToObject({ id: 2 }, identifier, 'second');

      const first = ioc.get(identifier, 'first');
      const second = ioc.get(identifier, 'second');
      expect(first).toEqual({ id: 1 });
      expect(second).toEqual({ id: 2 });
    });

    it('should return container instance', () => {
      expect(ioc.getContainer()).toBe(container);
    });
  });

  describe('Worker Class', () => {
    let fakeClient: { subscribe: jest.Mock; unsubscribe: jest.Mock };
    let processHandler: SCProcessHandler;
    let worker: Worker;

    beforeEach(() => {
      fakeClient = {
        subscribe: jest.fn().mockResolvedValue(undefined),
        unsubscribe: jest.fn().mockResolvedValue(undefined),
      };

      const successStrategy = new SuccessStrategySimple();
      const failureStrategy = new FailureStrategySimple();
      processHandler = new SCProcessHandler(successStrategy, failureStrategy, NOOP_TRACER);

      worker = new Worker(fakeClient as any, processHandler);
    });

    it('should be an instance of Worker', () => {
      expect(worker).toBeInstanceOf(Worker);
    });

    it('should extend EventEmitter', () => {
      const events: string[] = [];
      worker.on('starting', () => events.push('starting'));
      worker.start();
      expect(events).toContain('starting');
    });

    it('should call client.subscribe on run()', async () => {
      await worker.run();
      expect(fakeClient.subscribe).toHaveBeenCalledTimes(1);
    });

    it('should call client.unsubscribe on stop()', async () => {
      await worker.stop();
      expect(fakeClient.unsubscribe).toHaveBeenCalledTimes(1);
    });

    it('should emit stopping and stopped events on stop()', async () => {
      const events: string[] = [];
      worker.on('stopping', () => events.push('stopping'));
      worker.on('stopped', () => events.push('stopped'));

      await worker.stop();

      expect(events).toEqual(['stopping', 'stopped']);
    });

    it('should return process handler', () => {
      expect(worker.getProcessHandler()).toBe(processHandler);
    });
  });

  describe('Strategy Classes', () => {
    describe('SuccessStrategySimple', () => {
      it('should call service.ack with message', async () => {
        const strategy = new SuccessStrategySimple();
        const mockAck = jest.fn().mockResolvedValue(undefined);
        const message = createMockMessage();
        const service = { ack: mockAck } as any;

        await strategy.handle(message, service);

        expect(mockAck).toHaveBeenCalledWith(message);
      });
    });

    describe('FailureStrategySimple', () => {
      it('should call service.nack with error', async () => {
        const strategy = new FailureStrategySimple();
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const message = createMockMessage();
        const error = new Error('Test error');
        const service = { nack: mockNack } as any;

        await strategy.handle(error, message, service);

        expect(mockNack).toHaveBeenCalled();
      });
    });
  });

  describe('TaskBase Abstract Class', () => {
    class TestTask extends TaskBase<IMessage> {
      execute(model: IMessage): Promise<IMessage> {
        return Promise.resolve(model);
      }
    }

    it('should be extendable and callable', async () => {
      const task = new TestTask();
      const message = createMockMessage();

      const result = await task.execute(message);

      expect(result).toEqual(message);
    });
  });

  describe('NoopLogger', () => {
    let logger: NoopLogger;

    beforeEach(() => {
      logger = new NoopLogger();
    });

    it('should have all logging methods', () => {
      expect(typeof logger.debug).toBe('function');
      expect(typeof logger.info).toBe('function');
      expect(typeof logger.warn).toBe('function');
      expect(typeof logger.error).toBe('function');
    });

    it('should not throw when calling logging methods', () => {
      expect(() => logger.debug('test')).not.toThrow();
      expect(() => logger.info('test')).not.toThrow();
      expect(() => logger.warn('test')).not.toThrow();
      expect(() => logger.error('test')).not.toThrow();
    });
  });

  describe('Utility Functions', () => {
    describe('isFunction', () => {
      it('should correctly identify functions', () => {
        expect(isFunction(() => {})).toBe(true);
        expect(isFunction(function () {})).toBe(true);
        expect(isFunction(async () => {})).toBe(true);
        expect(isFunction(null)).toBe(false);
        expect(isFunction(undefined)).toBe(false);
        expect(isFunction({})).toBe(false);
        expect(isFunction('string')).toBe(false);
        expect(isFunction(123)).toBe(false);
      });
    });

    describe('isObject', () => {
      it('should correctly identify objects', () => {
        expect(isObject({})).toBe(true);
        expect(isObject([])).toBe(true);
        expect(isObject(null)).toBe(true); // typeof null === 'object' in JS
        expect(isObject(undefined)).toBe(false);
        expect(isObject('string')).toBe(false);
        expect(isObject(123)).toBe(false);
      });
    });

    describe('andArrayWith', () => {
      it('should AND test results for all array elements', () => {
        const isPositive = (n: number) => n > 0;

        expect(andArrayWith([1, 2, 3], isPositive)).toBe(true);
        expect(andArrayWith([1, -2, 3], isPositive)).toBe(false);
        expect(andArrayWith([], isPositive)).toBe(true); // empty array returns true
      });
    });

    describe('isArrayOfFunctions', () => {
      it('should correctly identify arrays of functions', () => {
        expect(isArrayOfFunctions([() => {}, () => {}])).toBe(true);
        expect(isArrayOfFunctions([() => {}])).toBe(true);
        expect(isArrayOfFunctions([])).toBe(false);
        expect(isArrayOfFunctions([1, 2, 3])).toBe(false);
        expect(isArrayOfFunctions('not array')).toBe(false);
      });
    });

    describe('isEmptyArray', () => {
      it('should correctly identify empty arrays', () => {
        expect(isEmptyArray([])).toBe(true);
        expect(isEmptyArray([1])).toBe(false);
        expect(isEmptyArray('not array')).toBe(false);
      });
    });

    describe('parseCommaSeparatedBaggage', () => {
      it('should parse comma-separated key=value pairs', () => {
        const baggage: Record<string, string> = {};
        parseCommaSeparatedBaggage(baggage, 'key1=value1, key2=value2');

        expect(baggage).toEqual({
          key1: 'value1',
          key2: 'value2',
        });
      });

      it('should handle empty string', () => {
        const baggage: Record<string, string> = {};
        parseCommaSeparatedBaggage(baggage, '');

        expect(baggage).toEqual({});
      });

      it('should handle malformed entries', () => {
        const baggage: Record<string, string> = {};
        parseCommaSeparatedBaggage(baggage, 'key1=value1, malformed, key2=value2');

        expect(baggage).toEqual({
          key1: 'value1',
          key2: 'value2',
        });
      });
    });
  });

  describe('Module Exports', () => {
    it('should export all expected symbols from index', async () => {
      const coreModule = await import('../../src/index');

      // Core classes
      expect(coreModule.IOC).toBeDefined();
      expect(coreModule.Container).toBeDefined();
      expect(coreModule.Worker).toBeDefined();
      expect(coreModule.TaskBase).toBeDefined();
      expect(coreModule.SCProcessHandler).toBeDefined();

      // Strategies
      expect(coreModule.FailureStrategySimple).toBeDefined();
      expect(coreModule.SuccessStrategySimple).toBeDefined();

      // Logger
      expect(coreModule.NoopLogger).toBeDefined();

      // Utils
      expect(coreModule.isFunction).toBeDefined();
      expect(coreModule.isObject).toBeDefined();
      expect(coreModule.andArrayWith).toBeDefined();
      expect(coreModule.isArrayOfFunctions).toBeDefined();
      expect(coreModule.isEmptyArray).toBeDefined();
      expect(coreModule.parseCommaSeparatedBaggage).toBeDefined();
    });
  });
});

// Helper function to create mock messages
function createMockMessage(retries?: number): IMessage<unknown, IWorkflowProps> {
  return {
    body: { data: 'test' },
    properties: {
      activityId: 'test-activity',
      processInstanceId: 'test-instance',
      workflowDefinitionVersion: 1,
      bpmnProcessId: 'test-process',
      workflowInstanceKey: 'test-key',
      workflowKey: 'test-workflow-key',
      retries: retries,
    } as IWorkflowProps,
  };
}
