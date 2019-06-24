import * as opentracing from 'opentracing';
import { IMessage } from '../../models/camunda-n-mq/specs/message';
import { Interceptors } from '../../models/core/interceptors';
import { ProxyFactory } from '../../models/core/proxyFactory';
describe('Interceptors', () => {
  describe('execute', () => {
    it('should throw when not func', () => {
      const cDate = new Date();
      const message = ProxyFactory.create({
        body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
        properties: { customHeaders: {} } as any,
        spans: new opentracing.Span()
      });
      const interceptorExecution = Interceptors.execute([null as any], message);
      return expect(interceptorExecution).rejects.toThrow('interceptors passed in parameter are not valid.');
    });
    it('should not throw when empty', () => {
      const cDate = new Date();
      const message = ProxyFactory.create({
        body: { a: 1, b: true, c: cDate, d: { d1: cDate }, e: [] },
        properties: { customHeaders: {} } as any,
        spans: new opentracing.Span()
      });
      const interceptorExecution = Interceptors.execute([], message);
      return expect(interceptorExecution).resolves.toStrictEqual(message);
    });
    it('should throw when interceptor return null', async () => {
      const cDate = new Date();
      const message = ProxyFactory.create({
        body: { a: 1, b: true, c: cDate, d: { d1: cDate }, e: [] },
        properties: { customHeaders: {} } as any,
        spans: new opentracing.Span()
      });
      const messageFromInterceptor = Interceptors.execute(
        [
          (msg: IMessage) => {
            return null as any;
          }
        ],
        message
      );
      return await expect(messageFromInterceptor).rejects.toThrow();
    });
    it('should get new custom headers', () => {
      const cDate = new Date();
      const noopSpan = new opentracing.Span();
      const message = ProxyFactory.create({
        body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
        properties: { customHeaders: {} } as any,
        spans: noopSpan
      });
      const interceptorMessage = {
        body: message.body,
        properties: { customHeaders: { hello: 'world' } } as any,
        spans: noopSpan
      };
      const interceptorExecution = Interceptors.execute(
        [
          (msg: IMessage) => {
            return Promise.resolve(interceptorMessage);
          }
        ],
        message
      );
      return expect(interceptorExecution).resolves.toStrictEqual({
        body: message.body,
        properties: interceptorMessage.properties,
        spans: noopSpan
      });
    });
    // it.skip('should only merge custom headers in properties object', () => {
    //   const cDate = new Date();
    //   const message = ProxyFactory.create({
    //     body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
    //     properties: { activityId: 'helloWorldTask', customHeaders: {} } as any
    //   });
    //   const interceptorMessage = {
    //     body: null,
    //     properties: { activityId: 'helloworld', customHeaders: { hello: 'world' } } as any
    //   };
    //   const interceptorExecution = Interceptors.execute(
    //     [
    //       (msg: IMessage) => {
    //         return Promise.resolve(interceptorMessage);
    //       }
    //     ],
    //     message
    //   );
    //   return interceptorExecution.then(msg =>
    //     expect(msg.properties).toStrictEqual({
    //       activityId: 'helloWorldTask',
    //       customHeaders: interceptorMessage.properties.customHeaders
    //     })
    //   );
    // });
  });
});
