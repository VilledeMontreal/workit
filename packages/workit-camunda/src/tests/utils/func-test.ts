import { assert } from 'chai';
import { Worker } from '../../models/core/worker';

export const run = (worker: Worker, scoped: any, done: any, delay: number = 500) => {
  worker.start();
  worker.run();

  setTimeout(async () => {
    await worker.stop();
    assert.isTrue(scoped.isDone());
    done();
  }, delay);
};
