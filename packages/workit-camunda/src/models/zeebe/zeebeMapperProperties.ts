// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { IProperties } from '../camunda-n-mq/specs/properties';
import { IEmptyPayload, IPayload } from './specs/payload';

export class ZeebeMapperProperties {
  public static map(obj: IPayload): IProperties {
    if (!obj.payload) {
      obj.payload = {};
    }

    return {
      businessKey: obj.payload.businessKey, // retro compatibility with bpmn workflow engine
      activityId: obj.jobHeaders.elementId,
      processInstanceId: obj.jobHeaders.elementInstanceKey,
      workflowDefinitionVersion: obj.jobHeaders.workflowDefinitionVersion,
      workflowInstanceKey: obj.jobHeaders.workflowInstanceKey,
      workflowKey: obj.jobHeaders.workflowKey,
      bpmnProcessId: obj.jobHeaders.bpmnProcessId,
      customHeaders: { ...obj.customHeaders },
      jobKey: obj.key,
      retries: obj.retries,
      topicName: obj.type,
      workerId: obj.worker,
      lockExpirationTime: new Date(obj.deadline)
    };
  }

  public static unmap(props: IProperties): IEmptyPayload {
    return {
      jobHeaders: {
        elementId: props.activityId,
        elementInstanceKey: props.processInstanceId,
        workflowKey: props.workflowKey,
        workflowInstanceKey: props.workflowInstanceKey,
        workflowDefinitionVersion: props.workflowDefinitionVersion,
        bpmnProcessId: props.bpmnProcessId
      },
      retries: props.retries,
      worker: props.workerId,
      deadline: props.lockExpirationTime.getTime().toString(),
      customHeaders: { ...props.customHeaders },
      key: props.jobKey,
      type: props.topicName
    };
  }
}
