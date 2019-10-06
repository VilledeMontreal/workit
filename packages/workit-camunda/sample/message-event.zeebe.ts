/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IWorkflowClient } from 'workit-types';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import '../src/config/ioc';
import { Worker } from '../src/models/core/worker';
import { IoC } from '../src/models/IoC';
import { HelloWorldTask } from './tasks/helloWorldTask';

// tslint:disable: no-floating-promises
// tslint:disable: no-console
(async () => {
    enum LOCAL_IDENTIFIER {
        sample_activity = 'sample_activity'
    }

    IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);

    const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.zeebe);
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.zeebe);

    const path = `${ process.cwd() }/sample/zeebe/MESSAGE_EVENT.bpmn`;
    await cm.deployWorkflow(path);
    const result = await cm.publishMessage({
        correlation: undefined,
        name: "__MESSAGE_START_EVENT__",
        variables: { amount: 1000 },
        timeToLive: undefined,
        messageId: undefined
    });

    setTimeout((resp) => {
        cm.publishMessage({
            correlation: 100,
            name: "catching",
            variables: { amount: 100 },
            timeToLive: undefined,
            messageId: undefined
        });
    }, 5000, result);

    worker.start();
    worker.run();

})();