/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { TAG, SERVICE_IDENTIFIER } from '@villedemontreal/workit';
import { IoC } from '@villedemontreal/workit-core';
import { IWorkflowClient } from '@villedemontreal/workit-types';

function delay(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  });
}

async function createInstances() {
  const platform = process.argv[2] || 'camunda';
  const tag = platform === 'stepfunction' ? TAG.stepFunction : TAG.camundaBpm;
  const instanceCount = parseInt(process.argv[3] || '5', 10);

  console.log(`🚀 Creating ${instanceCount} workflow instances for ${platform.toUpperCase()}...`);

  const manager = IoC.get<IWorkflowClient>(SERVICE_IDENTIFIER.client_manager, tag);

  const workflows = [
    {
      name: 'calculate-workflow',
      variables: {
        numbers: Array.from({ length: Math.floor(Math.random() * 10) + 3 }, () => Math.floor(Math.random() * 100)),
      },
    },
    {
      name: 'process-data-workflow',
      variables: {
        data: Array.from({ length: Math.floor(Math.random() * 50) + 10 }, (_, i) => ({
          id: i + 1,
          value: Math.random() * 1000,
          category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
        })),
      },
    },
  ];

  try {
    for (let i = 0; i < instanceCount; i++) {
      const workflow = workflows[i % workflows.length];

      const instance = await manager.createWorkflowInstance({
        bpmnProcessId: platform === 'stepfunction' ? 'METRICS_DEMO_SF' : 'METRICS_DEMO',
        variables: {
          ...workflow.variables,
          instanceId: `demo-${Date.now()}-${i}`,
          createdAt: new Date().toISOString(),
          workflowType: workflow.name,
        },
      });

      console.log(
        `✅ Created instance ${i + 1}/${instanceCount}: ${(instance as any).workflowInstanceKey || (instance as any).executionArn || 'unknown'}`
      );

      // Petit délai pour éviter de surcharger
      await delay(100);
    }

    console.log(`🎉 Successfully created ${instanceCount} workflow instances!`);
    console.log('📊 Check metrics at: http://localhost:3001/metrics');
  } catch (error) {
    console.error('❌ Error creating workflow instances:', error);
    process.exit(1);
  }
}

createInstances().catch(console.error);
