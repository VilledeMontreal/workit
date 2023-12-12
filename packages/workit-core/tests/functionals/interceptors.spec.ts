/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage, Interceptor } from '@villedemontreal/workit-types';
import { Interceptors } from '../../src/interceptors';

describe('Interceptors', () => {
  describe('execute', () => {
    it('should throw when not func', () => {
      const cDate = new Date();
      const message = {
        body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
        properties: { customHeaders: {} } as any,
      };
      const interceptorExecution = Interceptors.execute([null as any], message);
      return expect(interceptorExecution).rejects.toThrow('interceptors passed in parameter are not valid.');
    });
    it('should not throw when empty', () => {
      const cDate = new Date();
      const message = {
        body: { a: 1, b: true, c: cDate, d: { d1: cDate }, e: [] },
        properties: { customHeaders: {} } as any,
      };
      const interceptorExecution = Interceptors.execute([], message);
      return expect(interceptorExecution).resolves.toStrictEqual(message);
    });
    it('should throw when interceptor return null', async () => {
      const cDate = new Date();
      const message = {
        body: { a: 1, b: true, c: cDate, d: { d1: cDate }, e: [] },
        properties: { customHeaders: {} } as any,
      };
      const messageFromInterceptor = Interceptors.execute(
        [
          (_) => {
            return null as any;
          },
        ] as Interceptor[],
        message,
      );
      return await expect(messageFromInterceptor).rejects.toThrow();
    });
    it('should get new custom headers', () => {
      const cDate = new Date();
      const message = {
        body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
        properties: { customHeaders: {} } as any,
      };
      const interceptorMessage = {
        body: message.body,
        properties: { customHeaders: { hello: 'world' } } as any,
      };
      const interceptorExecution = Interceptors.execute<IMessage>(
        [
          (_) => {
            return Promise.resolve(interceptorMessage);
          },
        ] as Interceptor[],
        message,
      );
      return expect(interceptorExecution).resolves.toStrictEqual({
        body: message.body,
        properties: interceptorMessage.properties,
      });
    });
  });
});
