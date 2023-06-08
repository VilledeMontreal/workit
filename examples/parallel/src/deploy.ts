/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit-camunda';
import { IoC } from '@villedemontreal/workit-core';
import { IWorkflowClient } from '@villedemontreal/workit-types';

(async (): Promise<void> => {
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
  const path = `${process.cwd()}/bpmn/BPMN_P_DEMO.bpmn`;
  await cm.deployWorkflow(path);
  console.log('Success!');
})();
