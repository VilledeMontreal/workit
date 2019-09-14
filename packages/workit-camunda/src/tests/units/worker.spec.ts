/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CoreTracer } from '@opencensus/core';
import { SCProcessHandler } from '../../models/core/processHandler/simpleCamundaProcessHandler';
import { FailureStrategySimple } from '../../models/core/strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../../models/core/strategies/SuccessStrategySimple';
import { Worker } from '../../models/core/worker';
import { FakeClient } from '../utils/fake';
describe('Worker', () => {
  it('should be an instance of Worker', () => {
    // instanciate
    const successHandler = new SuccessStrategySimple();
    const failureHandler = new FailureStrategySimple();
    const fakeClient = new FakeClient();
    const processHandler = new SCProcessHandler(successHandler, failureHandler, new CoreTracer());
    const worker = new Worker(fakeClient, processHandler);
    expect(worker).toBeInstanceOf(Worker);
  });

  describe('Negative tests', () => {
    it('should not call strategy handlers', () => {
      const successHandler = new SuccessStrategySimple();
      successHandler.handle = jest.fn().mockResolvedValueOnce({});

      const failureHandler = new FailureStrategySimple();
      failureHandler.handle = jest.fn().mockResolvedValueOnce({});

      const fakeClient = new FakeClient();
      const processHandler = new SCProcessHandler(successHandler, failureHandler, new CoreTracer());
      const worker = new Worker(fakeClient, processHandler);

      expect(worker).toBeInstanceOf(Worker);
      expect(successHandler.handle).not.toHaveBeenCalled();
      expect(failureHandler.handle).not.toHaveBeenCalled();
    });

    it('should not call client methods', () => {
      const successHandler = new SuccessStrategySimple();
      const failureHandler = new FailureStrategySimple();
      const fakeClient = new FakeClient();
      fakeClient.subscribe = jest.fn().mockResolvedValueOnce({});
      fakeClient.unsubscribe = jest.fn().mockResolvedValueOnce({});

      const processHandler = new SCProcessHandler(successHandler, failureHandler, new CoreTracer());
      const worker = new Worker(fakeClient, processHandler);

      expect(worker).toBeInstanceOf(Worker);
      expect(fakeClient.subscribe).not.toHaveBeenCalled();
      expect(fakeClient.unsubscribe).not.toHaveBeenCalled();
    });
  });
  describe('Positive tests', () => {
    // it('should call strategy handlers');

    it('should call client methods', () => {
      const successHandler = new SuccessStrategySimple();
      const failureHandler = new FailureStrategySimple();
      const fakeClient = new FakeClient();
      fakeClient.subscribe = jest.fn().mockResolvedValueOnce({});
      fakeClient.unsubscribe = jest.fn().mockResolvedValueOnce({});

      const processHandler = new SCProcessHandler(successHandler, failureHandler, new CoreTracer());
      const worker = new Worker(fakeClient, processHandler);
      worker.run();
      worker.stop().catch();
      expect(fakeClient.subscribe).toHaveBeenCalledTimes(1);
      expect(fakeClient.unsubscribe).toHaveBeenCalledTimes(1);
    });
  });
});
