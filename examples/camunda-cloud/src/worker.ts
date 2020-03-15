/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-floating-promises
// tslint:disable: no-console
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC, Worker } from 'workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';
enum LOCAL_IDENTIFIER {
  sample_activity = 'sample_activity'
}

(async () => {
  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);
  const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.zeebe);

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
})();
