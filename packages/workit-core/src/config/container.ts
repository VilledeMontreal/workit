/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CoreTracer } from '@opencensus/core';
import { EventEmitter } from 'events';
import { Container, decorate, injectable } from 'inversify';
import { SCProcessHandler } from '../processHandler/simpleCamundaProcessHandler';
import { FailureStrategySimple } from '../strategies/FailureStrategySimple';
import { SuccessStrategySimple } from '../strategies/SuccessStrategySimple';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

try {
  decorate(injectable(), EventEmitter);
} catch (error) {
  // tslint:disable: no-console
  console.log(
    `Warning: We detect that you load workit-camunda module more than once. This can happens when sub dependencies have workit-camunda in different versions. You need to get the same version (try using peerDependencies in package.json) or you know what you are doing.`
  );
}

export const kernel = new Container();

kernel.bind(SERVICE_IDENTIFIER.tracer).toConstantValue(new CoreTracer());
kernel.bind(SERVICE_IDENTIFIER.success_strategy).toConstantValue(new SuccessStrategySimple());
kernel.bind(SERVICE_IDENTIFIER.failure_strategy).toConstantValue(new FailureStrategySimple());
kernel.bind(SERVICE_IDENTIFIER.process_handler).to(SCProcessHandler);

export const container = new Container();
container.parent = kernel;
