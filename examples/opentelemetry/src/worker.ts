/*
 * Copyright (c) 2022 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { JaegerExporter } from '@opentelemetry/exporter-jaeger';
import { NodeTracerProvider } from '@opentelemetry/sdk-trace-node';
import { SimpleSpanProcessor } from '@opentelemetry/sdk-trace-base';
import { registerInstrumentations } from '@opentelemetry/instrumentation';
import { HttpInstrumentation } from '@opentelemetry/instrumentation-http';
import { Resource } from '@opentelemetry/resources';
import { SemanticResourceAttributes } from '@opentelemetry/semantic-conventions';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit-camunda';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';

const ingoreUrls = [/\/external-task\/fetchAndLock/i];
// TODO: Fix any
const provider = new NodeTracerProvider({
  resource: new Resource({
    [SemanticResourceAttributes.SERVICE_NAME]: 'workit example',
  }),
});
const tracer = provider.getTracer('default');

enum LOCAL_IDENTIFIER {
  activity1 = 'activity_1',
  activity2 = 'activity_2',
  activity3 = 'activity_3',
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

const jaegerExporter = new JaegerExporter({
  host: 'localhost',
});

provider.addSpanProcessor(new SimpleSpanProcessor(jaegerExporter));
// Initialize the OpenTelemetry APIs to use the NodeTracerProvider bindings
provider.register();

registerInstrumentations({
  // // when boostraping with lerna for testing purposes
  instrumentations: [
    new HttpInstrumentation({
      ignoreIncomingPaths: ingoreUrls,
    }),
  ],
});

IoC.bindToObject(tracer, CORE_IDENTIFIER.tracer);
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.start();
worker.run();
