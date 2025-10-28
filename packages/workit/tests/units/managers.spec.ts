/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import {
  ICreateWorkflowInstance,
  ICreateWorkflowInstanceResponse,
  IDeployWorkflowResponse,
  IPagination,
  IPaginationOptions,
  IPublishMessage,
  IUpdateWorkflowRetry,
  IUpdateWorkflowVariables,
  IWorkflow,
  IWorkflowClient,
  IWorkflowDefinition,
  IWorkflowDefinitionRequest,
  IWorkflowOptions,
} from '@villedemontreal/workit-types';
// Mock debug module with full compatibility
jest.mock('debug', () => {
  const mockDebugInstance = jest.fn();
  const mockDebug: any = jest.fn(() => mockDebugInstance);

  // Ensure it works as both CJS and ESM
  mockDebug.default = mockDebug;
  mockDebug.enabled = jest.fn(() => false);
  mockDebug.humanize = jest.fn();
  mockDebug.coerce = jest.fn();
  mockDebug.disable = jest.fn();
  mockDebug.enable = jest.fn();
  mockDebug.selectColor = jest.fn();
  mockDebug.formatArgs = jest.fn();
  mockDebug.save = jest.fn();
  mockDebug.load = jest.fn();
  mockDebug.useColors = jest.fn(() => false);
  mockDebug.colors = [];
  mockDebug.inspectOpts = {};

  return mockDebug;
});

// Mock sqs-consumer module completely
jest.mock('sqs-consumer', () => {
  const mockConsumer = {
    start: jest.fn(),
    stop: jest.fn(),
    on: jest.fn(),
    off: jest.fn(),
    emit: jest.fn(),
    isRunning: false,
  };

  return {
    Consumer: {
      create: jest.fn(() => mockConsumer),
    },
    default: {
      create: jest.fn(() => mockConsumer),
    },
  };
});

// Mock AWS SDK modules
jest.mock('@aws-sdk/client-sqs', () => ({
  SQSClient: jest.fn().mockImplementation(() => ({})),
}));

jest.mock('@aws-sdk/client-sfn', () => ({
  SFNClient: jest.fn().mockImplementation(() => ({})),
}));

import { ClientManager } from '../../src/camunda-n-mq/clientManager';
import { CamundaManager } from '../../src/camundaBpm/camundaManager';
import { StepFunctionManager } from '../../src/stepFunction/stepFunctionManager';

// Mock workflow client
const createMockWorkflowClient = (): jest.Mocked<IWorkflowClient> => ({
  deployWorkflow: jest.fn(),
  getWorkflows: jest.fn(),
  getWorkflow: jest.fn(),
  updateVariables: jest.fn(),
  updateJobRetries: jest.fn(),
  publishMessage: jest.fn(),
  createWorkflowInstance: jest.fn(),
  resolveIncident: jest.fn(),
  cancelWorkflowInstance: jest.fn(),
});

// Test implementation of ClientManager for direct testing
class TestClientManager extends ClientManager<IWorkflowClient> {
  constructor(client: IWorkflowClient) {
    super(client);
  }

  // Expose protected member for testing
  public getClient(): IWorkflowClient {
    return this._client;
  }
}

describe('Manager Classes', () => {
  describe('ClientManager (Base Class)', () => {
    let mockClient: jest.Mocked<IWorkflowClient>;
    let manager: TestClientManager;

    beforeEach(() => {
      mockClient = createMockWorkflowClient();
      manager = new TestClientManager(mockClient);
    });

    describe('constructor', () => {
      it('should initialize with client', () => {
        expect(manager.getClient()).toBe(mockClient);
      });
    });

    describe('deployWorkflow', () => {
      it('should delegate to underlying client', async () => {
        const mockResponse: IDeployWorkflowResponse = {
          key: 'deployment-123',
          workflows: [
            {
              bpmnProcessId: 'test-process',
              workflowKey: 'test-key',
              resourceName: 'test.bpmn',
              version: 1,
            },
          ],
        };
        mockClient.deployWorkflow.mockResolvedValue(mockResponse);

        const result = await manager.deployWorkflow('/path/to/workflow.bpmn');

        expect(mockClient.deployWorkflow).toHaveBeenCalledWith('/path/to/workflow.bpmn', undefined);
        expect(result).toBe(mockResponse);
      });

      it('should pass override parameters', async () => {
        const override = { deploymentName: 'custom-deployment' };
        const mockResponse: IDeployWorkflowResponse = {
          key: 'deployment-456',
          workflows: [
            {
              bpmnProcessId: 'custom-process',
              workflowKey: 'custom-key',
              resourceName: 'custom.bpmn',
              version: 1,
            },
          ],
        };
        mockClient.deployWorkflow.mockResolvedValue(mockResponse);

        const result = await manager.deployWorkflow('/path/to/workflow.bpmn', override);

        expect(mockClient.deployWorkflow).toHaveBeenCalledWith('/path/to/workflow.bpmn', override);
        expect(result).toBe(mockResponse);
      });

      it('should propagate client errors', async () => {
        const error = new Error('Deployment failed');
        mockClient.deployWorkflow.mockRejectedValue(error);

        await expect(manager.deployWorkflow('/invalid/path')).rejects.toThrow('Deployment failed');
        expect(mockClient.deployWorkflow).toHaveBeenCalledWith('/invalid/path', undefined);
      });
    });

    describe('getWorkflows', () => {
      it('should get workflows without options', async () => {
        const mockWorkflows: IPagination<IWorkflow> = {
          items: [
            { bpmnProcessId: 'process-1', version: 1, workflowKey: 'key-1', resourceName: 'process1.bpmn' },
            { bpmnProcessId: 'process-2', version: 1, workflowKey: 'key-2', resourceName: 'process2.bpmn' },
          ],
          paging: { from: 0, size: 10, totalCount: 2 },
        };
        mockClient.getWorkflows.mockResolvedValue(mockWorkflows);

        const result = await manager.getWorkflows();

        expect(mockClient.getWorkflows).toHaveBeenCalledWith(undefined);
        expect(result).toBe(mockWorkflows);
      });

      it('should get workflows with options', async () => {
        const options: Partial<IWorkflowOptions & IPaginationOptions> = {
          bpmnProcessId: 'test-process',
          from: 0,
          size: 5,
        };
        const mockWorkflows: IPagination<IWorkflow> = {
          items: [{ bpmnProcessId: 'test-process', version: 1, workflowKey: 'key-1', resourceName: 'test.bpmn' }],
          paging: { from: 0, size: 5, totalCount: 1 },
        };
        mockClient.getWorkflows.mockResolvedValue(mockWorkflows);

        const result = await manager.getWorkflows(options);

        expect(mockClient.getWorkflows).toHaveBeenCalledWith(options);
        expect(result).toBe(mockWorkflows);
      });

      it('should handle empty results', async () => {
        const mockEmptyResult: IPagination<IWorkflow> = {
          items: [],
          paging: { from: 0, size: 10, totalCount: 0 },
        };
        mockClient.getWorkflows.mockResolvedValue(mockEmptyResult);

        const result = await manager.getWorkflows();

        expect(result.items).toHaveLength(0);
        expect(result.paging.totalCount).toBe(0);
      });

      it('should propagate client errors', async () => {
        const error = new Error('Failed to fetch workflows');
        mockClient.getWorkflows.mockRejectedValue(error);

        await expect(manager.getWorkflows()).rejects.toThrow('Failed to fetch workflows');
      });
    });

    describe('getWorkflow', () => {
      it('should get workflow by definition request', async () => {
        const payload: IWorkflowDefinitionRequest = {
          bpmnProcessId: 'test-process',
          version: 1,
        };
        const mockDefinition: IWorkflowDefinition = {
          bpmnProcessId: 'test-process',
          version: 1,
          workflowKey: 'workflow-key-123',
          resourceName: 'test-process.bpmn',
          bpmnXml: '<bpmn>...</bpmn>',
        };
        mockClient.getWorkflow.mockResolvedValue(mockDefinition);

        const result = await manager.getWorkflow(payload);

        expect(mockClient.getWorkflow).toHaveBeenCalledWith(payload);
        expect(result).toBe(mockDefinition);
      });

      it('should handle latest version request', async () => {
        const payload: IWorkflowDefinitionRequest = {
          bpmnProcessId: 'test-process',
        };
        const mockDefinition: IWorkflowDefinition = {
          bpmnProcessId: 'test-process',
          version: 3, // Latest version
          workflowKey: 'workflow-key-456',
          resourceName: 'test-process.bpmn',
          bpmnXml: '<bpmn>...</bpmn>',
        };
        mockClient.getWorkflow.mockResolvedValue(mockDefinition);

        const result = await manager.getWorkflow(payload);

        expect(mockClient.getWorkflow).toHaveBeenCalledWith(payload);
        expect(result.version).toBe(3);
      });
    });

    describe('updateVariables', () => {
      it('should update workflow variables', async () => {
        const payload: IUpdateWorkflowVariables = {
          processInstanceId: 'instance-123',
          variables: { status: 'updated', count: 42 },
        };
        mockClient.updateVariables.mockResolvedValue(undefined);

        await manager.updateVariables(payload);

        expect(mockClient.updateVariables).toHaveBeenCalledWith(payload);
      });

      it('should handle empty variables', async () => {
        const payload: IUpdateWorkflowVariables = {
          processInstanceId: 'instance-123',
          variables: {},
        };
        mockClient.updateVariables.mockResolvedValue(undefined);

        await manager.updateVariables(payload);

        expect(mockClient.updateVariables).toHaveBeenCalledWith(payload);
      });

      it('should propagate update errors', async () => {
        const payload: IUpdateWorkflowVariables = {
          processInstanceId: 'invalid-instance',
          variables: { test: 'value' },
        };
        const error = new Error('Instance not found');
        mockClient.updateVariables.mockRejectedValue(error);

        await expect(manager.updateVariables(payload)).rejects.toThrow('Instance not found');
      });
    });

    describe('updateJobRetries', () => {
      it('should update job retries', async () => {
        const payload: IUpdateWorkflowRetry = {
          jobKey: 'job-123',
          retries: 3,
        };
        mockClient.updateJobRetries.mockResolvedValue(undefined);

        await manager.updateJobRetries(payload);

        expect(mockClient.updateJobRetries).toHaveBeenCalledWith(payload);
      });

      it('should handle zero retries', async () => {
        const payload: IUpdateWorkflowRetry = {
          jobKey: 'job-456',
          retries: 0,
        };
        mockClient.updateJobRetries.mockResolvedValue(undefined);

        await manager.updateJobRetries(payload);

        expect(mockClient.updateJobRetries).toHaveBeenCalledWith(payload);
      });

      it('should propagate retry update errors', async () => {
        const payload: IUpdateWorkflowRetry = {
          jobKey: 'invalid-job',
          retries: 5,
        };
        const error = new Error('Job not found');
        mockClient.updateJobRetries.mockRejectedValue(error);

        await expect(manager.updateJobRetries(payload)).rejects.toThrow('Job not found');
      });
    });

    describe('publishMessage', () => {
      it('should publish message with variables and correlation keys', async () => {
        const payload: IPublishMessage<any, any> = {
          name: 'TestMessage',
          variables: { data: 'test-data', id: 123 },
          correlation: { orderId: 'order-456' },
          messageId: 'instance-789',
        };
        mockClient.publishMessage.mockResolvedValue(undefined);

        await manager.publishMessage(payload);

        expect(mockClient.publishMessage).toHaveBeenCalledWith(payload);
      });

      it('should publish message without optional fields', async () => {
        const payload: IPublishMessage<any, any> = {
          name: 'SimpleMessage',
          variables: {},
          correlation: {},
        };
        mockClient.publishMessage.mockResolvedValue(undefined);

        await manager.publishMessage(payload);

        expect(mockClient.publishMessage).toHaveBeenCalledWith(payload);
      });

      it('should handle complex message data types', async () => {
        const payload: IPublishMessage<{ user: { id: number; name: string } }, { sessionId: string }> = {
          name: 'UserMessage',
          variables: { user: { id: 123, name: 'John Doe' } },
          correlation: { sessionId: 'session-abc' },
        };
        mockClient.publishMessage.mockResolvedValue(undefined);

        await manager.publishMessage(payload);

        expect(mockClient.publishMessage).toHaveBeenCalledWith(payload);
      });
    });

    describe('createWorkflowInstance', () => {
      it('should create workflow instance', async () => {
        const model: ICreateWorkflowInstance<any> = {
          bpmnProcessId: 'test-process',
          variables: { startData: 'initial-value' },
        };
        const mockResponse: ICreateWorkflowInstanceResponse = {
          workflowKey: 'workflow-key-123',
          bpmnProcessId: 'test-process',
          version: 1,
          workflowInstanceKey: 'instance-456',
        };
        mockClient.createWorkflowInstance.mockResolvedValue(mockResponse);

        const result = await manager.createWorkflowInstance(model);

        expect(mockClient.createWorkflowInstance).toHaveBeenCalledWith(model);
        expect(result).toBe(mockResponse);
      });

      it('should create instance with version specification', async () => {
        const model: ICreateWorkflowInstance<any> = {
          bpmnProcessId: 'test-process',
          version: 2,
          variables: { version: 'specific' },
        };
        const mockResponse: ICreateWorkflowInstanceResponse = {
          workflowKey: 'workflow-key-123',
          bpmnProcessId: 'test-process',
          version: 2,
          workflowInstanceKey: 'instance-789',
        };
        mockClient.createWorkflowInstance.mockResolvedValue(mockResponse);

        const result = await manager.createWorkflowInstance(model);

        expect(result.version).toBe(2);
      });

      it('should handle empty variables', async () => {
        const model: ICreateWorkflowInstance<any> = {
          bpmnProcessId: 'empty-vars-process',
          variables: {},
        };
        const mockResponse: ICreateWorkflowInstanceResponse = {
          workflowKey: 'workflow-key-empty',
          bpmnProcessId: 'empty-vars-process',
          version: 1,
          workflowInstanceKey: 'instance-empty',
        };
        mockClient.createWorkflowInstance.mockResolvedValue(mockResponse);

        await manager.createWorkflowInstance(model);

        expect(mockClient.createWorkflowInstance).toHaveBeenCalledWith(model);
      });
    });

    describe('resolveIncident', () => {
      it('should resolve incident by key', async () => {
        const incidentKey = 'incident-123';
        mockClient.resolveIncident.mockResolvedValue(undefined);

        await manager.resolveIncident(incidentKey);

        expect(mockClient.resolveIncident).toHaveBeenCalledWith(incidentKey);
      });

      it('should handle resolve incident errors', async () => {
        const incidentKey = 'invalid-incident';
        const error = new Error('Incident not found');
        mockClient.resolveIncident.mockRejectedValue(error);

        await expect(manager.resolveIncident(incidentKey)).rejects.toThrow('Incident not found');
      });
    });

    describe('cancelWorkflowInstance', () => {
      it('should cancel workflow instance', async () => {
        const instanceId = 'instance-123';
        mockClient.cancelWorkflowInstance.mockResolvedValue(undefined);

        await manager.cancelWorkflowInstance(instanceId);

        expect(mockClient.cancelWorkflowInstance).toHaveBeenCalledWith(instanceId);
      });

      it('should handle cancel errors', async () => {
        const instanceId = 'invalid-instance';
        const error = new Error('Instance not found or already completed');
        mockClient.cancelWorkflowInstance.mockRejectedValue(error);

        await expect(manager.cancelWorkflowInstance(instanceId)).rejects.toThrow(
          'Instance not found or already completed',
        );
      });
    });
  });

  describe('CamundaManager', () => {
    let mockClient: jest.Mocked<IWorkflowClient>;
    let manager: CamundaManager;

    beforeEach(() => {
      mockClient = createMockWorkflowClient();
      manager = new CamundaManager(mockClient);
    });

    it('should be instance of CamundaManager and ClientManager', () => {
      expect(manager).toBeInstanceOf(CamundaManager);
      expect(manager).toBeInstanceOf(ClientManager);
    });

    it('should inherit all ClientManager functionality', async () => {
      const mockResponse: IDeployWorkflowResponse = {
        key: 'camunda-deployment-123',
        workflows: [
          {
            bpmnProcessId: 'camunda-process',
            workflowKey: 'camunda-key',
            resourceName: 'camunda.bpmn',
            version: 1,
          },
        ],
      };
      mockClient.deployWorkflow.mockResolvedValue(mockResponse);

      const result = await manager.deployWorkflow('/path/to/camunda/workflow.bpmn');

      expect(mockClient.deployWorkflow).toHaveBeenCalledWith('/path/to/camunda/workflow.bpmn', undefined);
      expect(result).toBe(mockResponse);
    });

    it('should work with Camunda-specific features', async () => {
      // Test Camunda-specific workflow operations
      const createInstancePayload: ICreateWorkflowInstance<any> = {
        bpmnProcessId: 'camunda-process',
        variables: { camundaSpecific: true },
      };
      const mockResponse: ICreateWorkflowInstanceResponse = {
        workflowKey: 'camunda-workflow-key',
        bpmnProcessId: 'camunda-process',
        version: 1,
        workflowInstanceKey: 'camunda-instance-123',
      };
      mockClient.createWorkflowInstance.mockResolvedValue(mockResponse);

      const result = await manager.createWorkflowInstance(createInstancePayload);

      expect(result.bpmnProcessId).toBe('camunda-process');
      expect(result.workflowInstanceKey).toBe('camunda-instance-123');
    });
  });

  describe('StepFunctionManager', () => {
    let mockClient: jest.Mocked<IWorkflowClient>;
    let manager: StepFunctionManager;

    beforeEach(() => {
      mockClient = createMockWorkflowClient();
      manager = new StepFunctionManager(mockClient);
    });

    it('should be instance of StepFunctionManager and ClientManager', () => {
      expect(manager).toBeInstanceOf(StepFunctionManager);
      expect(manager).toBeInstanceOf(ClientManager);
    });

    it('should inherit all ClientManager functionality', async () => {
      const mockResponse: IDeployWorkflowResponse = {
        key: 'sf-deployment-456',
        workflows: [
          {
            bpmnProcessId: 'step-function-process',
            workflowKey: 'step-function-key',
            resourceName: 'stepfunction.json',
            version: 1,
          },
        ],
      };
      mockClient.deployWorkflow.mockResolvedValue(mockResponse);

      const result = await manager.deployWorkflow('/path/to/stepfunction/workflow.json');

      expect(mockClient.deployWorkflow).toHaveBeenCalledWith('/path/to/stepfunction/workflow.json', undefined);
      expect(result).toBe(mockResponse);
    });

    it('should work with Step Functions-specific features', async () => {
      // Test Step Functions-specific workflow operations
      const createInstancePayload: ICreateWorkflowInstance<any> = {
        bpmnProcessId: 'step-function-process',
        variables: { awsSpecific: true, executionName: 'sf-execution-123' },
      };
      const mockResponse: ICreateWorkflowInstanceResponse = {
        workflowKey: 'sf-state-machine-arn',
        bpmnProcessId: 'step-function-process',
        version: 1,
        workflowInstanceKey: 'sf-execution-456',
      };
      mockClient.createWorkflowInstance.mockResolvedValue(mockResponse);

      const result = await manager.createWorkflowInstance(createInstancePayload);

      expect(result.bpmnProcessId).toBe('step-function-process');
      expect(result.workflowInstanceKey).toBe('sf-execution-456');
    });

    it('should handle Step Functions message publishing', async () => {
      const messagePayload: IPublishMessage<any, any> = {
        name: 'StepFunctionMessage',
        variables: { stepFunctionData: 'test' },
        correlation: { executionArn: 'arn:aws:states:us-east-1:123:execution:test' },
      };
      mockClient.publishMessage.mockResolvedValue(undefined);

      await manager.publishMessage(messagePayload);

      expect(mockClient.publishMessage).toHaveBeenCalledWith(messagePayload);
    });
  });

  describe('Integration Scenarios', () => {
    let camundaClient: jest.Mocked<IWorkflowClient>;
    let stepFunctionClient: jest.Mocked<IWorkflowClient>;
    let camundaManager: CamundaManager;
    let stepFunctionManager: StepFunctionManager;

    beforeEach(() => {
      camundaClient = createMockWorkflowClient();
      stepFunctionClient = createMockWorkflowClient();
      camundaManager = new CamundaManager(camundaClient);
      stepFunctionManager = new StepFunctionManager(stepFunctionClient);
    });

    it('should handle parallel workflow operations', async () => {
      // Setup different responses for each manager
      const camundaResponse: IDeployWorkflowResponse = {
        key: 'camunda-123',
        workflows: [
          {
            bpmnProcessId: 'camunda-workflow',
            workflowKey: 'camunda-key',
            resourceName: 'camunda.bpmn',
            version: 1,
          },
        ],
      };
      const stepFunctionResponse: IDeployWorkflowResponse = {
        key: 'sf-456',
        workflows: [
          {
            bpmnProcessId: 'step-function-workflow',
            workflowKey: 'sf-key',
            resourceName: 'stepfunction.json',
            version: 1,
          },
        ],
      };

      camundaClient.deployWorkflow.mockResolvedValue(camundaResponse);
      stepFunctionClient.deployWorkflow.mockResolvedValue(stepFunctionResponse);

      // Deploy workflows in parallel
      const [camundaResult, stepFunctionResult] = await Promise.all([
        camundaManager.deployWorkflow('/camunda/workflow.bpmn'),
        stepFunctionManager.deployWorkflow('/stepfunction/workflow.json'),
      ]);

      expect(camundaResult.key).toBe('camunda-123');
      expect(stepFunctionResult.key).toBe('sf-456');
      expect(camundaClient.deployWorkflow).toHaveBeenCalledWith('/camunda/workflow.bpmn', undefined);
      expect(stepFunctionClient.deployWorkflow).toHaveBeenCalledWith('/stepfunction/workflow.json', undefined);
    });

    it('should handle workflow lifecycle across different engines', async () => {
      // Deploy
      const deployResponse: IDeployWorkflowResponse = {
        key: 'workflow-123',
        workflows: [
          {
            bpmnProcessId: 'multi-engine-workflow',
            workflowKey: 'multi-key',
            resourceName: 'multi.bpmn',
            version: 1,
          },
        ],
      };
      camundaClient.deployWorkflow.mockResolvedValue(deployResponse);

      await camundaManager.deployWorkflow('/workflows/test.bpmn');

      // Create instance
      const createInstanceResponse: ICreateWorkflowInstanceResponse = {
        workflowKey: 'workflow-key-123',
        bpmnProcessId: 'test-process',
        version: 1,
        workflowInstanceKey: 'instance-456',
      };
      camundaClient.createWorkflowInstance.mockResolvedValue(createInstanceResponse);

      const instanceResult = await camundaManager.createWorkflowInstance({
        bpmnProcessId: 'test-process',
        variables: { testData: 'lifecycle-test' },
      });

      // Update variables
      camundaClient.updateVariables.mockResolvedValue(undefined);
      await camundaManager.updateVariables({
        processInstanceId: instanceResult.workflowInstanceKey,
        variables: { status: 'updated' },
      });

      // Cancel instance
      camundaClient.cancelWorkflowInstance.mockResolvedValue(undefined);
      await camundaManager.cancelWorkflowInstance(instanceResult.workflowInstanceKey);

      expect(camundaClient.deployWorkflow).toHaveBeenCalledTimes(1);
      expect(camundaClient.createWorkflowInstance).toHaveBeenCalledTimes(1);
      expect(camundaClient.updateVariables).toHaveBeenCalledTimes(1);
      expect(camundaClient.cancelWorkflowInstance).toHaveBeenCalledTimes(1);
    });

    it('should handle error propagation consistently', async () => {
      const deployError = new Error('Deployment failed');
      const instanceError = new Error('Instance creation failed');

      camundaClient.deployWorkflow.mockRejectedValue(deployError);
      stepFunctionClient.createWorkflowInstance.mockRejectedValue(instanceError);

      await expect(camundaManager.deployWorkflow('/invalid/path')).rejects.toThrow('Deployment failed');
      await expect(
        stepFunctionManager.createWorkflowInstance({
          bpmnProcessId: 'invalid',
          variables: {},
        }),
      ).rejects.toThrow('Instance creation failed');
    });
  });
});
