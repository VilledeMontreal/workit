/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';
import { AxiosNotFoundHandler, FailureStrategySimple } from './failure-strategy';

enum LOCAL_IDENTIFIER {
  sampleActivity = 'sample_activity',
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sampleActivity);
IoC.bindToObject(new FailureStrategySimple([new AxiosNotFoundHandler()]), CORE_IDENTIFIER.failure_strategy);

const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

const stop = () => {
  console.info('SIGTERM signal received.');
  console.log('Closing worker');
  worker
    .stop()
    .then(() => {
      console.log('worker closed');
      process.exit(0);
    })
    .catch((e: Error) => {
      console.log(e);
      process.exit(1);
    });
};

worker.start();
worker.run();

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
