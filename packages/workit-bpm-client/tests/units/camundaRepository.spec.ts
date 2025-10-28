/*!
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import {
  IBpmn,
  ICamundaBpmCreateInstanceResponse,
  ICamundaConfig,
  IIncident,
  IProcessDefinition,
} from '@villedemontreal/workit-types';
import axios from 'axios';
import * as fs from 'fs';
import { CamundaRepository } from '../../src/repositories/camundaRepository';

// Mock dependencies
jest.mock('axios');
jest.mock('fs');

// Mock form-data manually
const mockFormData = {
  append: jest.fn(),
  getBoundary: jest.fn().mockReturnValue('test-boundary'),
};
jest.mock('form-data', () => {
  return jest.fn().mockImplementation(() => mockFormData);
});

const mockedAxios = axios as jest.Mocked<typeof axios>;
const mockedFs = fs as jest.Mocked<typeof fs>;

describe('CamundaRepository', () => {
  let repository: CamundaRepository;
  let mockAxiosInstance: any;
  let config: ICamundaConfig;

  beforeEach(() => {
    // Clear all mocks
    jest.clearAllMocks();

    // Reset form-data mock
    mockFormData.append.mockClear();
    mockFormData.getBoundary.mockReturnValue('test-boundary');

    // Mock axios create
    mockAxiosInstance = {
      post: jest.fn(),
      get: jest.fn(),
      put: jest.fn(),
      delete: jest.fn(),
    };
    mockedAxios.create.mockReturnValue(mockAxiosInstance);

    // Setup config
    config = {
      baseUrl: 'http://localhost:8080/engine-rest',
      workerId: 'test-worker',
      topicName: 'test-topic',
      maxTasks: 10,
      autoPoll: false,
    };

    repository = new CamundaRepository(config);
  });

  describe('constructor', () => {
    it('should create axios instance with correct configuration', () => {
      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/engine-rest',
        timeout: 30000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-APP': 'test-worker',
        },
      });
    });

    it('should handle missing workerId in config', () => {
      const configWithoutWorkerId: ICamundaConfig = {
        baseUrl: 'http://localhost:8080/engine-rest',
        workerId: '',
        topicName: 'test-topic',
        maxTasks: 10,
        autoPoll: false,
      };

      new CamundaRepository(configWithoutWorkerId);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/engine-rest',
        timeout: 30000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-APP': 'unknow',
        },
      });
    });

    it('should apply interceptor headers when interceptors are configured', () => {
      const interceptorFunc = jest.fn().mockReturnValue({
        headers: { Authorization: 'Bearer token123' },
      });
      Object.defineProperty(interceptorFunc, 'name', { value: 'bound interceptor' });

      const configWithInterceptors: ICamundaConfig = {
        ...config,
        interceptors: [interceptorFunc],
      };

      new CamundaRepository(configWithInterceptors);

      expect(mockedAxios.create).toHaveBeenCalledWith({
        baseURL: 'http://localhost:8080/engine-rest',
        timeout: 30000,
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-APP': 'test-worker',
          Authorization: 'Bearer token123',
        },
      });
    });
  });

  describe('deployWorkflow', () => {
    it('should deploy workflow with correct form data', async () => {
      const mockStream = {} as any;

      mockedFs.createReadStream.mockReturnValue(mockStream);

      const mockResponse = { data: { id: 'deployment-1' } };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.deployWorkflow('test-deployment', '/path/to/workflow.bpmn');

      expect(mockedFs.createReadStream).toHaveBeenCalledWith('/path/to/workflow.bpmn');
      expect(mockFormData.append).toHaveBeenCalledWith('deployment-name', 'test-deployment');
      expect(mockFormData.append).toHaveBeenCalledWith('process', mockStream);
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/deployment/create', mockFormData, {
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
          'X-APP': 'test-worker',
          'content-type': 'multipart/form-data; boundary=test-boundary',
        },
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('getWorkflows', () => {
    it('should get workflows without options', async () => {
      const mockWorkflows: IBpmn[] = [
        {
          id: '1',
          name: 'Process 1',
          key: 'process1',
          version: 1,
          category: 'test-category',
          resource: 'process1.bpmn',
          deploymentId: 'deployment-1',
          suspended: false,
          historyTimeToLive: 30,
          startableInTasklist: true,
        },
        {
          id: '2',
          name: 'Process 2',
          key: 'process2',
          version: 1,
          category: 'test-category',
          resource: 'process2.bpmn',
          deploymentId: 'deployment-2',
          suspended: false,
          historyTimeToLive: 30,
          startableInTasklist: true,
        },
      ];
      const mockResponse = { data: mockWorkflows };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.getWorkflows();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition', undefined);
      expect(result).toBe(mockResponse);
    });

    it('should get workflows with options', async () => {
      const options = { params: { key: 'test' } };
      const mockResponse = { data: [] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.getWorkflows(options);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition', options);
      expect(result).toBe(mockResponse);
    });
  });

  describe('getWorkflowCount', () => {
    it('should get workflow count', async () => {
      const mockResponse = { data: { count: 5 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.getWorkflowCount();

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition/count', undefined);
      expect(result).toBe(mockResponse);
    });

    it('should get workflow count with options', async () => {
      const options = { params: { key: 'test' } };
      const mockResponse = { data: { count: 2 } };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.getWorkflowCount(options);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition/count', options);
      expect(result).toBe(mockResponse);
    });
  });

  describe('createWorkflowInstance', () => {
    beforeEach(() => {
      // Mock Utils.serializeVariables since it's used in the implementation
      jest.doMock('../../src/utils/utils', () => ({
        Utils: {
          serializeVariables: jest.fn().mockImplementation((vars) => ({ serialized: vars })),
        },
      }));
    });

    it('should create workflow instance using process definition id', async () => {
      const processId = 'process:1:abc123';
      const variables = { testVar: 'testValue' };
      const mockResponse = { data: { id: 'instance-1' } as ICamundaBpmCreateInstanceResponse };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.createWorkflowInstance(processId, variables);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-definition/process:1:abc123/start', {
        businessKey: undefined,
        variables: {
          testVar: {
            type: 'string',
            value: 'testValue',
            valueInfo: {},
            local: false,
          },
        },
      });
      expect(result).toBe(mockResponse);
    });

    it('should create workflow instance using process key', async () => {
      const processKey = 'test-process';
      const variables = { testVar: 'testValue' };
      const mockResponse = { data: { id: 'instance-1' } as ICamundaBpmCreateInstanceResponse };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.createWorkflowInstance(processKey, variables);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-definition/key/test-process/start', {
        businessKey: undefined,
        variables: {
          testVar: {
            type: 'string',
            value: 'testValue',
            valueInfo: {},
            local: false,
          },
        },
      });
      expect(result).toBe(mockResponse);
    });

    it('should handle variables with businessKey', async () => {
      const processKey = 'test-process';
      const variables = { businessKey: 'business-123', testVar: 'testValue' };
      const mockResponse = { data: { id: 'instance-1' } as ICamundaBpmCreateInstanceResponse };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.createWorkflowInstance(processKey, variables);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-definition/key/test-process/start', {
        businessKey: 'business-123',
        variables: {
          businessKey: {
            type: 'string',
            value: 'business-123',
            valueInfo: {},
            local: false,
          },
          testVar: {
            type: 'string',
            value: 'testValue',
            valueInfo: {},
            local: false,
          },
        },
      });
      expect(result).toBe(mockResponse);
    });

    it('should handle primitive variables', async () => {
      const processKey = 'test-process';
      const variables = {
        stringVar: 'hello',
        numberVar: 42,
        boolVar: true,
      };
      const mockResponse = { data: { id: 'instance-1' } as ICamundaBpmCreateInstanceResponse };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.createWorkflowInstance(processKey, variables);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-definition/key/test-process/start', {
        businessKey: undefined,
        variables: {
          stringVar: {
            type: 'string',
            value: 'hello',
            valueInfo: {},
            local: false,
          },
          numberVar: {
            type: 'integer',
            value: 42,
            valueInfo: {},
            local: false,
          },
          boolVar: {
            type: 'boolean',
            value: true,
            valueInfo: {},
            local: false,
          },
        },
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('publishMessage', () => {
    it('should publish message with correct payload', async () => {
      const messageData = {
        messageName: 'TestMessage',
        processInstanceId: 'instance-123',
        variables: { var1: 'value1' },
        correlationKeys: { corrKey: 'corrValue' },
      };

      mockAxiosInstance.post.mockResolvedValue({});

      await repository.publishMessage(messageData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/message', {
        messageName: 'TestMessage',
        processInstanceId: 'instance-123',
        correlationKeys: {
          corrKey: {
            type: 'string',
            value: 'corrValue',
            valueInfo: {},
            local: false,
          },
        },
        businessKey: undefined,
        processVariables: {
          var1: {
            type: 'string',
            value: 'value1',
            valueInfo: {},
            local: false,
          },
        },
        resultEnabled: false,
        all: true,
      });
    });

    it('should handle variables with businessKey in publishMessage', async () => {
      const messageData = {
        messageName: 'TestMessage',
        processInstanceId: 'instance-123',
        variables: { businessKey: 'business-key', var1: 'value1' },
        correlationKeys: { corrKey: 'corrValue' },
      };

      mockAxiosInstance.post.mockResolvedValue({});

      await repository.publishMessage(messageData);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/message', {
        messageName: 'TestMessage',
        processInstanceId: 'instance-123',
        correlationKeys: {
          corrKey: {
            type: 'string',
            value: 'corrValue',
            valueInfo: {},
            local: false,
          },
        },
        businessKey: 'business-key',
        processVariables: {
          businessKey: {
            type: 'string',
            value: 'business-key',
            valueInfo: {},
            local: false,
          },
          var1: {
            type: 'string',
            value: 'value1',
            valueInfo: {},
            local: false,
          },
        },
        resultEnabled: false,
        all: true,
      });
    });
  });

  describe('cancelWorkflowInstance', () => {
    it('should cancel workflow instance with correct parameters', async () => {
      const instanceId = 'instance-123';
      mockAxiosInstance.delete.mockResolvedValue({});

      await repository.cancelWorkflowInstance(instanceId);

      expect(mockAxiosInstance.delete).toHaveBeenCalledWith(
        '/process-instance/instance-123?skipCustomListeners=true&skipIoMappings=true&skipSubprocesses=true',
      );
    });
  });

  describe('getIncident', () => {
    it('should get incident by key', async () => {
      const incidentKey = 'incident-123';
      const mockIncident: IIncident = {
        id: 'incident-123',
        processDefinitionId: 'process-def-123',
        processInstanceId: 'process-instance-456',
        executionId: 'execution-123',
        incidentTimestamp: '2023-12-01T10:00:00.000Z',
        incidentType: 'failedJob',
        activityId: 'activity-789',
        causeIncidentId: 'cause-123',
        rootCauseIncidentId: 'root-123',
        configuration: 'config-123',
        incidentMessage: 'Test error',
      };
      const mockResponse = { data: [mockIncident] };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.getIncident(incidentKey);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/incident/?incidentId=incident-123');
      expect(result).toBe(mockIncident);
    });

    it('should return first incident from array', async () => {
      const incidentKey = 'incident-123';
      const incidents: IIncident[] = [
        { id: 'incident-1', processInstanceId: 'process-1' } as IIncident,
        { id: 'incident-2', processInstanceId: 'process-2' } as IIncident,
      ];
      const mockResponse = { data: incidents };
      mockAxiosInstance.get.mockResolvedValue(mockResponse);

      const result = await repository.getIncident(incidentKey);

      expect(result).toBe(incidents[0]);
    });
  });

  describe('resolveIncident', () => {
    it('should resolve incident by modifying process instance', async () => {
      const incidentKey = 'incident-123';
      const mockIncident: IIncident = {
        id: 'incident-123',
        processDefinitionId: 'process-def-123',
        processInstanceId: 'process-instance-456',
        executionId: 'execution-123',
        incidentTimestamp: '2023-12-01T10:00:00.000Z',
        incidentType: 'failedJob',
        activityId: 'activity-789',
        causeIncidentId: 'cause-123',
        rootCauseIncidentId: 'root-123',
        configuration: 'config-123',
        incidentMessage: 'Test error',
      };

      mockAxiosInstance.get.mockResolvedValue({ data: [mockIncident] });
      mockAxiosInstance.post.mockResolvedValue({});

      await repository.resolveIncident(incidentKey);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/incident/?incidentId=incident-123');
      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-instance/process-instance-456/modification', {
        skipCustomListeners: true,
        skipIoMappings: true,
        instructions: [
          {
            type: 'cancel',
            activityId: 'activity-789',
          },
        ],
      });
    });
  });

  describe('getWorkflow', () => {
    it('should throw error if idOrKey is empty', async () => {
      await expect(repository.getWorkflow('')).rejects.toThrow('Id or Key must be specified');
      await expect(repository.getWorkflow(null as any)).rejects.toThrow('Id or Key must be specified');
      await expect(repository.getWorkflow(undefined as any)).rejects.toThrow('Id or Key must be specified');
    });

    it('should get workflow by process definition id', async () => {
      const processId = 'process:1:abc123';
      const mockProcessDef: IProcessDefinition = {
        id: processId,
        name: 'Test Process',
        key: 'testProcess',
        version: 1,
        category: 'test-category',
        resource: 'test-resource.bpmn',
        deploymentId: 'deployment-1',
        suspended: false,
        historyTimeToLive: 30,
      };
      const mockXmlResponse = { data: { bpmn20Xml: '<bpmn>...</bpmn>' } };

      mockAxiosInstance.get.mockImplementation((url: string) => {
        if (url.includes('/xml')) {
          return Promise.resolve(mockXmlResponse);
        }
        return Promise.resolve({ data: mockProcessDef });
      });

      const result = await repository.getWorkflow(processId);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition/process:1:abc123');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition/process:1:abc123/xml');
      expect(result).toEqual({
        ...mockProcessDef,
        bpmn20Xml: '<bpmn>...</bpmn>',
      });
    });

    it('should get workflow by process key', async () => {
      const processKey = 'testProcess';
      const mockProcessDef: IProcessDefinition = {
        id: 'process:1:abc123',
        name: 'Test Process',
        key: processKey,
        version: 1,
        category: 'test-category',
        resource: 'test-resource.bpmn',
        deploymentId: 'deployment-1',
        suspended: false,
        historyTimeToLive: 30,
      };
      const mockXmlResponse = { data: { bpmn20Xml: '<bpmn>...</bpmn>' } };

      mockAxiosInstance.get.mockImplementation((url: string) => {
        if (url.includes('/xml')) {
          return Promise.resolve(mockXmlResponse);
        }
        return Promise.resolve({ data: mockProcessDef });
      });

      const result = await repository.getWorkflow(processKey);

      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition/key/testProcess');
      expect(mockAxiosInstance.get).toHaveBeenCalledWith('/process-definition/key/testProcess/xml');
      expect(result).toEqual({
        ...mockProcessDef,
        bpmn20Xml: '<bpmn>...</bpmn>',
      });
    });
  });

  describe('updateJobRetries', () => {
    it('should update job retries', async () => {
      const jobId = 'job-123';
      const retries = 3;
      const mockResponse = { data: undefined };
      mockAxiosInstance.put.mockResolvedValue(mockResponse);

      const result = await repository.updateJobRetries(jobId, retries);

      expect(mockAxiosInstance.put).toHaveBeenCalledWith('/external-task/job-123/retries', {
        retries: 3,
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('updateVariables', () => {
    it('should update process instance variables (global scope)', async () => {
      const processInstanceId = 'instance-123';
      const variables = { var1: 'value1', var2: 'value2' };
      const mockResponse = { data: undefined };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.updateVariables(processInstanceId, variables);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-instance/instance-123/variables', {
        modifications: {
          var1: {
            type: 'string',
            value: 'value1',
            valueInfo: {},
            local: false,
          },
          var2: {
            type: 'string',
            value: 'value2',
            valueInfo: {},
            local: false,
          },
        },
      });
      expect(result).toBe(mockResponse);
    });

    it('should update process instance variables (local scope)', async () => {
      const processInstanceId = 'instance-123';
      const variables = { var1: 'value1' };
      const mockResponse = { data: undefined };
      mockAxiosInstance.post.mockResolvedValue(mockResponse);

      const result = await repository.updateVariables(processInstanceId, variables, true);

      expect(mockAxiosInstance.post).toHaveBeenCalledWith('/process-instance/instance-123/variables', {
        modifications: {
          var1: {
            type: 'string',
            value: 'value1',
            valueInfo: {},
            local: true,
          },
        },
      });
      expect(result).toBe(mockResponse);
    });
  });

  describe('error handling', () => {
    it('should propagate axios errors', async () => {
      const error = new Error('Network error');
      mockAxiosInstance.get.mockRejectedValue(error);

      await expect(repository.getWorkflows()).rejects.toThrow('Network error');
    });

    it('should handle deployment errors', async () => {
      const error = new Error('Deployment failed');
      mockAxiosInstance.post.mockRejectedValue(error);

      mockedFs.createReadStream.mockReturnValue({} as any);

      await expect(repository.deployWorkflow('test', '/path')).rejects.toThrow('Deployment failed');
    });
  });
});
