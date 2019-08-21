import { JaegerTracerService } from '../src/models/opentelemetry/jaeger/tracerService';

export const tracerService = new JaegerTracerService({
    serviceName: 'Workit DEMO',
    host: 'localhost',
    port: 6832,

});
tracerService.start();