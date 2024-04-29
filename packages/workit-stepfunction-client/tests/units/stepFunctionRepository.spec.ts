/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IStepFunctionClientConfig } from '@villedemontreal/workit-types';
import { StepFunctionRepository } from '../../src/repositories/stepFunctionRepository';
import { QUEUE_URL, sqsConfig } from '../utils/sqs';
import { MAX_ERROR_CAUSE_LENGTH, MAX_ERROR_CODE_LENGTH, MAX_PAYLOAD_LENGTH } from '../../src/config/constants/params';

jest.mock('../../src/sfnClient', () => {
  return {
    StepFunctionClient: jest.fn().mockImplementation(() => {
      return {
        send: jest.fn(),
      };
    }),
  };
});

describe('Step function Repository', () => {
  const config = {
    queueUrl: QUEUE_URL,
    ...sqsConfig,
  } as IStepFunctionClientConfig;
  const repo = new StepFunctionRepository(config);

  beforeEach(() => {
    (repo['_client'].send as jest.Mock).mockReset();
  });

  it('should be an instance of StepFunctionRepository', () => {
    expect(repo).toBeInstanceOf(StepFunctionRepository);
  });

  it('deployWorkflow should call CreateStateMachineCommand', async () => {
    await repo.deployWorkflow('tests/data/workflow.json');
    const param = (repo['_client'].send as jest.Mock).mock.calls[0][0];

    expect(repo['_client'].send).toHaveBeenCalledTimes(1);
    expect(param.constructor.name).toStrictEqual('CreateStateMachineCommand');
  });

  it('startExecution should call StartExecutionCommand', async () => {
    await repo.startExecution({
      stateMachineArn: 'arn:*',
      input: '{}',
      name: 'unique-id',
    });
    const param = (repo['_client'].send as jest.Mock).mock.calls[0][0];

    expect(repo['_client'].send).toHaveBeenCalledTimes(1);
    expect(param.constructor.name).toStrictEqual('StartExecutionCommand');
  });

  it('sendTaskSuccess should call SendTaskSuccessCommand', async () => {
    await repo.sendTaskSuccess({
      body: {},
      properties: {},
    });
    const param = (repo['_client'].send as jest.Mock).mock.calls[0][0];

    expect(repo['_client'].send).toHaveBeenCalledTimes(1);
    expect(param.constructor.name).toStrictEqual('SendTaskSuccessCommand');
  });

  it('sendTaskSuccess should throw when exceed payload size limit and not call SendTaskSuccessCommand', async () => {
    expect(() =>
      repo.sendTaskSuccess({
        body: {
          longVariable: 'a'.repeat(MAX_PAYLOAD_LENGTH),
        },
        properties: {},
      }),
    ).toThrowErrorMatchingSnapshot();
    const param = (repo['_client'].send as jest.Mock).mock.calls;

    expect(repo['_client'].send).toHaveBeenCalledTimes(0);
    expect(param.length).toStrictEqual(0);
  });

  it('sendTaskFailure should call SendTaskFailureCommand', async () => {
    await repo.sendTaskFailure(
      {
        message: 'message',
        code: 'code',
        name: 'name',
      },
      {
        body: {},
        properties: {},
      },
    );
    const param = (repo['_client'].send as jest.Mock).mock.calls[0][0];

    expect(param.input).toMatchSnapshot();
    expect(repo['_client'].send).toHaveBeenCalledTimes(1);
    expect(param.constructor.name).toStrictEqual('SendTaskFailureCommand');
  });

  it('sendTaskFailure should not throw when exceed payload size limit and call SendTaskFailureCommand', async () => {
    const error = {
      message: 'message',
      code: 'errorCode'.repeat(MAX_ERROR_CAUSE_LENGTH),
      name: 'name',
    };

    expect(() =>
      repo.sendTaskFailure(error, {
        body: {
          longVariable: 'a'.repeat(MAX_PAYLOAD_LENGTH),
        },
        properties: {},
      }),
    ).not.toThrow();

    const errorCodeLength = error.code.length;

    expect(repo['_client'].send).toHaveBeenCalledTimes(1);
    const param = (repo['_client'].send as jest.Mock).mock.calls[0][0];

    expect(param.input).toMatchSnapshot();
    expect(param.input.error).toHaveLength(MAX_ERROR_CODE_LENGTH);
    expect(param.input.error.length).toBeLessThan(errorCodeLength);
    expect(param.input.cause).toHaveLength(MAX_ERROR_CAUSE_LENGTH);
  });

  it('sendTaskHeartbeat should call SendTaskHeartbeatCommand', async () => {
    await repo.sendTaskHeartbeat({
      body: {},
      properties: {},
    });
    const param = (repo['_client'].send as jest.Mock).mock.calls[0][0];

    expect(repo['_client'].send).toHaveBeenCalledTimes(1);
    expect(param.constructor.name).toStrictEqual('SendTaskHeartbeatCommand');
  });
});
