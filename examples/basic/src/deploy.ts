/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
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
  const platform = TAG.camundaBpm;
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, platform);
  const path =
    platform === TAG.camundaBpm
      ? `${process.cwd()}/workflow/camunda/BPMN_DEMO.bpmn`
      : `${process.cwd()}/workflow/stepfunction/WORKFLOW_DEMO.json`;
  const result =
    platform === TAG.camundaBpm
      ? await cm.deployWorkflow(path)
      : await cm.deployWorkflow(path, {
          name: 'Basic-Example',
          roleArn: 'arn:aws:iam::<YOUR-AWS-ACCOUNT-ID>:role/service-role/<YOUR ROLE>',
        });
  console.info('Success!');
  console.warn(
    `Please, provide the following value "${result.workflows[0].bpmnProcessId}" to bpmnProcessId variable in create-process-instances.ts file for creating an instance`,
  );
})();
