// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IProperties } from '../camunda-n-mq/specs/properties';
import { IVariablePayload } from './specs/payload';

export class CamundaMapperProperties {
  public static map(task: IVariablePayload): IProperties {
    return {
      activityId: task.activityId,
      businessKey: task.businessKey,
      processInstanceId: task.processInstanceId,
      workflowDefinitionVersion: Number(task.processDefinitionId.split(':')[1]),
      workflowInstanceKey: task.processDefinitionId,
      workflowKey: task.processDefinitionKey,
      bpmnProcessId: task.processDefinitionKey,
      customHeaders: CamundaMapperProperties.getCustomHeaders(task),
      jobKey: task.executionId,
      retries: task.retries,
      topicName: task.topicName,
      workerId: task.workerId,
      lockExpirationTime: new Date(task.lockExpirationTime)
    };
  }

  public static unmap(props: IProperties): IVariablePayload {
    throw new Error('Not Implemented yet');
  }

  private static getMeta(task: IVariablePayload) {
    return task.variables.get('_meta');
  }

  private static getCustomHeaders(task: IVariablePayload) {
    const meta = CamundaMapperProperties.getMeta(task);
    if (meta && meta.customHeaders) {
      return meta.customHeaders;
    }
    return {};
  }
}
