// tslint:disable:no-console

import { IoC, SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG, Worker } from 'workit-camunda';
import './config/ioc';
(() => {
  const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);
  worker.start();
  worker.run();

  const stop = () => {
    console.info('SIGTERM signal received.');
    console.log('Closing worker');
    worker
      .stop()
      .then(() => {
        console.log('Worker closed');
        process.exit(0);
      })
      .catch((e: Error) => {
        console.log(e);
        process.exit(1);
      });
  };

  process.on('SIGINT', stop);
  process.on('SIGTERM', stop);
})();
