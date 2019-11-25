/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-floating-promises
import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';
import { TAG } from '../src';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import '../src/config/ioc';


(async () => {
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
    // const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.zeebe);
    const path = `${ process.cwd() }/sample/BPMN_DEMO.bpmn`;
    // const path = `${ process.cwd() }/sample/zeebe/BPMN_DEMO.bpmn`;

    await cm.deployWorkflow(path);
    // tslint:disable-next-line: no-console
    console.log('Success!');
})();