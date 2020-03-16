/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IVariablePayload, IWorkflowProps } from 'workit-types';

export class CamundaMapperProperties {
  public static map(task: IVariablePayload): IWorkflowProps {
    return {
      activityId: task.activityId,
      businessKey: task.businessKey,
      processInstanceId: task.processInstanceId,
      workflowDefinitionVersion: Number(task.processDefinitionId.split(':')[1]),
      workflowInstanceKey: task.processDefinitionId,
      workflowKey: task.processDefinitionKey,
      bpmnProcessId: task.processDefinitionKey,
      customHeaders: CamundaMapperProperties._getCustomHeaders(task),
      jobKey: task.id,
      retries: task.retries,
      topicName: task.topicName,
      workerId: task.workerId,
      lockExpirationTime: new Date(task.lockExpirationTime)
    };
  }

  public static unmap(props: IWorkflowProps): IVariablePayload {
    throw new Error('Not Implemented yet');
  }

  private static _getMeta(task: IVariablePayload) {
    return task.variables.get('_meta');
  }

  private static _getCustomHeaders(task: IVariablePayload) {
    const meta = CamundaMapperProperties._getMeta(task);
    if (meta && meta.customHeaders) {
      return meta.customHeaders;
    }
    return {};
  }
}
