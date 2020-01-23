/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
// tslint:disable: no-floating-promises
// tslint:disable: no-console
import { SERVICE_IDENTIFIER as CORE_IDENTIFIER, TAG } from 'workit-camunda';
import { IoC } from 'workit-core';
import { IWorkflowClient } from 'workit-types';
import { IBpmDeployment, IBpmDeploymentResource } from 'workit-types/lib/src/core/camunda/workflowDeployment';

(async () => {
  const cm = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
  const path = `${process.cwd()}/bpmn/BPMN_DEMO.bpmn`;

  // Deploy a workflow
  await cm.deployWorkflow(path);

  // Get the list of all deployments (BPMN)
  const allDeployments: IBpmDeployment[] = await cm.getDeployments();

  // Get the list of resource descriptors attached to the first deployment returned
  const deploymentResourceDescriptorList: IBpmDeploymentResource[] = await cm.getDeploymentResourceList(
    allDeployments[0].id
  );

  // Fetch a particular resource (the resource's content, not just the resource's descriptor)
  const deploymentResource: Buffer = await cm.getDeploymentResource(
    deploymentResourceDescriptorList[0].id,
    deploymentResourceDescriptorList[0].deploymentId
  );

  // Dump content of resource (typically the XML content of a BPMN)
  console.log(deploymentResource);

  // Delete a deployment
  await cm.deleteDeployment(allDeployments[0].id);

  console.log('Success!');
})();
