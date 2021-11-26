/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { NoopTracer } from '@opentelemetry/api/build/src/trace/NoopTracer';
import { EventEmitter } from 'events';
import { Container, decorate, injectable } from 'inversify';
import { FailureStrategySimple } from '../strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../strategies/SuccessStrategySimple';
import { NoopTracerPropagator } from '../tracer/noopTracerPropagator';
import { SERVICE_IDENTIFIER } from './constants/identifiers';
import { IOC } from '../IoC';
import { NOOP_LOGGER } from '../common/noopLogger';

try {
  decorate(injectable(), EventEmitter);
} catch (error) {
  console.log(
    `Warning: We detect that you load workit-camunda module more than once. This can happens when sub dependencies have workit-camunda in different versions. You need to get the same version (try using peerDependencies in package.json) or you know what you are doing.`
  );
}

const kernel = new Container();
const container = new Container();

kernel.bind(SERVICE_IDENTIFIER.logger).toConstantValue(NOOP_LOGGER);
kernel.bind(SERVICE_IDENTIFIER.tracer_propagator).toConstantValue(new NoopTracerPropagator());
kernel.bind(SERVICE_IDENTIFIER.tracer).toConstantValue(new NoopTracer());
kernel.bind(SERVICE_IDENTIFIER.success_strategy).toConstantValue(new SuccessStrategySimple());
kernel.bind(SERVICE_IDENTIFIER.failure_strategy).toConstantValue(new FailureStrategySimple());

container.parent = kernel;
const IoC = new IOC(container);

export { kernel, container, IoC };
