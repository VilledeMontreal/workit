/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */

import { ICustomHeaders, IVariablePayload, IWorkflowProps } from '@villedemontreal/workit-types';

export class SfnSqsMapperProperties {
  public static map(task: any): IWorkflowProps {
    const properties = task.Body.properties;
    let lockExpirationTime: Date | undefined;

    if (properties.taskTimeoutSeconds && properties.enteredTime) {
      const startedAt = new Date(properties.enteredTime as string | Date);
      lockExpirationTime = new Date(startedAt.getTime() + Number(properties.taskTimeoutSeconds) * 1000);
    } else {
      // default
      lockExpirationTime = new Date(new Date().getTime() + 60_000);
    }
    return {
      activityId: properties.activityId,
      businessKey: properties.businessKey,
      processInstanceId: task.ReceiptHandle,
      workflowDefinitionVersion: properties.version === undefined ? 0 : Number(properties.version) || 0,
      workflowInstanceKey: properties.workflowInstanceKey,
      workflowKey: properties.workflowKey,
      bpmnProcessId: properties.workflowKey,
      customHeaders: SfnSqsMapperProperties._getCustomHeaders(task),
      jobKey: properties.jobKey,
      retries: properties.retries,
      redriveCount: properties.redriveCount,
      topicName: properties.topicName,
      workerId: properties.workerId,
      lockExpirationTime,
    };
  }

  public static unmap(props: IWorkflowProps): IVariablePayload {
    throw new Error('Not Implemented yet');
  }

  private static _getMeta(task: any) {
    return task.Body.properties._meta;
  }

  private static _getCustomHeaders(task: any) {
    const meta = SfnSqsMapperProperties._getMeta(task);
    const customHeaders: ICustomHeaders = {
      messageId: task.MessageId as string,
      MD5OfBody: task.MD5OfBody as string,
      enteredTime: task.Body.properties.enteredTime as Date | string,
    };
    if (meta && typeof meta.customHeaders === 'object') {
      Object.assign(customHeaders, meta.customHeaders);
    }
    return customHeaders;
  }
}
