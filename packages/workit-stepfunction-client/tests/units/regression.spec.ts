/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/**
 * Regression tests for workit-stepfunction-client to ensure no breaking changes after package updates.
 * Tests verify core functionality of AWS Step Functions client integration.
 */

import 'reflect-metadata';
import { IoC } from '@villedemontreal/workit-core';
import { SFnSQSClient, IConfig } from '../../src/sfnSQSClient';
import { SfnMessage } from '../../src/sfnMessage';
import { SERVICE_IDENTIFIER as SF_SERVICE_IDENTIFIER } from '../../src/config/constants/identifiers';

describe('Regression Tests - workit-stepfunction-client Package Update Safety', () => {
  describe('SFnSQSClient', () => {
    let config: IConfig;

    beforeEach(() => {
      config = {
        region: 'us-east-1',
        credentials: {
          accessKeyId: 'test-access-key',
          secretAccessKey: 'test-secret-key',
        },
        queueUrl: 'https://sqs.us-east-1.amazonaws.com/123456789/test-queue',
        topicName: 'test_topic',
        workerId: 'regression-test-worker',
      };

      // Setup IoC bindings
      if (IoC.isServiceBound(SF_SERVICE_IDENTIFIER.stepfunction_config)) {
        IoC.unbind(SF_SERVICE_IDENTIFIER.stepfunction_config);
      }
      IoC.bindToObject(config, SF_SERVICE_IDENTIFIER.stepfunction_config);
    });

    afterEach(() => {
      jest.clearAllMocks();
    });

    it('should be instantiable with config', () => {
      const client = new SFnSQSClient(config);
      expect(client).toBeInstanceOf(SFnSQSClient);
    });

    it('should implement IClient interface methods', () => {
      const client = new SFnSQSClient(config);

      expect(typeof client.subscribe).toBe('function');
      expect(typeof client.unsubscribe).toBe('function');
    });

    it('should implement IWorkflowClient interface methods', () => {
      const client = new SFnSQSClient(config);

      expect(typeof client.deployWorkflow).toBe('function');
      expect(typeof client.createWorkflowInstance).toBe('function');
      expect(typeof client.getWorkflows).toBe('function');
    });
  });

  describe('SfnMessage', () => {
    it('should wrap SQS message correctly', () => {
      const mockSqsMessage = {
        MessageId: 'test-message-id',
        ReceiptHandle: 'test-receipt-handle',
        Body: JSON.stringify({
          properties: {
            jobKey: 'test-task-token',
            activityId: 'test-activity-id',
            processInstanceId: 'test-process-instance',
            workflowInstanceKey: 'test-workflow-instance',
            workflowKey: 'test-workflow-key',
            bpmnProcessId: 'test-bpmn-process',
          },
          body: { key: 'value' },
        }),
      };

      const mockRepo = {
        sendTaskSuccess: jest.fn(),
        sendTaskFailure: jest.fn(),
      };

      const [message, service] = SfnMessage.wrap(mockSqsMessage as any, mockRepo as any);

      expect(message).toBeDefined();
      expect(message.properties).toBeDefined();
      expect(service).toBeDefined();
      expect(typeof service.ack).toBe('function');
      expect(typeof service.nack).toBe('function');
    });

    it('should handle message body parsing', () => {
      const testPayload = {
        properties: {
          jobKey: 'token-123',
          activityId: 'activity-456',
          processInstanceId: 'process-789',
          workflowInstanceKey: 'workflow-instance-key',
          workflowKey: 'workflow-key',
          bpmnProcessId: 'bpmn-process',
        },
        body: {
          customField: 'custom-value',
          nestedData: { inner: 'data' },
        },
      };

      const mockSqsMessage = {
        MessageId: 'msg-456',
        ReceiptHandle: 'receipt-789',
        Body: JSON.stringify(testPayload),
      };

      const mockRepo = {
        sendTaskSuccess: jest.fn(),
        sendTaskFailure: jest.fn(),
      };

      const [message] = SfnMessage.wrap(mockSqsMessage as any, mockRepo as any);

      expect(message.body).toBeDefined();
    });
  });

  describe('Service Identifier Constants', () => {
    it('should have expected service identifiers', () => {
      expect(SF_SERVICE_IDENTIFIER.stepfunction_config).toBeDefined();
      expect(SF_SERVICE_IDENTIFIER.stepfunction_repository).toBeDefined();
      expect(SF_SERVICE_IDENTIFIER.sqs_config).toBeDefined();

      expect(typeof SF_SERVICE_IDENTIFIER.stepfunction_config).toBe('symbol');
      expect(typeof SF_SERVICE_IDENTIFIER.stepfunction_repository).toBe('symbol');
      expect(typeof SF_SERVICE_IDENTIFIER.sqs_config).toBe('symbol');
    });
  });

  describe('Module Exports', () => {
    it('should export all expected symbols from index', async () => {
      const sfnClientModule = await import('../../src/index');

      // Main client
      expect(sfnClientModule.SFnSQSClient).toBeDefined();

      // Message handling
      expect(sfnClientModule.SfnMessage).toBeDefined();

      // Service identifiers
      expect(sfnClientModule.SERVICE_IDENTIFIER).toBeDefined();
    });
  });

  describe('AWS SDK Integration', () => {
    it('should properly import AWS SDK clients', async () => {
      const { SFNClient } = await import('@aws-sdk/client-sfn');
      const { SQSClient } = await import('@aws-sdk/client-sqs');

      expect(SFNClient).toBeDefined();
      expect(SQSClient).toBeDefined();
    });

    it('should be able to instantiate SFN client with region', async () => {
      const { SFNClient } = await import('@aws-sdk/client-sfn');

      const sfnClient = new SFNClient({ region: 'us-east-1' });
      expect(sfnClient).toBeInstanceOf(SFNClient);
    });

    it('should be able to instantiate SQS client with region', async () => {
      const { SQSClient } = await import('@aws-sdk/client-sqs');

      const sqsClient = new SQSClient({ region: 'us-east-1' });
      expect(sqsClient).toBeInstanceOf(SQSClient);
    });
  });

  describe('sqs-consumer Integration', () => {
    it('should properly import sqs-consumer', async () => {
      const sqsConsumer = await import('sqs-consumer');

      expect(sqsConsumer.Consumer).toBeDefined();
      expect(typeof sqsConsumer.Consumer.create).toBe('function');
    });
  });
});
