/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-console

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import '../src/config/ioc';
import { IWorkflowClient } from '../src/models/camunda-n-mq/specs/workflowClient';
import { Worker } from '../src/models/core/worker';
import { IoC } from '../src/models/IoC';
import { HelloWorldTask } from './tasks/helloWorldTask';


// tslint:disable-next-line: no-floating-promises
(async () => {
    enum LOCAL_IDENTIFIER {
        sample_activity = 'sample_activity'
    }


    IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);

    const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);

    const path = `${ process.cwd() }/sample/BPMN_DEMO.bpmn`;
    await cm.deployWorkflow(path);

    // await cm.updateVariables({ 
    //     processInstanceId: "5c50c48e-4691-11e9-8b8f-0242ac110002",
    //     variables: { amount: 1000 }
    // });

    worker.start();

    worker.run().catch((e) => console.log(e));
    console.log('stop worker');
    await worker.stop();
    console.log('rerun worker');
    worker.run().catch((e) => console.log(e));

})();