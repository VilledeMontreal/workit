/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IVariablePayload, IWorkflowProps } from '@villedemontreal/workit-types';
import { CamundaMapperProperties } from '../../src/camundaMapperProperties';

describe('CamundaMapperProperties', () => {
  const createMockTask = (overrides?: Partial<IVariablePayload>): IVariablePayload => {
    const mockVariables = new Map();
    mockVariables.set('testVar', { value: 'test', type: 'string' });

    return {
      id: 'task-123',
      activityId: 'activity-456',
      businessKey: 'business-789',
      processInstanceId: 'instance-abc',
      processDefinitionId: 'process:1:def456',
      processDefinitionKey: 'test-process',
      retries: 3,
      topicName: 'test-topic',
      workerId: 'worker-123',
      lockExpirationTime: '2023-12-01T10:00:00.000Z',
      variables: mockVariables,
      ...overrides,
    } as IVariablePayload;
  };

  describe('map', () => {
    it('should map basic task properties correctly', () => {
      const task = createMockTask();
      const result = CamundaMapperProperties.map(task);

      expect(result.activityId).toBe('activity-456');
      expect(result.businessKey).toBe('business-789');
      expect(result.processInstanceId).toBe('instance-abc');
      expect(result.workflowInstanceKey).toBe('process:1:def456');
      expect(result.workflowKey).toBe('test-process');
      expect(result.bpmnProcessId).toBe('test-process');
      expect(result.jobKey).toBe('task-123');
      expect(result.retries).toBe(3);
      expect(result.topicName).toBe('test-topic');
      expect(result.workerId).toBe('worker-123');
    });

    it('should extract workflow definition version from processDefinitionId', () => {
      const task = createMockTask({
        processDefinitionId: 'myProcess:5:abc123def',
      });

      const result = CamundaMapperProperties.map(task);

      expect(result.workflowDefinitionVersion).toBe(5);
    });

    it('should handle different processDefinitionId formats', () => {
      const testCases = [
        { input: 'process:1:id123', expectedVersion: 1 },
        { input: 'complexProcess:10:longId456', expectedVersion: 10 },
        { input: 'test:999:shortId', expectedVersion: 999 },
      ];

      testCases.forEach(({ input, expectedVersion }) => {
        const task = createMockTask({
          processDefinitionId: input,
        });

        const result = CamundaMapperProperties.map(task);
        expect(result.workflowDefinitionVersion).toBe(expectedVersion);
      });
    });

    it('should convert lockExpirationTime to Date object', () => {
      const lockTime = '2023-12-01T15:30:00.000Z';
      const task = createMockTask({
        lockExpirationTime: lockTime,
      });

      const result = CamundaMapperProperties.map(task);

      expect(result.lockExpirationTime).toBeInstanceOf(Date);
      expect(result.lockExpirationTime.toISOString()).toBe(lockTime);
    });

    it('should handle lockExpirationTime as number (timestamp)', () => {
      const timestamp = 1701439800000; // 2023-12-01T15:30:00.000Z
      const task = createMockTask({
        lockExpirationTime: timestamp as any,
      });

      const result = CamundaMapperProperties.map(task);

      expect(result.lockExpirationTime).toBeInstanceOf(Date);
      expect(result.lockExpirationTime.getTime()).toBe(timestamp);
    });

    it('should extract custom headers from _meta variable', () => {
      const mockVariables = new Map();
      const customHeaders = {
        Authorization: 'Bearer token123',
        'X-Custom-Header': 'custom-value',
      };
      mockVariables.set('_meta', { customHeaders });
      mockVariables.set('otherVar', { value: 'other', type: 'string' });

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual(customHeaders);
    });

    it('should return empty object for custom headers when no _meta', () => {
      const mockVariables = new Map();
      mockVariables.set('regularVar', { value: 'test', type: 'string' });

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual({});
    });

    it('should return empty object for custom headers when _meta has no customHeaders', () => {
      const mockVariables = new Map();
      mockVariables.set('_meta', { otherProperty: 'value' });

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual({});
    });

    it('should handle missing optional properties', () => {
      const minimalTask: IVariablePayload = {
        id: 'task-minimal',
        activityId: 'activity-minimal',
        activityInstanceId: 'activity-instance-minimal',
        errorMessage: null,
        errorDetails: null,
        executionId: 'execution-minimal',
        processDefinitionId: 'process:1:minimal',
        processDefinitionKey: 'minimal-process',
        processInstanceId: null as any,
        lockExpirationTime: '2023-12-01T10:00:00.000Z',
        retries: null,
        suspended: false,
        workerId: null as any,
        topicName: null as any,
        tenantId: null,
        variables: new Map(),
        priority: 0,
        businessKey: null,
      };

      const result = CamundaMapperProperties.map(minimalTask);

      expect(result.activityId).toBe('activity-minimal');
      expect(result.businessKey).toBeUndefined();
      expect(result.processInstanceId).toBeUndefined();
      expect(result.retries).toBeUndefined();
      expect(result.topicName).toBeUndefined();
      expect(result.workerId).toBeUndefined();
      expect(result.customHeaders).toEqual({});
    });

    it('should handle zero retries correctly', () => {
      const task = createMockTask({ retries: 0 });
      const result = CamundaMapperProperties.map(task);

      expect(result.retries).toBe(0);
    });

    it('should handle negative retries', () => {
      const task = createMockTask({ retries: -1 });
      const result = CamundaMapperProperties.map(task);

      expect(result.retries).toBe(-1);
    });

    it('should preserve all IWorkflowProps properties', () => {
      const task = createMockTask();
      const result = CamundaMapperProperties.map(task);

      // Verify that all expected IWorkflowProps properties are present
      const expectedProperties = [
        'activityId',
        'businessKey',
        'processInstanceId',
        'workflowDefinitionVersion',
        'workflowInstanceKey',
        'workflowKey',
        'bpmnProcessId',
        'customHeaders',
        'jobKey',
        'retries',
        'topicName',
        'workerId',
        'lockExpirationTime',
      ];

      expectedProperties.forEach((prop) => {
        expect(result).toHaveProperty(prop);
      });
    });

    it('should handle complex processDefinitionKey values', () => {
      const complexKeys = [
        'simple-process',
        'process.with.dots',
        'process_with_underscores',
        'process-with-many-hyphens',
        'ProcessWithCamelCase',
      ];

      complexKeys.forEach((key) => {
        const task = createMockTask({
          processDefinitionKey: key,
        });

        const result = CamundaMapperProperties.map(task);

        expect(result.workflowKey).toBe(key);
        expect(result.bpmnProcessId).toBe(key);
      });
    });
  });

  describe('unmap', () => {
    it('should throw not implemented error', () => {
      const props: IWorkflowProps = {
        activityId: 'test',
        workflowDefinitionVersion: 1,
        workflowInstanceKey: 'test',
        workflowKey: 'test',
        bpmnProcessId: 'test',
        customHeaders: {},
        jobKey: 'test',
        lockExpirationTime: new Date(),
        processInstanceId: 'test-instance',
        retries: 3,
        topicName: 'test-topic',
        workerId: 'test-worker',
      };

      expect(() => CamundaMapperProperties.unmap(props)).toThrow('Not Implemented yet');
    });
  });

  describe('edge cases and error handling', () => {
    it('should handle processDefinitionId with unexpected format', () => {
      const task = createMockTask({
        processDefinitionId: 'invalid-format-without-colons',
      });

      // Should not throw, but version extraction might be NaN
      const result = CamundaMapperProperties.map(task);

      // If split fails, [1] would be undefined, Number(undefined) is NaN
      expect(isNaN(result.workflowDefinitionVersion)).toBe(true);
    });

    it('should handle empty processDefinitionId', () => {
      const task = createMockTask({
        processDefinitionId: '',
      });

      const result = CamundaMapperProperties.map(task);
      expect(isNaN(result.workflowDefinitionVersion)).toBe(true);
      expect(result.workflowInstanceKey).toBe('');
    });

    it('should handle variables Map with undefined values', () => {
      const mockVariables = new Map();
      mockVariables.set('_meta', undefined);
      mockVariables.set('normalVar', { value: 'test', type: 'string' });

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual({});
    });

    it('should handle variables Map with null _meta', () => {
      const mockVariables = new Map();
      mockVariables.set('_meta', null);

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual({});
    });

    it('should handle _meta with null customHeaders', () => {
      const mockVariables = new Map();
      mockVariables.set('_meta', { customHeaders: null });

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual({});
    });

    it('should handle _meta with non-object customHeaders', () => {
      const mockVariables = new Map();
      mockVariables.set('_meta', { customHeaders: 'not-an-object' });

      const task = createMockTask({ variables: mockVariables });
      const result = CamundaMapperProperties.map(task);

      expect(result.customHeaders).toEqual({});
    });
  });

  describe('integration with real-world data', () => {
    it('should handle typical Camunda external task payload', () => {
      const mockVariables = new Map();
      mockVariables.set('orderId', { value: 'ORD-12345', type: 'string' });
      mockVariables.set('amount', { value: 150.75, type: 'double' });
      mockVariables.set('customer', {
        value: JSON.stringify({ id: 'CUST-001', name: 'John Doe' }),
        type: 'json',
      });
      mockVariables.set('_meta', {
        customHeaders: {
          'X-Correlation-ID': 'correlation-abc123',
          'X-Request-ID': 'request-def456',
        },
      });

      const realWorldTask: IVariablePayload = {
        id: '550e8400-e29b-41d4-a716-446655440000',
        activityId: 'Activity_ProcessOrder',
        activityInstanceId: 'activity-instance-789',
        errorMessage: null,
        errorDetails: null,
        executionId: 'execution-789',
        businessKey: 'ORDER_ORD-12345',
        processInstanceId: 'process-instance-789',
        processDefinitionId: 'OrderProcess:3:deployment-123',
        processDefinitionKey: 'OrderProcess',
        retries: 3,
        suspended: false,
        topicName: 'process-order-topic',
        workerId: 'order-worker-001',
        tenantId: null,
        lockExpirationTime: '2023-12-01T10:05:00.000Z',
        variables: mockVariables,
        priority: 50,
      };

      const result = CamundaMapperProperties.map(realWorldTask);

      expect(result).toEqual({
        activityId: 'Activity_ProcessOrder',
        businessKey: 'ORDER_ORD-12345',
        processInstanceId: 'process-instance-789',
        workflowDefinitionVersion: 3,
        workflowInstanceKey: 'OrderProcess:3:deployment-123',
        workflowKey: 'OrderProcess',
        bpmnProcessId: 'OrderProcess',
        customHeaders: {
          'X-Correlation-ID': 'correlation-abc123',
          'X-Request-ID': 'request-def456',
        },
        jobKey: '550e8400-e29b-41d4-a716-446655440000',
        retries: 3,
        topicName: 'process-order-topic',
        workerId: 'order-worker-001',
        lockExpirationTime: new Date('2023-12-01T10:05:00.000Z'),
      });
    });

    it('should maintain consistency across multiple mappings', () => {
      const task1 = createMockTask({ id: 'task-1' });
      const task2 = createMockTask({ id: 'task-2' });

      const result1 = CamundaMapperProperties.map(task1);
      const result2 = CamundaMapperProperties.map(task2);

      // Should have same structure but different IDs
      expect(result1.jobKey).toBe('task-1');
      expect(result2.jobKey).toBe('task-2');

      // Other properties should be mapped consistently
      expect(result1.activityId).toBe(result2.activityId);
      expect(result1.workflowKey).toBe(result2.workflowKey);
    });
  });
});
