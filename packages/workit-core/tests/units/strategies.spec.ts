/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { ICamundaService, ILogger, IMessage, IWorkflowProps } from '@villedemontreal/workit-types';
import { FailureStrategySimple } from '../../src/strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../../src/strategies/SuccessStrategySimple';

// Mock logger
const mockLogger: ILogger = {
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
};

// Mock Camunda service
const mockCamundaService: ICamundaService = {
  ack: jest.fn(),
  nack: jest.fn(),
} as any;

// Mock message
const createMockMessage = (retries?: number): IMessage<unknown, IWorkflowProps> => ({
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
});

describe('Strategy Classes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('SuccessStrategySimple', () => {
    let successStrategy: SuccessStrategySimple;

    beforeEach(() => {
      successStrategy = new SuccessStrategySimple();
    });

    it('should be instantiated correctly', () => {
      expect(successStrategy).toBeInstanceOf(SuccessStrategySimple);
    });

    it('should call service.ack with the message', async () => {
      const message = createMockMessage();
      const mockAck = jest.fn().mockResolvedValue(undefined);
      const service = { ...mockCamundaService, ack: mockAck };

      await successStrategy.handle(message, service);

      expect(mockAck).toHaveBeenCalledTimes(1);
      expect(mockAck).toHaveBeenCalledWith(message);
    });

    it('should propagate errors from service.ack', async () => {
      const message = createMockMessage();
      const error = new Error('Ack failed');
      const mockAck = jest.fn().mockRejectedValue(error);
      const service = { ...mockCamundaService, ack: mockAck };

      await expect(successStrategy.handle(message, service)).rejects.toThrow('Ack failed');
      expect(mockAck).toHaveBeenCalledWith(message);
    });

    it('should handle service.ack returning undefined', async () => {
      const message = createMockMessage();
      const mockAck = jest.fn().mockResolvedValue(undefined);
      const service = { ...mockCamundaService, ack: mockAck };

      const result = await successStrategy.handle(message, service);

      expect(result).toBeUndefined();
      expect(mockAck).toHaveBeenCalledWith(message);
    });
  });

  describe('FailureStrategySimple', () => {
    let failureStrategy: FailureStrategySimple;

    describe('with custom logger', () => {
      beforeEach(() => {
        failureStrategy = new FailureStrategySimple(mockLogger);
      });

      it('should be instantiated correctly with custom logger', () => {
        expect(failureStrategy).toBeInstanceOf(FailureStrategySimple);
      });

      it('should log debug warning about production usage', () => {
        expect(mockLogger.debug).toHaveBeenCalledWith(
          'warning: You should not use this failure strategy class in production'
        );
      });
    });

    describe('with no logger (uses NOOP_LOGGER)', () => {
      beforeEach(() => {
        failureStrategy = new FailureStrategySimple();
      });

      it('should be instantiated correctly with NOOP logger', () => {
        expect(failureStrategy).toBeInstanceOf(FailureStrategySimple);
      });
    });

    describe('error handling logic', () => {
      beforeEach(() => {
        failureStrategy = new FailureStrategySimple(mockLogger);
        jest.clearAllMocks(); // Clear the constructor debug call
      });

      it('should handle error with no existing retries (sets retries to 1)', async () => {
        const error = new Error('Task failed');
        const message = createMockMessage(); // no retries property
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, message, service);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":"Task failed"')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retries":1')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retryTimeout":2000')
        );

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: 1,
          retryTimeout: 2000,
        });
      });

      it('should increment existing retries', async () => {
        const error = new Error('Task failed again');
        const message = createMockMessage(3); // existing retries = 3
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, message, service);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":"Task failed again"')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retries":4')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retryTimeout":8000')
        );

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: 4,
          retryTimeout: 8000,
        });
      });

      it('should reset retries to 0 when exceeding 20', async () => {
        const error = new Error('Task failed too many times');
        const message = createMockMessage(21); // retries = 21, should become 22, then reset to 0
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, message, service);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":"Task failed too many times"')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retries":0')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retryTimeout":0')
        );

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: 0,
          retryTimeout: 0,
        });
      });

      it('should exactly hit retry limit of 20', async () => {
        const error = new Error('Task at limit');
        const message = createMockMessage(20); // retries = 20, should become 21 and not reset
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, message, service);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":"Task at limit"')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retries":0')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retryTimeout":0')
        );

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: 0,
          retryTimeout: 0,
        });
      });

      it('should calculate retry timeout correctly', async () => {
        const testCases = [
          { inputRetries: undefined, expectedRetries: 1, expectedTimeout: 2000 },
          { inputRetries: 1, expectedRetries: 2, expectedTimeout: 4000 },
          { inputRetries: 5, expectedRetries: 6, expectedTimeout: 12000 },
          { inputRetries: 10, expectedRetries: 11, expectedTimeout: 22000 },
        ];

        for (const testCase of testCases) {
          jest.clearAllMocks();
          const error = new Error('Test error');
          const message = createMockMessage(testCase.inputRetries);
          const mockNack = jest.fn().mockResolvedValue(undefined);
          const service = { ...mockCamundaService, nack: mockNack };

          await failureStrategy.handle(error, message, service);

          expect(mockNack).toHaveBeenCalledWith({
            ...error,
            retries: testCase.expectedRetries,
            retryTimeout: testCase.expectedTimeout,
          });
        }
      });

      it('should handle complex error objects in errorDetails', async () => {
        const complexError = new Error('Complex error');
        (complexError as any).customProperty = { nested: 'value' };
        (complexError as any).stack = 'Error: Complex error\n    at test';

        const message = createMockMessage();
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(complexError, message, service);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":"Complex error"')
        );
      });

      it('should propagate service.nack errors', async () => {
        const originalError = new Error('Task failed');
        const nackError = new Error('Nack failed');
        const message = createMockMessage();
        const mockNack = jest.fn().mockRejectedValue(nackError);
        const service = { ...mockCamundaService, nack: mockNack };

        await expect(failureStrategy.handle(originalError, message, service)).rejects.toThrow('Nack failed');
        expect(mockNack).toHaveBeenCalled();
      });

      it('should handle errors without message property', async () => {
        const errorWithoutMessage = new Error();
        errorWithoutMessage.message = ''; // Empty message
        const message = createMockMessage();
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(errorWithoutMessage, message, service);

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":""')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retries":1')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retryTimeout":2000')
        );
      });

      it('should handle custom error types', async () => {
        class CustomError extends Error {
          public code: string;
          constructor(message: string, code: string) {
            super(message);
            this.code = code;
            this.name = 'CustomError';
          }
        }

        const customError = new CustomError('Custom failure', 'CUSTOM_CODE');
        const message = createMockMessage();
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(customError, message, service);

        expect(mockNack).toHaveBeenCalledWith({
          ...customError,
          retries: 1,
          retryTimeout: 2000,
        });

        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"errorMessage":"Custom failure"')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retries":1')
        );
        expect(mockLogger.debug).toHaveBeenCalledWith(
          expect.stringContaining('"retryTimeout":2000')
        );
      });
    });

    describe('edge cases', () => {
      beforeEach(() => {
        failureStrategy = new FailureStrategySimple(mockLogger);
        jest.clearAllMocks();
      });

      it('should handle message with retries = 0', async () => {
        const error = new Error('Zero retries');
        const message = createMockMessage(0);
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, message, service);

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: 1, // 0 + 1 = 1
          retryTimeout: 2000,
        });
      });

      it('should handle negative retries', async () => {
        const error = new Error('Negative retries');
        const message = createMockMessage(-5);
        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, message, service);

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: -4, // -5 + 1 = -4
          retryTimeout: -8000, // 1000 * -4 * 2
        });
      });

      it('should handle message properties without retries property', async () => {
        const error = new Error('No retries property');
        const messageWithoutRetries = {
          body: { data: 'test' },
          properties: {
            activityId: 'test-activity',
            processInstanceId: 'test-instance',
            // no retries property
          } as any,
        };

        const mockNack = jest.fn().mockResolvedValue(undefined);
        const service = { ...mockCamundaService, nack: mockNack };

        await failureStrategy.handle(error, messageWithoutRetries, service);

        expect(mockNack).toHaveBeenCalledWith({
          ...error,
          retries: 1,
          retryTimeout: 2000,
        });
      });
    });
  });

  describe('integration scenarios', () => {
    it('should work together in a workflow scenario', async () => {
      const successStrategy = new SuccessStrategySimple();
      const failureStrategy = new FailureStrategySimple(mockLogger);
      
      const message = createMockMessage();
      const mockService = {
        ack: jest.fn().mockResolvedValue(undefined),
        nack: jest.fn().mockResolvedValue(undefined),
      } as any;

      // Test successful completion
      await successStrategy.handle(message, mockService);
      expect(mockService.ack).toHaveBeenCalledWith(message);

      // Test failure handling
      jest.clearAllMocks();
      const error = new Error('Workflow task failed');
      await failureStrategy.handle(error, message, mockService);
      expect(mockService.nack).toHaveBeenCalledWith({
        ...error,
        retries: 1,
        retryTimeout: 2000,
      });
    });
  });
});