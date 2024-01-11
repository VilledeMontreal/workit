/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

// you can pass value here or an another (safer) way
// process.env.AWS_REGION = 'us-east-1';
// process.env.AWS_SQS_QUEUE_URL = '<SQS_QUEUE_URL>'
// process.env.AWS_ACCESS_KEY_ID = '<AWS_ACCESS_KEY_ID>';
// process.env.AWS_SECRET_ACCESS_KEY = '<AWS_SECRET_ACCESS_KEY>';
// process.env.AWS_SQS_WAIT_TIME_SECONDS = '20';

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';

enum LOCAL_IDENTIFIER {
  sampleActivity = 'Get credit limit',
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sampleActivity);
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.stepFunction);

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
