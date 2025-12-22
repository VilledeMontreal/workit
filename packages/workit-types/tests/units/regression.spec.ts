/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Regression tests for workit-types to ensure type definitions and exports remain stable
 * after package updates.
 */

import {
  // Core interfaces
  IMessage,
  IMessageBase,
  ICamundaService,
  IWorkflowProps,
  ISuccessStrategy,
  IFailureStrategy,
  // Common interfaces
  IPagination,
  IPaginationOptions,
  IPaging,
  ILogger,
  // Plugin interfaces
  IPluginConfig,
  HookState,
  // Exception classes
  FailureException,
  IncidentException,
  // Utilities
  ValidationFn,
  // HTTP interfaces
  IHeaders,
  IHttpOptions,
  // Camunda BPM interfaces
  ICamundaConfig,
  ICreateWorkflowInstance,
  // AWS interfaces
  IStepFunctionClientConfig,
  IAwsConfig,
  ISqsConfig,
} from '../../src';

describe('Regression Tests - workit-types Package Update Safety', () => {
  describe('Core Interface Exports', () => {
    it('should export IMessage interface', () => {
      const message: IMessage<unknown, IWorkflowProps> = {
        body: { data: 'test' },
        properties: {
          activityId: 'activity-1',
          processInstanceId: 'process-1',
          workflowDefinitionVersion: 1,
          bpmnProcessId: 'bpmn-1',
          workflowInstanceKey: 'key-1',
          workflowKey: 'workflow-key',
        } as IWorkflowProps,
      };

      expect(message.body).toBeDefined();
      expect(message.properties).toBeDefined();
    });

    it('should export IMessageBase interface', () => {
      const messageBase: IMessageBase<string, number> = {
        body: 'test',
        properties: 123,
      };

      expect(messageBase.body).toBe('test');
      expect(messageBase.properties).toBe(123);
    });
  });

  describe('Strategy Interface Exports', () => {
    it('should allow implementing ISuccessStrategy', () => {
      const mockStrategy: ISuccessStrategy<ICamundaService> = {
        handle: async (message: IMessage, service: ICamundaService) => {
          await service.ack(message);
        },
      };

      expect(typeof mockStrategy.handle).toBe('function');
    });

    it('should allow implementing IFailureStrategy', () => {
      const mockStrategy: IFailureStrategy<ICamundaService> = {
        handle: async (error: any, message: IMessage, service: ICamundaService) => {
          await service.nack(new FailureException('test', 3, 1000));
        },
      };

      expect(typeof mockStrategy.handle).toBe('function');
    });
  });

  describe('Exception Class Exports', () => {
    it('should export FailureException class', () => {
      const exception = new FailureException('Test failure', 3, 1000);

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(FailureException);
      expect(exception.message).toBe('Test failure');
      expect(exception.retries).toBe(3);
      expect(exception.retryTimeout).toBe(1000);
    });

    it('should export IncidentException class', () => {
      const exception = new IncidentException('Incident occurred');

      expect(exception).toBeInstanceOf(Error);
      expect(exception).toBeInstanceOf(IncidentException);
      expect(exception.message).toBe('Incident occurred');
    });

    it('should preserve stack trace in exceptions', () => {
      const failureException = new FailureException('Test');
      const incidentException = new IncidentException('Test');

      expect(failureException.stack).toBeDefined();
      expect(incidentException.stack).toBeDefined();
    });
  });

  describe('Plugin Interface Exports', () => {
    it('should export HookState enum', () => {
      expect(HookState).toBeDefined();
      expect(HookState.UNINITIALIZED).toBeDefined();
      expect(HookState.LOADED).toBeDefined();
      expect(HookState.UNLOADED).toBeDefined();
    });

    it('should allow implementing IPluginConfig', () => {
      const pluginConfig: IPluginConfig = {
        path: './plugins/test',
        enabled: true,
      };

      expect(pluginConfig.path).toBe('./plugins/test');
      expect(pluginConfig.enabled).toBe(true);
    });
  });

  describe('Pagination Interface Exports', () => {
    it('should export IPagination with correct structure', () => {
      const pagination: IPagination<{ id: number }> = {
        items: [{ id: 1 }, { id: 2 }],
        paging: {
          from: 0,
          size: 10,
          totalCount: 2,
        },
      };

      expect(pagination.items).toHaveLength(2);
      expect(pagination.paging.totalCount).toBe(2);
    });

    it('should export IPaginationOptions', () => {
      const options: IPaginationOptions = {
        from: 0,
        size: 25,
      };

      expect(options.from).toBe(0);
      expect(options.size).toBe(25);
    });

    it('should export IPaging', () => {
      const paging: IPaging = {
        from: 50,
        size: 25,
        totalCount: 100,
      };

      expect(paging.from).toBe(50);
      expect(paging.size).toBe(25);
      expect(paging.totalCount).toBe(100);
    });
  });

  describe('Logger Interface Exports', () => {
    it('should export ILogger interface', () => {
      const logger: ILogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      logger.debug('debug message');
      logger.info('info message');
      logger.warn('warn message');
      logger.error('error message');

      expect(logger.debug).toHaveBeenCalledWith('debug message');
      expect(logger.info).toHaveBeenCalledWith('info message');
      expect(logger.warn).toHaveBeenCalledWith('warn message');
      expect(logger.error).toHaveBeenCalledWith('error message');
    });
  });

  describe('HTTP Interface Exports', () => {
    it('should export IHeaders interface', () => {
      const headers: IHeaders = {
        'Content-Type': 'application/json',
        Authorization: 'Bearer token',
      };

      expect(headers['Content-Type']).toBe('application/json');
    });

    it('should export IHttpOptions interface', () => {
      const options: IHttpOptions = {
        headers: {},
        params: {},
      };

      expect(options.headers).toBeDefined();
      expect(options.params).toBeDefined();
    });
  });

  describe('Camunda BPM Interface Exports', () => {
    it('should export ICamundaConfig interface', () => {
      const config: Partial<ICamundaConfig> = {
        baseUrl: 'http://localhost:8080/engine-rest',
        workerId: 'test-worker',
        topicName: 'test-topic',
        maxTasks: 10,
        autoPoll: false,
      };

      expect(config.baseUrl).toBe('http://localhost:8080/engine-rest');
      expect(config.workerId).toBe('test-worker');
    });

    it('should export workflow-related interfaces', () => {
      const workflowInstance: ICreateWorkflowInstance = {
        bpmnProcessId: 'test-process',
        variables: {},
      };

      expect(workflowInstance.bpmnProcessId).toBe('test-process');
    });
  });

  describe('AWS Interface Exports', () => {
    it('should export IAwsConfig interface', () => {
      const config: IAwsConfig = {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
      };

      expect(config.region).toBe('us-east-1');
      expect(config.credentials.accessKeyId).toBe('test-access-key');
    });

    it('should export ISqsConfig interface', () => {
      const config: ISqsConfig = {
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue',
        waitTimeSeconds: 20,
        alwaysAcknowledge: true,
      };

      expect(config.queueUrl).toBeDefined();
      expect(config.waitTimeSeconds).toBe(20);
    });

    it('should export IStepFunctionClientConfig interface', () => {
      const config: IStepFunctionClientConfig = {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue',
      };

      expect(config.region).toBe('us-east-1');
      expect(config.queueUrl).toBeDefined();
    });
  });

  describe('ValidationFn Type Export', () => {
    it('should export ValidationFn type', () => {
      const validate: ValidationFn = (value: string): boolean => {
        return value !== null && value !== undefined;
      };

      expect(validate('test')).toBe(true);
    });
  });

  describe('Module Re-exports', () => {
    it('should re-export all types from index', async () => {
      const typesModule = await import('../../src/index');

      // Core
      expect(typesModule.FailureException).toBeDefined();
      expect(typesModule.IncidentException).toBeDefined();
      expect(typesModule.HookState).toBeDefined();

      // These should be type exports (interfaces), which won't be present at runtime
      // but the module should load without errors
      expect(typesModule).toBeDefined();
    });
  });
});
