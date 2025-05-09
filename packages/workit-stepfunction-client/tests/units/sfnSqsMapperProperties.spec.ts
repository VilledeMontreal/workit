/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SfnSqsMapperProperties } from '../../src/sfnSqsMapperProperties';

describe('SfnSqsMapperProperties', () => {
  describe('map', () => {
    const mockDate = new Date('2023-01-01T12:00:00Z');
    const originalDate = global.Date;

    beforeEach(() => {
      // Mock Date constructor and now() method
      global.Date = jest.fn(() => mockDate) as unknown as typeof Date;
      global.Date.now = jest.fn(() => mockDate.getTime());
      // Preserve original Date behavior when needed
      global.Date.UTC = originalDate.UTC;
      global.Date.parse = originalDate.parse;
    });

    afterEach(() => {
      // Restore original Date
      global.Date = originalDate;
    });

    it('should map task with complete properties', () => {
      // Mock input task with all possible properties
      const enteredTime = new Date('2023-01-01T11:50:00Z');
      const taskTimeoutSeconds = 900; // 15 minutes

      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            businessKey: 'business-123',
            processInstanceId: 'process-123',
            version: '2',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            retries: 3,
            redriveCount: 1,
            topicName: 'topic-123',
            workerId: 'worker-123',
            enteredTime: enteredTime.toISOString(),
            taskTimeoutSeconds,
            _meta: {
              customHeaders: {
                additionalHeader: 'value',
                numericHeader: 42,
              },
            },
          },
        },
      };

      // Expected lockExpirationTime based on enteredTime and taskTimeoutSeconds
      const expectedLockExpirationTime = new Date(enteredTime.getTime() + taskTimeoutSeconds * 1000);

      // Call the method
      const result = SfnSqsMapperProperties.map(task);

      // Verify result
      expect(result).toEqual({
        activityId: 'activity-123',
        businessKey: 'business-123',
        processInstanceId: 'process-123',
        workflowDefinitionVersion: 2,
        workflowInstanceKey: 'workflow-instance-123',
        workflowKey: 'workflow-123',
        bpmnProcessId: 'bpmn-process-123',
        jobKey: 'job-123',
        retries: 3,
        redriveCount: 1,
        topicName: 'topic-123',
        workerId: 'worker-123',
        lockExpirationTime: expectedLockExpirationTime,
        customHeaders: {
          messageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          enteredTime: enteredTime.toISOString(),
          additionalHeader: 'value',
          numericHeader: 42,
        },
      });
    });

    it('should handle missing version by defaulting to 1', () => {
      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            processInstanceId: 'process-123',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            enteredTime: '2023-01-01T11:50:00Z',
            // version is missing
          },
        },
      };

      const result = SfnSqsMapperProperties.map(task);
      expect(result.workflowDefinitionVersion).toBe(1);
    });

    it('should handle empty version string by defaulting to 1', () => {
      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            processInstanceId: 'process-123',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            version: '', // Empty string
            enteredTime: '2023-01-01T11:50:00Z',
          },
        },
      };

      const result = SfnSqsMapperProperties.map(task);
      expect(result.workflowDefinitionVersion).toBe(1);
    });

    it('should use default lockExpirationTime when taskTimeoutSeconds is missing', () => {
      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            processInstanceId: 'process-123',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            enteredTime: '2023-01-01T11:50:00Z',
            // taskTimeoutSeconds is missing
          },
        },
      };

      const result = SfnSqsMapperProperties.map(task);

      // Should use default lockExpirationTime (60 seconds from current time)
      const expectedLockExpirationTime = new Date(mockDate.getTime() + 60_000);
      expect(result.lockExpirationTime).toEqual(expectedLockExpirationTime);
    });

    it('should use default lockExpirationTime when enteredTime is missing', () => {
      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            processInstanceId: 'process-123',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            taskTimeoutSeconds: 60,
            // enteredTime is missing
          },
        },
      };

      const result = SfnSqsMapperProperties.map(task);

      // Should use default lockExpirationTime (60 seconds from current time)
      const expectedLockExpirationTime = new Date(mockDate.getTime() + 60_000);
      expect(result.lockExpirationTime).toEqual(expectedLockExpirationTime);
    });

    it('should merge custom headers from _meta if available', () => {
      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            processInstanceId: 'process-123',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            enteredTime: '2023-01-01T11:50:00Z',
            _meta: {
              customHeaders: {
                headerA: 'valueA',
                headerB: 42,
                headerC: true,
              },
            },
          },
        },
      };

      const result = SfnSqsMapperProperties.map(task);

      expect(result.customHeaders).toEqual({
        messageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        enteredTime: '2023-01-01T11:50:00Z',
        headerA: 'valueA',
        headerB: 42,
        headerC: true,
      });
    });

    it('should handle missing _meta object', () => {
      const task = {
        MessageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        Body: {
          properties: {
            activityId: 'activity-123',
            processInstanceId: 'process-123',
            workflowInstanceKey: 'workflow-instance-123',
            workflowKey: 'workflow-123',
            bpmnProcessId: 'bpmn-process-123',
            jobKey: 'job-123',
            enteredTime: '2023-01-01T11:50:00Z',
            // _meta is missing
          },
        },
      };

      const result = SfnSqsMapperProperties.map(task);

      expect(result.customHeaders).toEqual({
        messageId: 'message-123',
        MD5OfBody: 'md5-hash-123',
        enteredTime: '2023-01-01T11:50:00Z',
      });
    });
  });
});
