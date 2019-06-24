// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
// tslint:disable: no-floating-promises

import '../src/config/ioc';

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import { IWorkflowClient } from '../src/models/camunda-n-mq/specs/workflowClient';
import { Worker } from '../src/models/core/worker';
import { IoC } from '../src/models/IoC'
import { HelloWorldTask } from './tasks/helloWorldTask';

(async () => {
enum LOCAL_IDENTIFIER {
    activity1= 'activity_1',
    activity2= 'activity_2',
    activity3= 'activity_3'
}

IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity1);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity2);
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.activity3);

const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);
const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);

const path = `${process.cwd()}/sample/BPMN_P_DEMO.bpmn`;
await cm.deployWorkflow(path);
for (let index = 0; index < 1; index++) {
    await cm.createWorkflowInstance({
        bpmnProcessId: "BPMN_P_DEMO",
        variables: {
            amount: 1000,
            hello: "world"
        }
    });
}

worker.start();
worker.run();

})();