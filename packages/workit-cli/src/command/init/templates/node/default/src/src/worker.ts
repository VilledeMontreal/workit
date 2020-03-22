import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC, Worker } from 'workit-core';
import './config/ioc';

const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);
worker.start();
worker.run().catch(err => {
  console.error('DO SOMETHING', err);
});

const stop = (): void => {
  console.info('Signal received');
  console.info('Closing worker');
  worker
    .stop()
    .then(() => {
      console.info('Worker closed');
      process.exit(0);
    })
    .catch((e: Error) => {
      console.error(e);
      process.exit(1);
    });
};

process.on('SIGINT', stop);
process.on('SIGTERM', stop);
