/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';

(async (): Promise<void> => {
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
  for (let index = 0; index < 1; index += 1) {
    await cm.createWorkflowInstance({
      bpmnProcessId: 'BPMN_P_DEMO',
      variables: {
        amount: 1000,
        hello: 'world',
      },
    });
  }
  console.log('Success!');
})();
