/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

process.env.WORKIT_DISABLE_DATETIME_REVIVER = 'true';

import { FailureException, IStepFunctionClientConfig } from '@villedemontreal/workit-types';
import { StepFunctionRepository } from '../../src/repositories/stepFunctionRepository';
import { SfnMessage } from '../../src/sfnMessage';
import { QUEUE_URL, sqsConfig } from '../utils/sqs';

jest.mock('../../src/repositories/stepFunctionRepository', () => {
  return {
    StepFunctionRepository: jest.fn().mockImplementation(() => {
      return {
        sendTaskSuccess: jest.fn(),
        sendTaskFailure: jest.fn(),
      };
    }),
  };
});

describe('Step function Message', () => {
  const config = {
    queueUrl: QUEUE_URL,
    ...sqsConfig,
  } as IStepFunctionClientConfig;
  const cDate = new Date();
  const awsMessage = {
    MessageId: 'id',
    MD5OfBody: 'hash',
    Body: JSON.stringify({
      body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
      properties: {
        customHeaders: {},
        activityId: 'activity-123',
        processInstanceId: 'process-123',
        workflowInstanceKey: 'workflow-instance-123',
        workflowKey: 'workflow-123',
        bpmnProcessId: 'bpmn-process-123',
        topicName: 'topic-123',
        workerId: 'worker-123',
        jobKey: 'job-123',
      } as any,
    }),
  };

  describe('Step function Message', () => {
    it('wrap should not behave like Camunda Bpm Engine', () => {
      const [message] = SfnMessage.wrap(awsMessage, new StepFunctionRepository(config));

      expect(message.body.a).toStrictEqual(1);
      expect(message.body.b).toBeTruthy();
      expect(() => (message.body.c as Date).toUTCString()).toThrow();
      expect(typeof message.body.d).toStrictEqual('object');
      expect(message.body._meta).toBeUndefined();
    });

    it('wrap should get SQS properties', () => {
      const [message] = SfnMessage.wrap(awsMessage, new StepFunctionRepository(config));
      expect(message.properties.customHeaders).toMatchObject({
        messageId: awsMessage.MessageId,
        MD5OfBody: awsMessage.MD5OfBody,
      });
    });

    it('service.ack should call sendTaskSuccess', async () => {
      const repo = new StepFunctionRepository(config);
      const [message, service] = SfnMessage.wrap(awsMessage, repo);
      await service.ack(message);
      expect(repo.sendTaskSuccess).toHaveBeenCalledTimes(1);
      expect(repo.sendTaskFailure).not.toHaveBeenCalled();
    });

    it('service.nack should call sendTaskFailure', async () => {
      const repo = new StepFunctionRepository(config);
      const [, service] = SfnMessage.wrap(awsMessage, repo);
      await service.nack(new FailureException('Opps'));
      expect(repo.sendTaskFailure).toHaveBeenCalledTimes(1);
      expect(repo.sendTaskSuccess).not.toHaveBeenCalled();
    });
  });
});
