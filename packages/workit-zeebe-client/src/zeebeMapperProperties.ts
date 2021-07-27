/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { IEmptyPayload, IPayload, IWorkflowProps } from 'workit-types';

export class ZeebeMapperProperties {
  public static map<TVariables = unknown, TProps = unknown>(obj: IPayload<TVariables, TProps>): IWorkflowProps<TProps> {
    let businessKey;
    if (obj.variables || (obj.variables as Record<string, unknown>).businessKey) {
      businessKey = (obj.variables as Record<string, unknown>).businessKey;
    }

    return {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
      businessKey, // retro compatibility with bpmn workflow engine
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
      lockExpirationTime: new Date(Number(obj.deadline)),
    };
  }

  public static unmap<TProps = unknown>(props: IWorkflowProps<TProps>): IEmptyPayload<TProps> {
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
      type: props.topicName,
    };
  }
}
