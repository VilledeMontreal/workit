/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { EventEmitter } from 'events';
import { Container, decorate, injectable } from 'inversify';
import { FailureStrategySimple } from '../strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../strategies/SuccessStrategySimple';
import { NoopTracerPropagator } from '../tracer/noopTracerPropagator';
import { SERVICE_IDENTIFIER } from './constants/identifiers';
import { IOC } from '../IoC';
import { NOOP_LOGGER } from '../common/noopLogger';
import { trace } from '@opentelemetry/api';

// If no TracerProvider is configured, this will return a NoopTracer
const tracer = trace.getTracer('workit:nooptracer');

try {
  decorate(injectable(), EventEmitter);
} catch (error) {
  console.log(
    `Warning: We detect that you load workit module more than once. This can happens when sub dependencies have workit in different versions. You need to get the same version (try using peerDependencies in package.json) or you know what you are doing.`,
  );
}

const kernel = new Container();
kernel.bind(SERVICE_IDENTIFIER.logger).toConstantValue(NOOP_LOGGER);
kernel.bind(SERVICE_IDENTIFIER.tracer_propagator).toConstantValue(new NoopTracerPropagator());
kernel.bind(SERVICE_IDENTIFIER.tracer).toConstantValue(tracer);
kernel.bind(SERVICE_IDENTIFIER.success_strategy).toConstantValue(new SuccessStrategySimple());
kernel.bind(SERVICE_IDENTIFIER.failure_strategy).toConstantValue(new FailureStrategySimple());

const container = new Container({ parent: kernel });
const IoC = new IOC(container);

export { kernel, container, IoC };
