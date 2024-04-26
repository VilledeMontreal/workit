/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

jest.mock('sqs-consumer', () => {
  return {
    Consumer: {
      create: jest.fn().mockImplementation(() => {
        return {
          start: jest.fn(),
          stop: jest.fn(),
        };
      }),
    },
  };
});
import { SFnSQSClient } from '../../src/sfnSQSClient';
import { IStepFunctionClientConfig } from '@villedemontreal/workit-types';
import { QUEUE_URL, sqsConfig } from '../utils/sqs';

let sfnSQSClient: SFnSQSClient;
describe('Step function SQS Client', () => {
  beforeAll(() => {
    const config = {
      queueUrl: QUEUE_URL,
      ...sqsConfig,
    } as IStepFunctionClientConfig;

    sfnSQSClient = new SFnSQSClient(config);
  });

  it('should be an instance of SFnSQSClient', () => {
    expect(sfnSQSClient).toBeInstanceOf(SFnSQSClient);
  });

  it('should call subscribe and start methods', async () => {
    await expect(sfnSQSClient.subscribe(async () => Promise.resolve())).resolves.toBeUndefined();
    const subscription = sfnSQSClient['_topicSubscription'];
    expect(subscription.start).toHaveBeenCalledTimes(1);
    expect(subscription.stop).not.toHaveBeenCalled();
  });

  it('should call stop method', async () => {
    const subscription = sfnSQSClient['_topicSubscription'];
    (subscription.start as jest.Mock).mockReset();
    await expect(sfnSQSClient.unsubscribe()).resolves.toBeUndefined();
    expect(subscription.stop).toHaveBeenCalledTimes(1);
    expect(subscription.start).not.toHaveBeenCalled();
  });
});
