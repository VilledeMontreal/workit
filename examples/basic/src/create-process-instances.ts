/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

// you can pass value here or an another (safer) way
// process.env.AWS_REGION = 'us-east-1';
// process.env.AWS_ACCESS_KEY_ID = '<AWS_ACCESS_KEY_ID>';
// process.env.AWS_SECRET_ACCESS_KEY = '<AWS_SECRET_ACCESS_KEY>';
// process.env.AWS_SQS_WAIT_TIME_SECONDS = '20';

import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from '@villedemontreal/workit';
import { IoC } from '@villedemontreal/workit-core';
import { IWorkflowClient } from '@villedemontreal/workit-types';

(async (): Promise<void> => {
  const platform = TAG.stepFunction;
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, platform);
  for (let index = 0; index < 1; index += 1) {
    await cm.createWorkflowInstance({
      bpmnProcessId:
        platform === TAG.camundaBpm
          ? 'BPMN_DEMO'
          : `arn:aws:states:${process.env.AWS_REGION}:<YOUR-AWS-ACCOUNT-ID>:stateMachine:Basic-Example`,
      variables: {
        amount: 1000,
        hello: 'world',
      },
    });
  }

  console.info('Success!');
})();
