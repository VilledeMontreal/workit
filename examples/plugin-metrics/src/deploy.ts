/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { TAG, SERVICE_IDENTIFIER } from '@villedemontreal/workit';
import { IoC } from '@villedemontreal/workit-core';
import { IWorkflowClient } from '@villedemontreal/workit-types';
import * as path from 'path';

async function deployWorkflow() {
  const platform = process.argv[2] || 'camunda';
  const tag = platform === 'stepfunction' ? TAG.stepFunction : TAG.camundaBpm;

  console.log(`🚀 Deploying workflow for ${platform.toUpperCase()}...`);

  const manager = IoC.get<IWorkflowClient>(SERVICE_IDENTIFIER.client_manager, tag);

  try {
    let workflowPath: string;

    if (platform === 'stepfunction') {
      workflowPath = path.join(__dirname, '../workflow/stepfunctions/METRICS_DEMO.json');
    } else {
      workflowPath = path.join(__dirname, '../workflow/camunda/METRICS_DEMO.bpmn');
    }

    console.log(`📄 Deploying workflow from: ${workflowPath}`);

    const result = await manager.deployWorkflow(workflowPath);

    if (platform === 'stepfunction') {
      console.log(`✅ Step Function deployed successfully!`);
      console.log(`   State Machine ARN: ${(result as any).stateMachineArn || 'unknown'}`);
    } else {
      console.log(`✅ Camunda workflow deployed successfully!`);
      console.log(`   Deployment ID: ${(result as any).id || 'unknown'}`);
      console.log(
        `   Process Definition ID: ${(result as any).deployedProcessDefinitions?.METRICS_DEMO?.id || 'unknown'}`
      );
    }

    console.log('🎯 You can now start the worker and create instances');
  } catch (error) {
    console.error('❌ Error deploying workflow:', error);
    process.exit(1);
  }
}

deployWorkflow().catch(console.error);
