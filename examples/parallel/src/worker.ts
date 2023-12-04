/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit';
import { IoC, Worker } from '@villedemontreal/workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';

enum LOCAL_IDENTIFIER {
  activity1 = 'activity_1',
  activity2 = 'activity_2',
  activity3 = 'activity_3',
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.start();
worker.run();
