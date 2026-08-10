/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { Worker } from '@villedemontreal/workit-core';
import * as assert from 'assert';

export const run = async (worker: Worker, scoped: any, delay: number = 500): Promise<void> => {
  worker.start();
  await worker.run();

  await new Promise<void>((resolve) => {
    setTimeout(resolve, delay);
  });
  await worker.stop();
  assert.ok(scoped.isDone());
};
