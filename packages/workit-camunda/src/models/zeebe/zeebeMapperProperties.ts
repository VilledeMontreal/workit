/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IProperties } from '../camunda-n-mq/specs/properties';
import { IEmptyPayload, IPayload } from './specs/payload';

export class ZeebeMapperProperties {
  public static map<TVariables = any, TProps = any>(obj: IPayload<TVariables, TProps>): IProperties<TProps> {
    if (!obj.variables) {
      obj.variables = {} as any;
    }
    return {
      businessKey: (obj.variables as any).businessKey, // retro compatibility with bpmn workflow engine
      activityId: obj.elementId,
      processInstanceId: obj.elementInstanceKey,
      workflowDefinitionVersion: obj.workflowDefinitionVersion,
      workflowInstanceKey: obj.workflowInstanceKey,
      workflowKey: obj.workflowKey,
      bpmnProcessId: obj.bpmnProcessId,
      customHeaders: { ...obj.customHeaders },
      jobKey: obj.key,
      retries: obj.retries,
      topicName: obj.type,
      workerId: obj.worker,
      lockExpirationTime: new Date(Number(obj.deadline))
    };
  }

  public static unmap<TProps = any>(props: IProperties<TProps>): IEmptyPayload<TProps> {
    return {
      elementId: props.activityId,
      elementInstanceKey: props.processInstanceId,
      workflowKey: props.workflowKey,
      workflowInstanceKey: props.workflowInstanceKey,
      workflowDefinitionVersion: props.workflowDefinitionVersion,
      bpmnProcessId: props.bpmnProcessId,
      retries: props.retries,
      worker: props.workerId,
      deadline: props.lockExpirationTime.getTime().toString(),
      customHeaders: { ...props.customHeaders },
      key: props.jobKey,
      type: props.topicName
    };
  }
}
