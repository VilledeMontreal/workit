import { assert } from 'chai';
import { Worker } from '../../models/core/worker';

export const run = async (worker: Worker, scoped: any, delay: number = 500): Promise<void> => {
  worker.start();
  await worker.run();

  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
  await worker.stop();
  assert.isTrue(scoped.isDone());
};
