/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { TAG } from '../src/config/constants/tag';
import '../src/config/ioc';

// tslint:disable-next-line: no-floating-promises
(async () => {
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // TAG.zeebe
    for (let index = 0; index < 1; index++) {
        await cm.createWorkflowInstance({
            bpmnProcessId: "BPMN_DEMO",
            variables: {
                amount: 1000,
                hello: "world"
            }
        });
    }
    // tslint:disable-next-line: no-console
    console.log('Success!');
})();