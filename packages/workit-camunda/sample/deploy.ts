// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.
// tslint:disable: no-floating-promises
import '../src/config/ioc';

import { TAG } from '../src';
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER } from '../src/config/constants/identifiers';
import { IWorkflowClient } from '../src/models/camunda-n-mq/specs/workflowClient';
import { IoC } from '../src/models/IoC';
import { getTag } from './utils';

(async () => {
    const tag = getTag();
    const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, tag);
    const path = `${ process.cwd() }/sample/${tag === TAG.zeebe ? 'zeebe/' : ''}BPMN_DEMO.bpmn`;

    await cm.deployWorkflow(path);
})();