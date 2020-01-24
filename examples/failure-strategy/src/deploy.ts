/*!
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-floating-promises
// tslint:disable: no-console

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';

(async () => {
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
  // const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.zeebe);
  const path = `${process.cwd()}/bpmn/BPMN_DEMO.bpmn`;
  // const path = `${ process.cwd() }/bpmn/zeebe/BPMN_DEMO.bpmn`;
  await cm.deployWorkflow(path);
  console.log('Success!');
})();
