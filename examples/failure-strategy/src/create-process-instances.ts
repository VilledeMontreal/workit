/*!
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';

// tslint:disable-next-line: no-floating-promises
(async () => {
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // TAG.zeebe
  for (let index = 0; index < 1; index++) {
    await cm.createWorkflowInstance({
      bpmnProcessId: 'BPMN_DEMO',
      variables: {
        amount: 1000,
        hello: 'world'
      }
    });
  }
  // tslint:disable-next-line: no-console
  console.log('Success!');
})();
