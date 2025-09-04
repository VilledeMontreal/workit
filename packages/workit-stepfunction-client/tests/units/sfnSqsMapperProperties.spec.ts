/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IWorkflowProps } from '@villedemontreal/workit-types';
import { SfnSqsMapperProperties, SfnSqsMapperValidationError } from '../../src/sfnSqsMapperProperties';

describe('SfnSqsMapperProperties', () => {
  const createValidTask = (overrides?: any): any => {
    const defaultTask = {
      MessageId: 'msg-123',
      MD5OfBody: 'md5-hash-456',
      Body: {
        properties: {
          jobKey: 'task-token-123',
          activityId: 'step-function-activity',
          businessKey: 'business-456',
          processInstanceId: 'execution-789',
          version: 1,
          workflowInstanceKey: 'execution-key-abc',
          workflowKey: 'state-machine-def',
          bpmnProcessId: 'OrderProcess',
          retries: 0,
          topicName: 'process-topic',
          workerId: 'sf-worker-001',
          enteredTime: '2023-12-01T10:00:00.000Z',
          taskTimeoutSeconds: 300,
          redriveCount: 0,
        },
      },
    };

    if (!overrides) {
      return defaultTask;
    }

    const result = { ...defaultTask, ...overrides };
    
    if (overrides.Body) {
      result.Body = { ...defaultTask.Body, ...overrides.Body };
      
      if (overrides.Body.properties) {
        result.Body.properties = { ...defaultTask.Body.properties, ...overrides.Body.properties };
      }
    }
    
    return result;
  };

  describe('SfnSqsMapperValidationError', () => {
    it('should create validation error with message and field', () => {
      const error = new SfnSqsMapperValidationError('Invalid field', 'testField');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Invalid field');
      expect(error.field).toBe('testField');
      expect(error.name).toBe('SfnSqsMapperValidationError');
    });

    it('should extend Error properly', () => {
      const error = new SfnSqsMapperValidationError('Test error', 'testField');

      expect(error instanceof Error).toBe(true);
      expect(error instanceof SfnSqsMapperValidationError).toBe(true);
    });
  });

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
            topicName: 'topic-123',
            workerId: 'worker-123',
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
            topicName: 'topic-123',
            workerId: 'worker-123',
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
            topicName: 'topic-123',
            workerId: 'worker-123',
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
            topicName: 'topic-123',
            workerId: 'worker-123',
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
            topicName: 'topic-123',
            workerId: 'worker-123',
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
            topicName: 'topic-123',
            workerId: 'worker-123',
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

    // Tests de validation stricte
    describe('Validation Tests', () => {
      it('should throw error when task is null or undefined', () => {
        expect(() => SfnSqsMapperProperties.map(null)).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map(undefined)).toThrow(SfnSqsMapperValidationError);

        try {
          SfnSqsMapperProperties.map(null);
        } catch (error) {
          expect(error).toBeInstanceOf(SfnSqsMapperValidationError);
          expect((error as SfnSqsMapperValidationError).field).toBe('task');
          expect((error as SfnSqsMapperValidationError).message).toBe('Task must be a valid object');
        }
      });

      it('should throw error when task is not an object', () => {
        expect(() => SfnSqsMapperProperties.map('invalid')).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map(123)).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map([])).toThrow(SfnSqsMapperValidationError);
      });

      it('should throw error when task.Body is missing or invalid', () => {
        expect(() => SfnSqsMapperProperties.map({})).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map({ Body: null })).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map({ Body: 'invalid' })).toThrow(SfnSqsMapperValidationError);

        try {
          SfnSqsMapperProperties.map({});
        } catch (error) {
          expect(error).toBeInstanceOf(SfnSqsMapperValidationError);
          expect((error as SfnSqsMapperValidationError).field).toBe('task.Body');
        }
      });

      it('should throw error when task.Body.properties is missing or invalid', () => {
        expect(() => SfnSqsMapperProperties.map({ Body: {} })).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map({ Body: { properties: null } })).toThrow(SfnSqsMapperValidationError);
        expect(() => SfnSqsMapperProperties.map({ Body: { properties: 'invalid' } })).toThrow(
          SfnSqsMapperValidationError,
        );

        try {
          SfnSqsMapperProperties.map({ Body: {} });
        } catch (error) {
          expect(error).toBeInstanceOf(SfnSqsMapperValidationError);
          expect((error as SfnSqsMapperValidationError).field).toBe('task.Body.properties');
        }
      });

      it('should throw error when jobKey is missing, null, undefined, or empty string', () => {
        const baseTask = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: 'activity-123',
              processInstanceId: 'process-123',
              workflowInstanceKey: 'workflow-instance-123',
              workflowKey: 'workflow-123',
              bpmnProcessId: 'bpmn-process-123',
              topicName: 'topic-123',
              workerId: 'worker-123',
            },
          },
        };

        // Test missing jobKey
        expect(() => SfnSqsMapperProperties.map(baseTask)).toThrow(SfnSqsMapperValidationError);

        // Test null jobKey
        expect(() =>
          SfnSqsMapperProperties.map({
            ...baseTask,
            Body: { ...baseTask.Body, properties: { ...baseTask.Body.properties, jobKey: null } },
          }),
        ).toThrow(SfnSqsMapperValidationError);

        // Test undefined jobKey
        expect(() =>
          SfnSqsMapperProperties.map({
            ...baseTask,
            Body: { ...baseTask.Body, properties: { ...baseTask.Body.properties, jobKey: undefined } },
          }),
        ).toThrow(SfnSqsMapperValidationError);

        // Test empty string jobKey
        expect(() =>
          SfnSqsMapperProperties.map({
            ...baseTask,
            Body: { ...baseTask.Body, properties: { ...baseTask.Body.properties, jobKey: '' } },
          }),
        ).toThrow(SfnSqsMapperValidationError);

        // Test whitespace-only jobKey
        expect(() =>
          SfnSqsMapperProperties.map({
            ...baseTask,
            Body: { ...baseTask.Body, properties: { ...baseTask.Body.properties, jobKey: '   ' } },
          }),
        ).toThrow(SfnSqsMapperValidationError);

        try {
          SfnSqsMapperProperties.map(baseTask);
        } catch (error) {
          expect(error).toBeInstanceOf(SfnSqsMapperValidationError);
          expect((error as SfnSqsMapperValidationError).field).toBe('jobKey');
          expect((error as SfnSqsMapperValidationError).message).toBe(
            'jobKey is required and must be a non-empty string for acknowledgment',
          );
        }
      });

      it('should throw error when required string properties are missing or invalid', () => {
        const requiredStringFields = ['activityId'];

        requiredStringFields.forEach((field) => {
          const baseTask: any = {
            MessageId: 'message-123',
            MD5OfBody: 'md5-hash-123',
            Body: {
              properties: {
                activityId: 'activity-123',
                processInstanceId: 'process-123',
                workflowInstanceKey: 'workflow-instance-123',
                workflowKey: 'workflow-123',
                bpmnProcessId: 'bpmn-process-123',
                topicName: 'topic-123',
                workerId: 'worker-123',
                jobKey: 'job-123',
              },
            },
          };

          // Test missing field
          delete baseTask.Body.properties[field];
          expect(() => SfnSqsMapperProperties.map(baseTask)).toThrow(SfnSqsMapperValidationError);

          // Test null field
          baseTask.Body.properties[field] = null;
          expect(() => SfnSqsMapperProperties.map(baseTask)).toThrow(SfnSqsMapperValidationError);

          // Test non-string field
          baseTask.Body.properties[field] = 123;
          expect(() => SfnSqsMapperProperties.map(baseTask)).toThrow(SfnSqsMapperValidationError);

          try {
            SfnSqsMapperProperties.map(baseTask);
          } catch (error) {
            expect(error).toBeInstanceOf(SfnSqsMapperValidationError);
            expect((error as SfnSqsMapperValidationError).field).toBe(field);
          }
        });
      });

      it('should throw error when retries is invalid', () => {
        const baseTask = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: 'activity-123',
              processInstanceId: 'process-123',
              workflowInstanceKey: 'workflow-instance-123',
              workflowKey: 'workflow-123',
              bpmnProcessId: 'bpmn-process-123',
              topicName: 'topic-123',
              workerId: 'worker-123',
              jobKey: 'job-123',
            },
          },
        };

        // Test invalid retries values
        const invalidRetries = [-1, 1.5, 'invalid', {}, []];

        invalidRetries.forEach((invalidValue) => {
          const taskWithInvalidRetries = {
            ...baseTask,
            Body: { ...baseTask.Body, properties: { ...baseTask.Body.properties, retries: invalidValue } },
          };

          expect(() => SfnSqsMapperProperties.map(taskWithInvalidRetries)).toThrow(SfnSqsMapperValidationError);

          try {
            SfnSqsMapperProperties.map(taskWithInvalidRetries);
          } catch (error) {
            expect(error).toBeInstanceOf(SfnSqsMapperValidationError);
            expect((error as SfnSqsMapperValidationError).field).toBe('retries');
            expect((error as SfnSqsMapperValidationError).message).toBe(
              'retries must be null or a non-negative integer',
            );
          }
        });

        // Test valid retries values (should not throw)
        const validRetries = [null, undefined, 0, 1, 5, 10];

        validRetries.forEach((validValue) => {
          const taskWithValidRetries = {
            ...baseTask,
            Body: { ...baseTask.Body, properties: { ...baseTask.Body.properties, retries: validValue } },
          };

          expect(() => SfnSqsMapperProperties.map(taskWithValidRetries)).not.toThrow();
        });
      });
    });

    // Tests de sécurité
    describe('Security Tests', () => {
      it('should handle malicious payloads safely', () => {
        const maliciousPayloads = [
          // Script injection attempts
          {
            Body: {
              properties: {
                activityId: '<script>alert("xss")</script>',
                processInstanceId: 'process-123',
                workflowInstanceKey: 'workflow-instance-123',
                workflowKey: 'workflow-123',
                bpmnProcessId: 'bpmn-process-123',
                topicName: 'topic-123',
                workerId: 'worker-123',
                jobKey: 'job-123',
              },
            },
          },
          // SQL injection attempts
          {
            Body: {
              properties: {
                activityId: "'; DROP TABLE users; --",
                processInstanceId: 'process-123',
                workflowInstanceKey: 'workflow-instance-123',
                workflowKey: 'workflow-123',
                bpmnProcessId: 'bpmn-process-123',
                topicName: 'topic-123',
                workerId: 'worker-123',
                jobKey: 'job-123',
              },
            },
          },
          // Path traversal attempts
          {
            Body: {
              properties: {
                activityId: '../../../etc/passwd',
                processInstanceId: 'process-123',
                workflowInstanceKey: 'workflow-instance-123',
                workflowKey: 'workflow-123',
                bpmnProcessId: 'bpmn-process-123',
                topicName: 'topic-123',
                workerId: 'worker-123',
                jobKey: 'job-123',
              },
            },
          },
        ];

        maliciousPayloads.forEach((payload) => {
          // Should not throw validation errors for string content (but validate structure)
          expect(() => SfnSqsMapperProperties.map(payload)).not.toThrow();

          // Verify the malicious content is preserved as-is (not executed)
          const result = SfnSqsMapperProperties.map(payload);
          expect(typeof result.activityId).toBe('string');
          expect(result.activityId).toBe(payload.Body.properties.activityId);
        });
      });

      it('should handle extremely large payloads', () => {
        const largeString = 'A'.repeat(10000); // 10KB string

        const largePayload = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: largeString,
              processInstanceId: 'process-123',
              workflowInstanceKey: 'workflow-instance-123',
              workflowKey: 'workflow-123',
              bpmnProcessId: 'bpmn-process-123',
              topicName: 'topic-123',
              workerId: 'worker-123',
              jobKey: 'job-123',
            },
          },
        };

        expect(() => SfnSqsMapperProperties.map(largePayload)).not.toThrow();
        const result = SfnSqsMapperProperties.map(largePayload);
        expect(result.activityId).toBe(largeString);
      });

      it('should handle prototype pollution attempts', () => {
        const pollutionAttempt = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: 'activity-123',
              processInstanceId: 'process-123',
              workflowInstanceKey: 'workflow-instance-123',
              workflowKey: 'workflow-123',
              bpmnProcessId: 'bpmn-process-123',
              topicName: 'topic-123',
              workerId: 'worker-123',
              jobKey: 'job-123',
              __proto__: { polluted: true },
              constructor: { prototype: { polluted: true } },
            },
          },
        };

        expect(() => SfnSqsMapperProperties.map(pollutionAttempt)).not.toThrow();

        // Verify prototype pollution didn't occur
        expect((Object.prototype as any).polluted).toBeUndefined();
        expect(({} as any).polluted).toBeUndefined();
      });

      it('should handle circular references in _meta', () => {
        const task: any = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: 'activity-123',
              processInstanceId: 'process-123',
              workflowInstanceKey: 'workflow-instance-123',
              workflowKey: 'workflow-123',
              bpmnProcessId: 'bpmn-process-123',
              topicName: 'topic-123',
              workerId: 'worker-123',
              jobKey: 'job-123',
            },
          },
        };

        // Create circular reference
        const circular: any = { a: 1 };
        circular.self = circular;
        task.Body.properties._meta = { customHeaders: circular };

        // Should handle gracefully without infinite loops
        expect(() => SfnSqsMapperProperties.map(task)).not.toThrow();
      });
    });

    // Tests d'edge cases critiques
    describe('Critical Edge Cases', () => {
      it('should handle Date parsing edge cases', () => {
        const edgeCases = [
          'invalid-date',
          '2023-13-45T25:70:70Z', // Invalid date components
          '2023-01-01T12:00:00+99:99', // Invalid timezone
          'Thu, 01 Jan 1970 00:00:00 GMT', // Different date format
          '1577836800000', // Timestamp as string
        ];

        edgeCases.forEach((dateString) => {
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
                topicName: 'topic-123',
                workerId: 'worker-123',
                jobKey: 'job-123',
                enteredTime: dateString,
                taskTimeoutSeconds: 60,
              },
            },
          };

          // Should not throw but may use default lockExpirationTime
          expect(() => SfnSqsMapperProperties.map(task)).not.toThrow();
        });
      });

      it('should handle extreme timeout values', () => {
        const extremeTimeouts = [
          0, // Zero timeout
          -1, // Negative timeout
          Number.MAX_SAFE_INTEGER, // Very large timeout
          Infinity, // Infinite timeout
          NaN, // Not a number
        ];

        extremeTimeouts.forEach((timeout) => {
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
                topicName: 'topic-123',
                workerId: 'worker-123',
                jobKey: 'job-123',
                enteredTime: '2023-01-01T12:00:00Z',
                taskTimeoutSeconds: timeout,
              },
            },
          };

          expect(() => SfnSqsMapperProperties.map(task)).not.toThrow();
          const result = SfnSqsMapperProperties.map(task);
          expect(result.lockExpirationTime).toBeInstanceOf(originalDate);
        });
      });

      it('should handle Unicode and special characters', () => {
        const unicodeTask = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: '活动-123-🚀',
              processInstanceId: 'процесс-123-ñ',
              workflowInstanceKey: 'workflow-instance-123-€',
              workflowKey: 'workflow-123-中文',
              bpmnProcessId: 'bpmn-процесс-123-🔧',
              topicName: 'topic-123-العربية',
              workerId: 'worker-123-日本語',
              jobKey: 'job-123-한글',
            },
          },
        };

        expect(() => SfnSqsMapperProperties.map(unicodeTask)).not.toThrow();
        const result = SfnSqsMapperProperties.map(unicodeTask);

        // Verify Unicode characters are preserved
        expect(result.activityId).toBe('活动-123-🚀');
        expect(result.processInstanceId).toBe('процесс-123-ñ');
        expect(result.jobKey).toBe('job-123-한글');
      });

      it('should handle memory pressure scenarios', () => {
        // Create a task with many properties to test memory usage
        const largeTask: any = {
          MessageId: 'message-123',
          MD5OfBody: 'md5-hash-123',
          Body: {
            properties: {
              activityId: 'activity-123',
              processInstanceId: 'process-123',
              workflowInstanceKey: 'workflow-instance-123',
              workflowKey: 'workflow-123',
              bpmnProcessId: 'bpmn-process-123',
              topicName: 'topic-123',
              workerId: 'worker-123',
              jobKey: 'job-123',
              _meta: {
                customHeaders: {},
              },
            },
          },
        };

        // Add many custom headers
        for (let i = 0; i < 1000; i++) {
          largeTask.Body.properties._meta.customHeaders[`header${i}`] = `value${i}`;
        }

        expect(() => SfnSqsMapperProperties.map(largeTask)).not.toThrow();
        const result = SfnSqsMapperProperties.map(largeTask);
        expect(Object.keys(result.customHeaders).length).toBeGreaterThan(1000);
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

        expect(() => SfnSqsMapperProperties.unmap(props)).toThrow('Not Implemented yet');
      });
    });

    describe('real-world AWS Step Functions scenarios', () => {
      it('should handle typical AWS SQS message from Step Functions', () => {
        const awsMessage = {
          MessageId: 'f1c23456-7890-1234-5678-123456789012',
          ReceiptHandle: 'receipt-handle-123',
          MD5OfBody: 'a1b2c3d4e5f6789012345678901234567890',
          Body: {
            properties: {
              jobKey: 'arn:aws:states:us-east-1:123456789012:task:step-function:abc123-def456-789',
              activityId: 'ProcessPayment',
              businessKey: 'PAYMENT_12345',
              processInstanceId: 'arn:aws:states:us-east-1:123456789012:execution:PaymentProcess:payment-execution-123',
              version: 2,
              workflowInstanceKey: 'payment-execution-123',
              workflowKey: 'PaymentProcess',
              bpmnProcessId: 'PaymentProcessStateMachine',
              retries: 0,
              redriveCount: 0,
              topicName: 'payment-processing-topic',
              workerId: 'payment-worker-001',
              enteredTime: '2023-12-01T14:30:15.123Z',
              taskTimeoutSeconds: 900,
              _meta: {
                customHeaders: {
                  'X-Correlation-ID': 'correlation-payment-12345',
                  'X-AWS-Region': 'us-east-1',
                  'X-Execution-Name': 'payment-execution-123',
                },
              },
            },
          },
        };

        const result = SfnSqsMapperProperties.map(awsMessage);

        expect(result).toEqual({
          activityId: 'ProcessPayment',
          businessKey: 'PAYMENT_12345',
          processInstanceId: 'arn:aws:states:us-east-1:123456789012:execution:PaymentProcess:payment-execution-123',
          workflowDefinitionVersion: 2,
          workflowInstanceKey: 'payment-execution-123',
          workflowKey: 'PaymentProcess',
          bpmnProcessId: 'PaymentProcessStateMachine',
          customHeaders: {
            messageId: 'f1c23456-7890-1234-5678-123456789012',
            MD5OfBody: 'a1b2c3d4e5f6789012345678901234567890',
            enteredTime: '2023-12-01T14:30:15.123Z',
            'X-Correlation-ID': 'correlation-payment-12345',
            'X-AWS-Region': 'us-east-1',
            'X-Execution-Name': 'payment-execution-123',
          },
          jobKey: 'arn:aws:states:us-east-1:123456789012:task:step-function:abc123-def456-789',
          retries: 0,
          redriveCount: 0,
          topicName: 'payment-processing-topic',
          workerId: 'payment-worker-001',
          lockExpirationTime: new Date('2023-12-01T14:45:15.123Z'),
        });
      });

      it('should handle message with retry scenario', () => {
        const retriedMessage = createValidTask({
          Body: {
            properties: {
              retries: 2,
              redriveCount: 1,
              enteredTime: '2023-12-01T10:00:00.000Z',
              taskTimeoutSeconds: 60,
            },
          },
        });

        const result = SfnSqsMapperProperties.map(retriedMessage);

        expect(result.retries).toBe(2);
        expect(result.redriveCount).toBe(1);
        expect(result.lockExpirationTime).toEqual(new Date('2023-12-01T10:01:00.000Z'));
      });

      it('should maintain consistency across multiple message mappings', () => {
        const message1 = createValidTask({ MessageId: 'msg-1' });
        const message2 = createValidTask({ MessageId: 'msg-2' });

        const result1 = SfnSqsMapperProperties.map(message1);
        const result2 = SfnSqsMapperProperties.map(message2);

        expect(result1.customHeaders.messageId).toBe('msg-1');
        expect(result2.customHeaders.messageId).toBe('msg-2');
        
        expect(result1.activityId).toBe(result2.activityId);
        expect(result1.workflowKey).toBe(result2.workflowKey);
      });
    });
  });
});
