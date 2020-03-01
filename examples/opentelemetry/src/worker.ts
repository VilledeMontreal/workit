/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-floating-promises
// tslint:disable: no-console

// First load
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { NodeTracerProvider } from '@opentelemetry/node';
import { SimpleSpanProcessor } from '@opentelemetry/tracing';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC, Worker } from 'workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';
const ingoreUrls = [/\/external\-task\/fetchAndLock/i];
// TODO: Fix any
const provider = new NodeTracerProvider({
  plugins: {
    http: {
      enabled: true,
      path: '@opentelemetry/plugin-http',
      ignoreOutgoingUrls: ingoreUrls
    } as any,
    https: {
      enabled: true,
      path: '@opentelemetry/plugin-https'
    }
  }
});
const tracer = provider.getTracer('default');

(async () => {
  enum LOCAL_IDENTIFIER {
    activity1 = 'activity_1',
    activity2 = 'activity_2',
    activity3 = 'activity_3'
  }

  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

  const jaegerExporter = new JaegerExporter({
    serviceName: 'workit example',
    host: 'localhost'
  });
  provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
  IoC.bindToObject(tracer, CORE_IDENTIFIER.tracer);
  const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

  worker.start();
  worker.run();
})();
