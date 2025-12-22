/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Regression tests for workit-bpm-client to ensure no breaking changes after package updates.
 * Tests verify core functionality of Camunda BPM client integration.
 */

import 'reflect-metadata';
import { IoC } from '@villedemontreal/workit-core';
import { Client as CamundaExternalClient } from 'camunda-external-task-client-js';
import { CamundaBpmClient } from '../../src/camundaBpmClient';
import { CamundaMessage } from '../../src/camundaMessage';
import { Utils } from '../../src/utils/utils';
import { SERVICE_IDENTIFIER } from '../../src/config/constants/identifiers';
import { logger } from '../../src/logger';

describe('Regression Tests - workit-bpm-client Package Update Safety', () => {
  describe('CamundaBpmClient', () => {
    let client: CamundaBpmClient;
    let mockCamundaClient: {
      subscribe: jest.Mock;
      start: jest.Mock;
      stop: jest.Mock;
    };
    let config: any;

    beforeEach(() => {
      config = {
        maxTasks: 1,
        workerId: 'regression-test-worker',
        baseUrl: 'http://localhost:8080/engine-rest',
        topicName: 'regression_test_topic',
        bpmnKey: 'REGRESSION_TEST_PROCESS',
        autoPoll: false,
      };

      IoC.unbind(SERVICE_IDENTIFIER.logger);
      IoC.bindToObject(logger, SERVICE_IDENTIFIER.logger);

      const camundaConfig = Utils.buildConfig(config);
      mockCamundaClient = new CamundaExternalClient(camundaConfig) as any;

      mockCamundaClient.subscribe = jest.fn().mockReturnValue({ unsubscribe: jest.fn() });
      mockCamundaClient.start = jest.fn().mockReturnValue(undefined);
      mockCamundaClient.stop = jest.fn().mockReturnValue(undefined);

      client = new CamundaBpmClient(camundaConfig, mockCamundaClient as any);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be instantiable', () => {
      expect(client).toBeInstanceOf(CamundaBpmClient);
    });

    it('should call subscribe and start on client subscription', async () => {
      const handler = jest.fn().mockResolvedValue(undefined);
      await client.subscribe(handler);

      expect(mockCamundaClient.subscribe).toHaveBeenCalledTimes(1);
      expect(mockCamundaClient.start).toHaveBeenCalledTimes(1);
    });

    it('should call stop on unsubscribe', async () => {
      await client.unsubscribe();
      expect(mockCamundaClient.stop).toHaveBeenCalledTimes(1);
    });
  });

  describe('Utils', () => {
    describe('buildConfig', () => {
      it('should build configuration with default values', () => {
        const input = {
          workerId: 'test-worker',
          baseUrl: 'http://localhost:8080/engine-rest',
          topicName: 'test_topic',
        };

        const result = Utils.buildConfig(input);

        expect(result).toHaveProperty('workerId', 'test-worker');
        expect(result).toHaveProperty('baseUrl', 'http://localhost:8080/engine-rest');
        expect(result).toHaveProperty('topicName', 'test_topic');
        expect(result).toHaveProperty('maxTasks', 1);
      });

      it('should respect provided maxTasks', () => {
        const input = {
          workerId: 'test-worker',
          baseUrl: 'http://localhost:8080/engine-rest',
          topicName: 'test_topic',
          maxTasks: 5,
        };

        const result = Utils.buildConfig(input);

        expect(result).toHaveProperty('maxTasks', 5);
      });
    });
  });

  describe('CamundaMessage', () => {
    it('should wrap Camunda task object correctly', () => {
      const mockTask = {
        activityId: 'test-activity',
        processInstanceId: 'test-process-instance',
        processDefinitionKey: 'test-process-key',
        processDefinitionId: 'test-process-key:1:12345',
        workerId: 'test-worker',
        id: 'task-id',
        variables: {
          getAll: () => ({}),
          get: (key: string) => undefined,
        },
      };

      const mockTaskService = {
        complete: jest.fn(),
        handleFailure: jest.fn(),
        handleBpmnError: jest.fn(),
        extendLock: jest.fn(),
      };

      const [message, service] = CamundaMessage.wrap({ task: mockTask as any, taskService: mockTaskService });

      expect(message).toBeDefined();
      expect(message.properties).toHaveProperty('activityId', 'test-activity');
      expect(service).toBeDefined();
      expect(typeof service.ack).toBe('function');
      expect(typeof service.nack).toBe('function');
    });
  });

  describe('Module Exports', () => {
    it('should export all expected symbols from index', async () => {
      const bpmClientModule = await import('../../src/index');

      // Main client
      expect(bpmClientModule.CamundaBpmClient).toBeDefined();

      // Message handling
      expect(bpmClientModule.CamundaMessage).toBeDefined();

      // Utils
      expect(bpmClientModule.Utils).toBeDefined();

      // Service identifier
      expect(bpmClientModule.SERVICE_IDENTIFIER).toBeDefined();

      // Logger
      expect(bpmClientModule.logger).toBeDefined();
    });
  });

  describe('Service Identifier Constants', () => {
    it('should have expected service identifiers', () => {
      expect(SERVICE_IDENTIFIER.logger).toBeDefined();
      expect(typeof SERVICE_IDENTIFIER.logger).toBe('symbol');
    });
  });

  describe('Logger', () => {
    it('should be defined and have success and error methods', () => {
      expect(logger).toBeDefined();
      expect(typeof logger.success).toBe('function');
      expect(typeof logger.error).toBe('function');
    });
  });
});
