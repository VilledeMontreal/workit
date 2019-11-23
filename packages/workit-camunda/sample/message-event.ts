/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IoC, Worker } from 'workit-core';
import { IWorkflowClient } from 'workit-types';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import '../src/config/ioc';
import { HelloWorldTask } from './tasks/helloWorldTask';

// tslint:disable: no-floating-promises
// tslint:disable: no-console
(async () => {
    enum LOCAL_IDENTIFIER {
        sample_activity = 'sample_activity'
    }

    IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);

    const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);

    const path = `${ process.cwd() }/sample/MESSAGE_EVENT.bpmn`;
    await cm.deployWorkflow(path);
    await cm.publishMessage({
        correlation: {},
        name: "__MESSAGE_START_EVENT__",
        variables: { amount: 1000 },
        timeToLive: undefined,
        messageId: undefined
    });

    await cm.updateJobRetries({ jobKey: "975e1f79-518c-11e9-bd78-0242ac110003", retries: 0 });
    // setTimeout((resp) => {
    //     cm.publishMessage({
    //         correlation: {},
    //         name: "catching",
    //         variables: { amount: 100 },
    //         timeToLive: undefined,
    //         messageId: (resp as any).data[0].processInstance.id
    //     });
    // }, 5000, result);

    worker.start();
    worker.run();

})();