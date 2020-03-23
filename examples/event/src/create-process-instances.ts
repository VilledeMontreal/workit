/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';

(async (): Promise<void> => {
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // TAG.zeebe
  await cm.publishMessage({
    correlation: {},
    name: '__MESSAGE_START_EVENT__',
    variables: { amount: 1000 },
    timeToLive: undefined,
    messageId: undefined,
  });

  // setTimeout(() => {
  //     cm.publishMessage({
  //         correlation: 100,
  //         name: "catching",
  //         variables: { amount: 100 },
  //         timeToLive: undefined,
  //         messageId: undefined
  //     });
  // }, 5000);

  console.log('Success!');
})();
