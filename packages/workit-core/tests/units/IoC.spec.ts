/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import 'reflect-metadata';
import { Container, injectable, inject } from 'inversify';
import { IOC } from '../../src/IoC';

// Test classes and interfaces
interface ITestService {
  getName(): string;
}

@injectable()
class TestService implements ITestService {
  getName(): string {
    return 'TestService';
  }
}

@injectable()
class TestServiceWithDependency implements ITestService {
  constructor(@inject('dependency') private dependency: string) {}

  getName(): string {
    return `TestServiceWithDependency: ${this.dependency}`;
  }
}

@injectable()
class TestServiceAnother implements ITestService {
  getName(): string {
    return 'TestServiceAnother';
  }
}

// Test symbols and identifiers
const TEST_IDENTIFIER = Symbol('TestService');
const TEST_STRING_IDENTIFIER = 'TestService';

describe('IOC', () => {
  let container: Container;
  let ioc: IOC;

  beforeEach(() => {
    container = new Container();
    ioc = new IOC(container);
  });

  describe('constructor', () => {
    it('should create IOC instance with container', () => {
      expect(ioc).toBeInstanceOf(IOC);
      expect(ioc.getContainer()).toBe(container);
    });
  });

  describe('bindTo', () => {
    it('should bind class to service identifier with default settings', () => {
      ioc.bindTo(TestService, TEST_IDENTIFIER);

      const instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);
      expect(instance.getName()).toBe('TestService');
    });

    it('should bind class with dependencies', () => {
      const dependencies = ['dependency'];
      ioc.bindToObject('test-dependency', 'dependency');
      ioc.bindTo(TestServiceWithDependency, TEST_IDENTIFIER, dependencies);

      const instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestServiceWithDependency);
      expect(instance.getName()).toBe('TestServiceWithDependency: test-dependency');
    });

    it('should bind class with named binding', () => {
      ioc.bindTo(TestService, TEST_IDENTIFIER, undefined, 'test-name');

      const instance = ioc.get<ITestService>(TEST_IDENTIFIER, 'test-name');
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should bind class in singleton scope by default', () => {
      ioc.bindTo(TestService, TEST_IDENTIFIER);

      const instance1 = ioc.get<ITestService>(TEST_IDENTIFIER);
      const instance2 = ioc.get<ITestService>(TEST_IDENTIFIER);

      expect(instance1).toBe(instance2);
    });

    it('should bind class in transient scope when singletonMode is false', () => {
      ioc.bindTo(TestService, TEST_IDENTIFIER, undefined, undefined, false);

      const instance1 = ioc.get<ITestService>(TEST_IDENTIFIER);
      const instance2 = ioc.get<ITestService>(TEST_IDENTIFIER);

      expect(instance1).not.toBe(instance2);
      expect(instance1).toBeInstanceOf(TestService);
      expect(instance2).toBeInstanceOf(TestService);
    });

    it('should work with string identifiers', () => {
      ioc.bindTo(TestService, TEST_STRING_IDENTIFIER);

      const instance = ioc.get<ITestService>(TEST_STRING_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);
    });
  });

  describe('bindToAsDefault', () => {
    it('should bind class as default singleton', () => {
      ioc.bindToAsDefault(TestService, TEST_IDENTIFIER);

      const instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should bind class with dependencies as default', () => {
      const dependencies = ['dependency'];
      ioc.bindToObject('test-dependency', 'dependency');
      ioc.bindToAsDefault(TestServiceWithDependency, TEST_IDENTIFIER, dependencies);

      const instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestServiceWithDependency);
    });
  });

  describe('bindToObject', () => {
    it('should bind object to identifier', () => {
      const testObject = { value: 'test' };
      ioc.bindToObject(testObject, TEST_IDENTIFIER);

      const instance = ioc.get(TEST_IDENTIFIER);
      expect(instance).toEqual(testObject);
    });

    it('should bind object with named binding', () => {
      const testObject = { value: 'test' };
      ioc.bindToObject(testObject, TEST_IDENTIFIER, 'test-name');

      const instance = ioc.get(TEST_IDENTIFIER, 'test-name');
      expect(instance).toEqual(testObject);
    });

    it('should override camunda_external_config with autoPoll: false', () => {
      const testConfig = { baseUrl: 'http://test', autoPoll: true };
      ioc.bindToObject(testConfig, 'camunda_external_config');

      const instance = ioc.get('camunda_external_config');
      expect(instance).toEqual({ ...testConfig, autoPoll: false });
    });

    it('should override camunda_external_config symbol with autoPoll: false', () => {
      const testConfig = { baseUrl: 'http://test', autoPoll: true };
      const symbol = Symbol('camunda_external_config');
      ioc.bindToObject(testConfig, symbol);

      const instance = ioc.get(symbol);
      expect(instance).toEqual({ ...testConfig, autoPoll: false });
    });
  });

  describe('bind (deprecated)', () => {
    it('should bind class with target named', () => {
      ioc.bind(TEST_STRING_IDENTIFIER, TestService, 'test-name');

      const instance = ioc.get<ITestService>(TEST_STRING_IDENTIFIER, 'test-name');
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should bind class in singleton scope by default', () => {
      ioc.bind(TEST_STRING_IDENTIFIER, TestService, 'test-name');

      const instance1 = ioc.get<ITestService>(TEST_STRING_IDENTIFIER, 'test-name');
      const instance2 = ioc.get<ITestService>(TEST_STRING_IDENTIFIER, 'test-name');

      expect(instance1).toBe(instance2);
    });

    it('should bind class in transient scope when singletonMode is false', () => {
      ioc.bind(TEST_STRING_IDENTIFIER, TestService, 'test-name', false);

      const instance1 = ioc.get<ITestService>(TEST_STRING_IDENTIFIER, 'test-name');
      const instance2 = ioc.get<ITestService>(TEST_STRING_IDENTIFIER, 'test-name');

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('get', () => {
    beforeEach(() => {
      ioc.bindTo(TestService, TEST_IDENTIFIER);
      ioc.bindTo(TestServiceAnother, TEST_IDENTIFIER, undefined, 'another');
    });

    it('should get default binding', () => {
      const instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should get named binding', () => {
      const instance = ioc.get<ITestService>(TEST_IDENTIFIER, 'another');
      expect(instance).toBeInstanceOf(TestServiceAnother);
    });

    it('should fallback to default when named binding does not exist', () => {
      const instance = ioc.get<ITestService>(TEST_IDENTIFIER, 'non-existent');
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should work with string identifiers', () => {
      ioc.bindTo(TestService, TEST_STRING_IDENTIFIER);
      const instance = ioc.get<ITestService>(TEST_STRING_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);
    });
  });

  describe('getTask', () => {
    const workflow1 = { bpmnProcessId: 'testProcess', version: 1 };
    const workflow2 = { bpmnProcessId: 'testProcess', version: 2 };
    const workflowNoVersion = { bpmnProcessId: 'testProcess', version: 0 };

    beforeEach(() => {
      ioc.bindTo(TestService, TEST_IDENTIFIER); // default
      ioc.bindTo(TestServiceAnother, TEST_IDENTIFIER, undefined, 'testProcess'); // key only
      ioc.bindTo(TestServiceWithDependency, TEST_IDENTIFIER, ['dependency'], 'testProcess:1'); // key with version
    });

    it('should get default task when no workflow is provided', () => {
      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should get task by workflow with version', () => {
      ioc.bindToObject('dependency-value', 'dependency');
      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow1);
      expect(instance).toBeInstanceOf(TestServiceWithDependency);
    });

    it('should get task by workflow key when version binding does not exist', () => {
      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow2);
      expect(instance).toBeInstanceOf(TestServiceAnother);
    });

    it('should fallback to default when no specific binding exists', () => {
      const workflowNotBound = { bpmnProcessId: 'nonExistentProcess', version: 1 };
      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflowNotBound);
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should handle workflow without version', () => {
      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflowNoVersion);
      expect(instance).toBeInstanceOf(TestServiceAnother);
    });
  });

  describe('bindTask', () => {
    it('should bind task with workflow version', () => {
      const workflow = { bpmnProcessId: 'testProcess', version: 1 };
      ioc.bindTask(TestService, TEST_IDENTIFIER, workflow);

      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow);
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should bind task without workflow version', () => {
      const workflow = { bpmnProcessId: 'testProcess', version: 0 };
      ioc.bindTask(TestService, TEST_IDENTIFIER, workflow);

      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow);
      expect(instance).toBeInstanceOf(TestService);
    });

    it('should bind task with dependencies', () => {
      const workflow = { bpmnProcessId: 'testProcess', version: 1 };
      const dependencies = ['dependency'];
      ioc.bindToObject('test-dependency', 'dependency');
      ioc.bindTask(TestServiceWithDependency, TEST_IDENTIFIER, workflow, dependencies);

      const instance = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow);
      expect(instance).toBeInstanceOf(TestServiceWithDependency);
    });

    it('should bind task in transient scope when singletonMode is false', () => {
      const workflow = { bpmnProcessId: 'testProcess', version: 1 };
      ioc.bindTask(TestService, TEST_IDENTIFIER, workflow, undefined, false);

      const instance1 = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow);
      const instance2 = ioc.getTask<ITestService>(TEST_IDENTIFIER, workflow);

      expect(instance1).not.toBe(instance2);
    });
  });

  describe('getWorkflowNamed', () => {
    it('should generate named identifier with version', () => {
      const workflow = { bpmnProcessId: 'testProcess', version: 1 };
      const named = ioc.getWorkflowNamed(workflow);
      expect(named).toBe('testProcess:1');
    });

    it('should generate named identifier without version', () => {
      const workflow = { bpmnProcessId: 'testProcess' };
      const named = ioc.getWorkflowNamed(workflow);
      expect(named).toBe('testProcess');
    });

    it('should handle version 0', () => {
      const workflow = { bpmnProcessId: 'testProcess', version: 0 };
      const named = ioc.getWorkflowNamed(workflow);
      expect(named).toBe('testProcess');
    });

    it('should throw error for invalid workflow', () => {
      expect(() => ioc.getWorkflowNamed(null as any)).toThrow('workflow object is required');
      expect(() => ioc.getWorkflowNamed(undefined as any)).toThrow('workflow object is required');
      expect(() => ioc.getWorkflowNamed({} as any)).toThrow('workflow object is required');
      expect(() => ioc.getWorkflowNamed({ bpmnProcessId: 123 } as any)).toThrow('workflow object is required');
    });
  });

  describe('isServiceBound', () => {
    beforeEach(() => {
      ioc.bindTo(TestService, TEST_IDENTIFIER);
      ioc.bindTo(TestServiceAnother, TEST_IDENTIFIER, undefined, 'test-name');
    });

    it('should return true for bound service', () => {
      expect(ioc.isServiceBound(TEST_IDENTIFIER)).toBe(true);
    });

    it('should return false for unbound service', () => {
      const UNBOUND_IDENTIFIER = Symbol('UnboundService');
      expect(ioc.isServiceBound(UNBOUND_IDENTIFIER)).toBe(false);
    });

    it('should return true for bound named service', () => {
      expect(ioc.isServiceBound(TEST_IDENTIFIER, 'test-name')).toBe(true);
    });

    it('should return false for unbound named service', () => {
      expect(ioc.isServiceBound(TEST_IDENTIFIER, 'non-existent')).toBe(false);
    });

    it('should throw error for empty service identifier', () => {
      expect(() => ioc.isServiceBound(null as any)).toThrow('param should not be empty');
      expect(() => ioc.isServiceBound(undefined as any)).toThrow('param should not be empty');
      expect(() => ioc.isServiceBound('' as any)).toThrow('param should not be empty');
    });
  });

  describe('unbind', () => {
    beforeEach(() => {
      ioc.bindTo(TestService, TEST_IDENTIFIER);
    });

    it('should unbind existing service and return true', () => {
      expect(ioc.isServiceBound(TEST_IDENTIFIER)).toBe(true);

      const result = ioc.unbind(TEST_IDENTIFIER);

      expect(result).toBe(true);
      expect(ioc.isServiceBound(TEST_IDENTIFIER)).toBe(false);
    });

    it('should return false when trying to unbind non-existent service', () => {
      const UNBOUND_IDENTIFIER = Symbol('UnboundService');
      const result = ioc.unbind(UNBOUND_IDENTIFIER);
      expect(result).toBe(false);
    });

    it('should throw error for empty name', () => {
      expect(() => ioc.unbind(null as any)).toThrow('we need to have a name');
      expect(() => ioc.unbind(undefined as any)).toThrow('we need to have a name');
      expect(() => ioc.unbind('' as any)).toThrow('we need to have a name');
    });

    it('should work with string identifiers', () => {
      ioc.bindTo(TestService, TEST_STRING_IDENTIFIER);

      const result = ioc.unbind(TEST_STRING_IDENTIFIER);

      expect(result).toBe(true);
      expect(ioc.isServiceBound(TEST_STRING_IDENTIFIER)).toBe(false);
    });
  });

  describe('getContainer', () => {
    it('should return the underlying inversify container', () => {
      const returnedContainer = ioc.getContainer();
      expect(returnedContainer).toBe(container);
      expect(returnedContainer).toBeInstanceOf(Container);
    });
  });

  describe('charSplit constant', () => {
    it('should have correct char split constant', () => {
      expect(IOC.charSplit).toBe(':');
    });
  });

  describe('integration scenarios', () => {
    it('should handle complex workflow binding and retrieval', () => {
      // Bind multiple versions of the same workflow
      const workflowV1 = { bpmnProcessId: 'orderProcess', version: 1 };
      const workflowV2 = { bpmnProcessId: 'orderProcess', version: 2 };
      const workflowNoVersion = { bpmnProcessId: 'orderProcess', version: 0 };

      // Bind the dependency that TestServiceWithDependency expects
      ioc.bindToObject('test-config', 'dependency');

      // Bind default service (without dependencies)
      ioc.bindTo(TestService, TEST_IDENTIFIER);

      // Bind version-specific services
      ioc.bindTask(TestServiceWithDependency, TEST_IDENTIFIER, workflowV1, ['dependency']);
      ioc.bindTask(TestServiceWithDependency, TEST_IDENTIFIER, workflowV2, ['dependency']);
      ioc.bindTask(TestServiceAnother, TEST_IDENTIFIER, workflowNoVersion);

      // Test retrieval
      const defaultInstance = ioc.getTask(TEST_IDENTIFIER);
      const v1Instance = ioc.getTask(TEST_IDENTIFIER, workflowV1) as TestServiceWithDependency;
      const v2Instance = ioc.getTask(TEST_IDENTIFIER, workflowV2) as TestServiceWithDependency;
      const noVersionInstance = ioc.getTask(TEST_IDENTIFIER, workflowNoVersion);

      expect(defaultInstance).toBeInstanceOf(TestService);
      expect(v1Instance).toBeInstanceOf(TestServiceWithDependency);
      expect(v1Instance.getName()).toContain('test-config');
      expect(v2Instance).toBeInstanceOf(TestServiceWithDependency);
      expect(v2Instance.getName()).toContain('test-config');
      expect(noVersionInstance).toBeInstanceOf(TestServiceAnother);
    });

    it('should handle rebinding and unbinding', () => {
      // Initial binding
      ioc.bindTo(TestService, TEST_IDENTIFIER);
      let instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestService);

      // Unbind and rebind with different service
      ioc.unbind(TEST_IDENTIFIER);
      ioc.bindTo(TestServiceAnother, TEST_IDENTIFIER);

      instance = ioc.get<ITestService>(TEST_IDENTIFIER);
      expect(instance).toBeInstanceOf(TestServiceAnother);
    });
  });
});
