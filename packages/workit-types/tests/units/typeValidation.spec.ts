/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import {
  // Core interfaces
  IMessage,
  IMessageBase,
  // Common interfaces
  IPagination,
  IPaginationOptions,
  IPaging,
  ICustomHeaders,
  ILogger,
  Loglevel,
  // Plugin interfaces
  IPluginConfig,
  HookState,
  // Exception classes
  FailureException,
  IncidentException,
  // Utilities
  ValidationFn,
} from '../../src';

describe('Type Validation Tests', () => {
  describe('Core Message Types', () => {
    it('should validate IMessage interface structure', () => {
      const validMessage: IMessage<{ data: string }, { activityId: string }> = {
        body: { data: 'test' },
        properties: { activityId: 'test-activity' },
      };

      expect(validMessage.body).toBeDefined();
      expect(validMessage.properties).toBeDefined();
      expect(validMessage.body.data).toBe('test');
      expect(validMessage.properties.activityId).toBe('test-activity');
    });

    it('should validate IMessageBase interface structure', () => {
      const validMessageBase: IMessageBase<string, number> = {
        body: 'test body',
        properties: 42,
      };

      expect(validMessageBase.body).toBe('test body');
      expect(validMessageBase.properties).toBe(42);
      expect(typeof validMessageBase.body).toBe('string');
      expect(typeof validMessageBase.properties).toBe('number');
    });

    it('should allow flexible generic types in IMessage', () => {
      interface CustomBody {
        userId: number;
        action: string;
        metadata?: Record<string, any>;
      }

      interface CustomProperties {
        timestamp: Date;
        source: string;
        priority: 'high' | 'medium' | 'low';
      }

      const complexMessage: IMessage<CustomBody, CustomProperties> = {
        body: {
          userId: 123,
          action: 'process-order',
          metadata: { orderId: 'order-456' },
        },
        properties: {
          timestamp: new Date(),
          source: 'api-gateway',
          priority: 'high',
        },
      };

      expect(complexMessage.body.userId).toBe(123);
      expect(complexMessage.body.action).toBe('process-order');
      expect(complexMessage.body.metadata?.orderId).toBe('order-456');
      expect(complexMessage.properties.priority).toBe('high');
    });
  });

  describe('Pagination Types', () => {
    it('should validate IPagination interface', () => {
      const paginatedItems: IPagination<string> = {
        items: ['item1', 'item2', 'item3'],
        paging: {
          from: 0,
          size: 10,
          totalCount: 3,
        },
      };

      expect(paginatedItems.items).toHaveLength(3);
      expect(paginatedItems.paging.from).toBe(0);
      expect(paginatedItems.paging.size).toBe(10);
      expect(paginatedItems.paging.totalCount).toBe(3);
    });

    it('should validate IPaginationOptions', () => {
      const options: IPaginationOptions = {
        from: 10,
        size: 20,
      };

      expect(options.from).toBe(10);
      expect(options.size).toBe(20);
    });

    it('should validate IPaging', () => {
      const paging: IPaging = {
        from: 30,
        size: 15,
        totalCount: 45,
      };

      expect(paging.from).toBe(30);
      expect(paging.size).toBe(15);
      expect(paging.totalCount).toBe(45);
    });
  });

  describe('Configuration Types', () => {
    it('should validate ICustomHeaders', () => {
      const headers: ICustomHeaders = {
        'Authorization': 'Bearer token123',
        'X-Custom-Header': 'custom-value',
        'Content-Type': 'application/json',
      };

      expect(headers['Authorization']).toBe('Bearer token123');
      expect(headers['X-Custom-Header']).toBe('custom-value');
      expect(headers['Content-Type']).toBe('application/json');
    });
  });

  describe('Exception Types', () => {
    it('should validate FailureException', () => {
      const error = new FailureException('Test failure', 5, 5000);

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Test failure');
      expect(error.retries).toBe(5);
      expect(error.retryTimeout).toBe(5000);
    });

    it('should validate FailureException with default values', () => {
      const error = new FailureException('Test failure with defaults');

      expect(error.message).toBe('Test failure with defaults');
      expect(error.retries).toBe(1); // Default value
      expect(error.retryTimeout).toBe(1000); // Default value
    });

    it('should validate IncidentException', () => {
      const error = new IncidentException('Incident occurred');

      expect(error).toBeInstanceOf(Error);
      expect(error.message).toBe('Incident occurred');
      expect(error.code).toBe('Workit.Incident');
      expect(error.retries).toBe(0);
    });
  });

  describe('Logger Types', () => {
    it('should validate Loglevel type values', () => {
      const levels: Loglevel[] = [
        'ERROR',
        'INFO',
        'DEBUG',
        'NONE',
      ];

      expect(levels).toContain('ERROR');
      expect(levels).toContain('INFO');
      expect(levels).toContain('DEBUG');
      expect(levels).toContain('NONE');
    });

    it('should validate ILogger interface', () => {
      const mockLogger: ILogger = {
        debug: (message: string) => { /* implementation */ },
        info: (message: string) => { /* implementation */ },
        warn: (message: string) => { /* implementation */ },
        error: (message: string) => { /* implementation */ },
      };

      expect(typeof mockLogger.debug).toBe('function');
      expect(typeof mockLogger.info).toBe('function');
      expect(typeof mockLogger.warn).toBe('function');
      expect(typeof mockLogger.error).toBe('function');
    });
  });

  describe('Plugin Types', () => {
    it('should validate HookState enum', () => {
      const states = [
        HookState.UNINITIALIZED,
        HookState.LOADED,
        HookState.UNLOADED,
      ];

      expect(states).toContain(HookState.UNINITIALIZED);
      expect(states).toContain(HookState.LOADED);
      expect(states).toContain(HookState.UNLOADED);
    });

    it('should validate IPluginConfig', () => {
      const config: IPluginConfig = {
        path: '/path/to/plugin',
        enabled: true,
      };

      expect(config.path).toBe('/path/to/plugin');
      expect(config.enabled).toBe(true);
    });

    it('should validate IPluginConfig with optional properties', () => {
      const minimalConfig: IPluginConfig = {};
      const pathOnlyConfig: IPluginConfig = { path: '/plugin/path' };
      const enabledOnlyConfig: IPluginConfig = { enabled: false };

      expect(minimalConfig.path).toBeUndefined();
      expect(minimalConfig.enabled).toBeUndefined();
      expect(pathOnlyConfig.path).toBe('/plugin/path');
      expect(enabledOnlyConfig.enabled).toBe(false);
    });
  });

  describe('Utility Types', () => {
    it('should validate ValidationFn type', () => {
      const emailValidator: ValidationFn = (value: string) => {
        return value.includes('@') && value.includes('.');
      };

      expect(typeof emailValidator).toBe('function');
      expect(emailValidator('test@example.com')).toBe(true);
      expect(emailValidator('invalid-email')).toBe(false);
    });

    it('should validate numeric ValidationFn', () => {
      const isPositiveNumber: ValidationFn = (value: string) => {
        const num = parseFloat(value);
        return !isNaN(num) && num > 0;
      };

      expect(isPositiveNumber('123')).toBe(true);
      expect(isPositiveNumber('0')).toBe(false);
      expect(isPositiveNumber('-5')).toBe(false);
      expect(isPositiveNumber('abc')).toBe(false);
    });
  });

  describe('Type Safety and Constraints', () => {
    it('should enforce type safety in generic interfaces', () => {
      // This test validates TypeScript compiler behavior
      interface StrictMessage extends IMessage<{ data: string }, { id: number }> { }

      const strictMessage: StrictMessage = {
        body: { data: 'test' },
        properties: { id: 123 },
      };

      // TypeScript should ensure these properties have correct types
      expect(typeof strictMessage.body.data).toBe('string');
      expect(typeof strictMessage.properties.id).toBe('number');
    });

    it('should handle optional properties correctly', () => {
      interface OptionalPropsMessage extends IMessage<{ data: string }, { required: string; optional?: number }> { }

      const messageWithOptional: OptionalPropsMessage = {
        body: { data: 'test' },
        properties: { required: 'value', optional: 42 },
      };

      const messageWithoutOptional: OptionalPropsMessage = {
        body: { data: 'test' },
        properties: { required: 'value' },
      };

      expect(messageWithOptional.properties.optional).toBe(42);
      expect(messageWithoutOptional.properties.optional).toBeUndefined();
    });

    it('should validate enum values correctly', () => {
      expect(typeof HookState.UNINITIALIZED).toBe('number');
      expect(typeof HookState.LOADED).toBe('number');
      expect(typeof HookState.UNLOADED).toBe('number');
      
      expect(HookState.UNINITIALIZED).toBe(0);
      expect(HookState.LOADED).toBe(1);
      expect(HookState.UNLOADED).toBe(2);
    });

    it('should handle complex pagination scenarios', () => {
      interface ComplexItem {
        id: string;
        name: string;
        metadata: { created: Date; updated?: Date };
      }

      const complexPagination: IPagination<ComplexItem> = {
        items: [
          {
            id: '1',
            name: 'Item 1',
            metadata: { created: new Date() },
          },
          {
            id: '2', 
            name: 'Item 2',
            metadata: { created: new Date(), updated: new Date() },
          },
        ],
        paging: {
          from: 0,
          size: 2,
          totalCount: 2,
        },
      };

      expect(complexPagination.items).toHaveLength(2);
      expect(complexPagination.items[0].metadata.created).toBeInstanceOf(Date);
      expect(complexPagination.items[1].metadata.updated).toBeInstanceOf(Date);
    });
  });
});