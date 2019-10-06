/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-floating-promises

import { IWorkflowClient } from 'workit-types';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import '../src/config/ioc';
import { Worker } from '../src/models/core/worker';
import { IoC } from '../src/models/IoC';
import { HelloWorldTask } from './tasks/helloWorldTask';
import { HelloWorldTaskV2 } from './tasks/helloWorldTaskV2';
import { HelloWorldTaskV3 } from './tasks/helloWorldTaskV3';


(async () => {
    enum LOCAL_IDENTIFIER {
        activity1 = 'activity_1',
        activity2 = 'activity_2',
        activity3 = 'activity_3'
    }

    const BPMN_PROCESS_ID = "BPMN_P_DEMO";

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
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);

    // const path = `${process.cwd()}/sample/BPMN_P_DEMO.bpmn`;
    // await cm.deployWorkflow(path);
    for (let index = 0; index < 1; index++) {
        await cm.createWorkflowInstance({
            bpmnProcessId: BPMN_PROCESS_ID,
            variables: {
                amount: 1000,
                hello: "world"
            }
        });
    }

    worker.start();
    worker.run();

})();