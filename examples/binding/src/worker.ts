/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC, Worker } from 'workit-core';
import { HelloWorldTask } from '../tasks/helloWorldTask';
import { HelloWorldTaskV2 } from '../tasks/helloWorldTaskV2';
import { HelloWorldTaskV3 } from '../tasks/helloWorldTaskV3';

enum LOCAL_IDENTIFIER {
  activity1 = 'activity_1',
  activity2 = 'activity_2',
  activity3 = 'activity_3',
}

const BPMN_PROCESS_ID = 'BPMN_P_DEMO';

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

IoC.bindTask(HelloWorldTaskV2, LOCAL_IDENTIFIER.activity1, { bpmnProcessId: BPMN_PROCESS_ID, version: 2 });
IoC.bindTask(HelloWorldTaskV2, LOCAL_IDENTIFIER.activity2, { bpmnProcessId: BPMN_PROCESS_ID, version: 2 });
IoC.bindTask(HelloWorldTaskV2, LOCAL_IDENTIFIER.activity3, { bpmnProcessId: BPMN_PROCESS_ID, version: 2 });

IoC.bindTask(HelloWorldTaskV3, LOCAL_IDENTIFIER.activity1, { bpmnProcessId: BPMN_PROCESS_ID, version: 3 });
IoC.bindTask(HelloWorldTaskV3, LOCAL_IDENTIFIER.activity2, { bpmnProcessId: BPMN_PROCESS_ID, version: 3 });
IoC.bindTask(HelloWorldTaskV3, LOCAL_IDENTIFIER.activity3, { bpmnProcessId: BPMN_PROCESS_ID, version: 3 });

const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.start();
worker.run();
