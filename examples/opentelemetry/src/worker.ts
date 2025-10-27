/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { resourceFromAttributes } from '@opentelemetry/resources';
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { ConsoleSpanExporter, SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { ATTR_SERVICE_NAME } from '@opentelemetry/semantic-conventions';
import * as opentelemetry from '@opentelemetry/api';

opentelemetry.diag.setLogger(new opentelemetry.DiagConsoleLogger(), opentelemetry.DiagLogLevel.ALL);
const jaegerExporter = new JaegerExporter({
  host: 'localhost',
});
const provider = new NodeTracerProvider({
  spanProcessors: [new SimpleSpanProcessor(jaegerExporter), new SimpleSpanProcessor(new ConsoleSpanExporter())],
  resource: resourceFromAttributes({
    [ATTR_SERVICE_NAME]: 'myWorker',
  }),
});
const tracer = provider.getTracer('default');
// Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
provider.register();

registerInstrumentations({
  instrumentations: [
    new HttpInstrumentation({
      // optional - dont trace outgoing requests to specific urls
      // ignoreOutgoingRequestHook: (options) => {
      //   const url =
      //     typeof options === 'string'
      //       ? options
      //       : `${options.protocol || 'http:'}//${options.hostname || options.host}:${options.port}${options.path || '/'}`;
      //   return url.endsWith('/external-task/fetchAndLock') || url.endsWith('sqs.ca-central-1.amazonaws.com/');
      // },
    }),
  ],
});

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';

enum LOCAL_IDENTIFIER {
  activity1 = 'activity_1',
  activity2 = 'activity_2',
  activity3 = 'activity_3',
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

IoC.bindToObject(tracer, CORE_IDENTIFIER.tracer);
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.start();
worker.run();
