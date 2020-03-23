/*
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import * as assert from 'assert';
import { Worker } from 'workit-core';

export const run = (worker: Worker, scoped: { isDone: () => boolean }, done: () => void, delay = 500): void => {
  worker.start();
  worker.run();
  setTimeout(async () => {
    await worker.stop();
    assert.strictEqual(scoped.isDone(), true);
    done();
  }, delay);
};
