/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import {
  CreateStateMachineCommandInput,
  CreateStateMachineCommandOutput,
  StartExecutionCommandInput,
  StartExecutionCommandOutput,
  SendTaskSuccessCommandOutput,
  SendTaskFailureCommandOutput,
  SendTaskHeartbeatCommandOutput,
} from '@aws-sdk/client-sfn';
import { IMessage, IStepFunctionClientConfig, IncidentException } from '@villedemontreal/workit-types';
import * as fs from 'fs/promises';
import { StepFunctionRepository } from '../../src/repositories/stepFunctionRepository';
import { QUEUE_URL, sqsConfig } from '../utils/sqs';
import { MAX_ERROR_CAUSE_LENGTH, MAX_ERROR_CODE_LENGTH, MAX_PAYLOAD_LENGTH } from '../../src/config/constants/params';

// Mock dependencies
jest.mock('../../src/sfnClient');
jest.mock('fs/promises');
jest.mock('fast-safe-stringify', () => jest.fn().mockImplementation((obj) => JSON.stringify(obj)));

const mockedFs = fs as jest.Mocked<typeof fs>;

// Mock StepFunctionClient
const mockSend = jest.fn();
jest.mock('../../src/sfnClient', () => ({
  StepFunctionClient: jest.fn().mockImplementation(() => ({
    send: mockSend,
  })),
}));

describe('StepFunctionRepository', () => {
  let repository: StepFunctionRepository;
  let config: IStepFunctionClientConfig;

  // Helper function to create test messages
  const createMessage = (body: any, jobKey: string = 'test-task-token'): IMessage => ({
    body,
    properties: {
      jobKey,
      activityId: 'test-activity',
      processInstanceId: 'test-process',
    } as any,
  });

  beforeEach(() => {
    jest.clearAllMocks();

    config = {
      queueUrl: QUEUE_URL,
      ...sqsConfig,
    } as IStepFunctionClientConfig;

    repository = new StepFunctionRepository(config);
  });

  it('should be an instance of StepFunctionRepository', () => {
    expect(repository).toBeInstanceOf(StepFunctionRepository);
    expect(repository['_config']).toBe(config);
    expect(repository['_client']).toBeDefined();
  });

  describe('deployWorkflow', () => {
    const mockWorkflowContent = '{"Comment": "A simple minimal example"}';
    const mockWorkflowPath = '/path/to/workflow.json';

    beforeEach(() => {
      mockedFs.readFile.mockResolvedValue(Buffer.from(mockWorkflowContent));
    });

    it('should deploy workflow successfully', async () => {
      const mockOutput: CreateStateMachineCommandOutput = {
        stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:TestStateMachine',
        creationDate: new Date(),
        $metadata: {},
      };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.deployWorkflow(mockWorkflowPath);

      expect(mockedFs.readFile).toHaveBeenCalledWith(mockWorkflowPath);
      expect(mockSend).toHaveBeenCalledTimes(1);
      
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('CreateStateMachineCommand');
      expect(command.input).toEqual({
        definition: mockWorkflowContent,
      });
      expect(result).toBe(mockOutput);
    });

    it('should deploy workflow with override parameters', async () => {
      const mockOutput: CreateStateMachineCommandOutput = {
        stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:CustomStateMachine',
        creationDate: new Date(),
        $metadata: {},
      };
      const override: CreateStateMachineCommandInput = {
        name: 'CustomStateMachine',
        roleArn: 'arn:aws:iam::123456789012:role/StepFunctionRole',
        type: 'STANDARD',
        definition: 'placeholder-definition',
      };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.deployWorkflow(mockWorkflowPath, override);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual(
        expect.objectContaining({
          ...override,
          definition: expect.any(String),
        })
      );
      expect(result).toBe(mockOutput);
    });

    it('should handle file read errors', async () => {
      const fileError = new Error('File not found');
      mockedFs.readFile.mockRejectedValue(fileError);

      await expect(repository.deployWorkflow(mockWorkflowPath)).rejects.toThrow('File not found');
      expect(mockSend).not.toHaveBeenCalled();
    });
  });

  describe('startExecution', () => {
    it('should start execution successfully', async () => {
      const executionInput: StartExecutionCommandInput = {
        stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:TestStateMachine',
        input: '{"key": "value"}',
        name: 'test-execution',
      };
      const mockOutput: StartExecutionCommandOutput = {
        executionArn: 'arn:aws:states:us-east-1:123456789012:execution:TestStateMachine:test-execution',
        startDate: new Date(),
        $metadata: {},
      };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.startExecution(executionInput);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('StartExecutionCommand');
      expect(command.input).toBe(executionInput);
      expect(result).toBe(mockOutput);
    });

    it('should handle execution start errors', async () => {
      const executionInput: StartExecutionCommandInput = {
        stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:InvalidStateMachine',
        input: '{}',
      };
      const awsError = new Error('StateMachineDoesNotExist');
      mockSend.mockRejectedValue(awsError);

      await expect(repository.startExecution(executionInput)).rejects.toThrow('StateMachineDoesNotExist');
    });
  });

  describe('sendTaskSuccess', () => {
    it('should send task success with valid payload', async () => {
      const message = createMessage({ result: 'success' });
      const mockOutput: SendTaskSuccessCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.sendTaskSuccess(message);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('SendTaskSuccessCommand');
      expect(command.input).toEqual({
        output: JSON.stringify({ result: 'success' }),
        taskToken: 'test-task-token',
      });
      expect(result).toBe(mockOutput);
    });

    it('should send task success with empty body', async () => {
      const message = createMessage(null);
      const mockOutput: SendTaskSuccessCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.sendTaskSuccess(message);

      const command = mockSend.mock.calls[0][0];
      expect(command.input).toEqual({
        output: '{}',
        taskToken: 'test-task-token',
      });
      expect(result).toBe(mockOutput);
    });

    it('should throw IncidentException when payload exceeds size limit', () => {
      const largePayload = { data: 'x'.repeat(MAX_PAYLOAD_LENGTH) };
      const message = createMessage(largePayload);

      expect(() => repository.sendTaskSuccess(message)).toThrow(IncidentException);
      expect(() => repository.sendTaskSuccess(message)).toThrow("payload (message.body) can't exceed 256KB");
      expect(mockSend).not.toHaveBeenCalled();
    });

    it('should handle complex nested objects', async () => {
      const complexPayload = {
        user: { id: 123, name: 'John', preferences: { theme: 'dark', notifications: true } },
        items: [{ id: 1, name: 'Item 1' }, { id: 2, name: 'Item 2' }],
        metadata: { timestamp: '2023-01-01T00:00:00Z', version: '1.0' },
      };
      const message = createMessage(complexPayload);
      const mockOutput: SendTaskSuccessCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      await repository.sendTaskSuccess(message);

      const command = mockSend.mock.calls[0][0];
      expect(command.input.output).toBe(JSON.stringify(complexPayload));
    });
  });

  describe('sendTaskFailure', () => {
    it('should send task failure with error code', async () => {
      const error: NodeJS.ErrnoException = {
        name: 'TestError',
        code: 'TEST_ERROR_CODE',
        message: 'Test error message',
      };
      const message = createMessage({ data: 'test' });
      const mockOutput: SendTaskFailureCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.sendTaskFailure(error, message);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('SendTaskFailureCommand');
      expect(command.input).toEqual({
        cause: JSON.stringify(error),
        taskToken: 'test-task-token',
        error: 'TEST_ERROR_CODE',
      });
      expect(result).toBe(mockOutput);
    });

    it('should use error name when code is not available', async () => {
      const error: NodeJS.ErrnoException = {
        name: 'CustomError',
        message: 'Custom error message',
      };
      const message = createMessage({ data: 'test' });
      const mockOutput: SendTaskFailureCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      await repository.sendTaskFailure(error, message);

      const command = mockSend.mock.calls[0][0];
      expect(command.input.error).toBe('CustomError');
    });

    it('should truncate error code when exceeding maximum length', async () => {
      const longErrorCode = 'VERY_LONG_ERROR_CODE_'.repeat(50);
      const error: NodeJS.ErrnoException = {
        name: 'LongError',
        code: longErrorCode,
        message: 'Error with very long code',
      };
      const message = createMessage({ data: 'test' });
      const mockOutput: SendTaskFailureCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      await repository.sendTaskFailure(error, message);

      const command = mockSend.mock.calls[0][0];
      expect(command.input.error).toHaveLength(MAX_ERROR_CODE_LENGTH);
      expect(command.input.error).toBe(longErrorCode.substring(0, MAX_ERROR_CODE_LENGTH));
    });

    it('should truncate error cause when exceeding maximum length', async () => {
      const largeError: NodeJS.ErrnoException = {
        name: 'LargeError',
        code: 'LARGE_ERROR',
        message: 'Large error message',
        stack: 'x'.repeat(MAX_ERROR_CAUSE_LENGTH + 1000),
      };
      const message = createMessage({ data: 'test' });
      const mockOutput: SendTaskFailureCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      // Mock fast-safe-stringify to return a long string
      const stringify = require('fast-safe-stringify');
      const longString = 'y'.repeat(MAX_ERROR_CAUSE_LENGTH + 500);
      stringify.mockReturnValue(longString);

      await repository.sendTaskFailure(largeError, message);

      const command = mockSend.mock.calls[0][0];
      expect(command.input.cause).toHaveLength(MAX_ERROR_CAUSE_LENGTH);
      expect(command.input.cause).toBe(longString.substring(0, MAX_ERROR_CAUSE_LENGTH));
    });
  });

  describe('sendTaskHeartbeat', () => {
    it('should send task heartbeat successfully', async () => {
      const message = createMessage({ data: 'test' });
      const mockOutput: SendTaskHeartbeatCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      const result = await repository.sendTaskHeartbeat(message);

      expect(mockSend).toHaveBeenCalledTimes(1);
      const command = mockSend.mock.calls[0][0];
      expect(command.constructor.name).toBe('SendTaskHeartbeatCommand');
      expect(command.input).toEqual({
        taskToken: 'test-task-token',
      });
      expect(result).toBe(mockOutput);
    });

    it('should handle different task tokens', async () => {
      const message = createMessage({ data: 'test' }, 'custom-task-token-123');
      const mockOutput: SendTaskHeartbeatCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValue(mockOutput);

      await repository.sendTaskHeartbeat(message);

      const command = mockSend.mock.calls[0][0];
      expect(command.input.taskToken).toBe('custom-task-token-123');
    });

    it('should handle AWS SDK errors', async () => {
      const message = createMessage({ data: 'test' });
      const awsError = new Error('TaskTimedOut');
      mockSend.mockRejectedValue(awsError);

      await expect(repository.sendTaskHeartbeat(message)).rejects.toThrow('TaskTimedOut');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complete workflow lifecycle', async () => {
      // Deploy workflow
      mockedFs.readFile.mockResolvedValue(Buffer.from('{"Comment": "Test workflow"}'));
      const deployOutput: CreateStateMachineCommandOutput = {
        stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:TestWorkflow',
        creationDate: new Date(),
        $metadata: {},
      };
      mockSend.mockResolvedValueOnce(deployOutput);

      await repository.deployWorkflow('/path/to/workflow.json');

      // Start execution
      const executionOutput: StartExecutionCommandOutput = {
        executionArn: 'arn:aws:states:us-east-1:123456789012:execution:TestWorkflow:test-exec',
        startDate: new Date(),
        $metadata: {},
      };
      mockSend.mockResolvedValueOnce(executionOutput);

      await repository.startExecution({
        stateMachineArn: 'arn:aws:states:us-east-1:123456789012:stateMachine:TestWorkflow',
        input: '{"data": "test"}',
        name: 'test-exec',
      });

      // Send heartbeat
      const heartbeatOutput: SendTaskHeartbeatCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValueOnce(heartbeatOutput);

      const message = {
        body: { result: 'processing' },
        properties: { jobKey: 'task-token-123' },
      } as IMessage;

      await repository.sendTaskHeartbeat(message);

      // Send success
      const successOutput: SendTaskSuccessCommandOutput = { $metadata: {} };
      mockSend.mockResolvedValueOnce(successOutput);

      await repository.sendTaskSuccess(message);

      expect(mockSend).toHaveBeenCalledTimes(4);
    });
  });
});
