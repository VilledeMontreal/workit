/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit-camunda';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';

enum LOCAL_IDENTIFIER {
  sampleActivity = 'sample_activity',
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sampleActivity);
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm); // TAG.zeebe

const stop = (): void => {
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
