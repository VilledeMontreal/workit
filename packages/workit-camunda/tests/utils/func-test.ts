/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Worker } from '@villedemontreal/workit-core';
import { assert } from 'chai';

export const run = (worker: Worker, scoped: any, done: any, delay: number = 500) => {
  worker.start();
  worker.run();

  setTimeout(async () => {
    await worker.stop();
    assert.isTrue(scoped.isDone());
    done();
  }, delay);
};
