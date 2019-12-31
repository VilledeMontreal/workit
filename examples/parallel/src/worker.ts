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

(async () => {
  enum LOCAL_IDENTIFIER {
    activity1 = 'activity_1',
    activity2 = 'activity_2',
    activity3 = 'activity_3'
  }

  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
  IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

  const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

  worker.start();
  worker.run();
})();
