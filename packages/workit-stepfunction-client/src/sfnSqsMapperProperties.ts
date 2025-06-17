/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */

import { ICustomHeaders, IVariablePayload, IWorkflowProps } from '@villedemontreal/workit-types';

export class SfnSqsMapperValidationError extends Error {
  constructor(
    message: string,
    public readonly field: string,
  ) {
    super(message);
    this.name = 'SfnSqsMapperValidationError';
  }
}

export class SfnSqsMapperProperties {
  public static map(task: any): IWorkflowProps {
    // Validation stricte de la structure du task
    if (!task || typeof task !== 'object') {
      throw new SfnSqsMapperValidationError('Task must be a valid object', 'task');
    }

    if (!task.Body || typeof task.Body !== 'object') {
      throw new SfnSqsMapperValidationError('Task.Body must be a valid object', 'task.Body');
    }

    if (!task.Body.properties || typeof task.Body.properties !== 'object') {
      throw new SfnSqsMapperValidationError('Task.Body.properties must be a valid object', 'task.Body.properties');
    }

    const properties = task.Body.properties;

    // Validation critique: jobKey est requis pour l'acknowledgment AWS
    if (!properties.jobKey || typeof properties.jobKey !== 'string' || properties.jobKey.trim() === '') {
      throw new SfnSqsMapperValidationError(
        'jobKey is required and must be a non-empty string for acknowledgment',
        'jobKey',
      );
    }

    // Validation des autres propriétés requises
    if (!properties.activityId || typeof properties.activityId !== 'string') {
      throw new SfnSqsMapperValidationError('activityId is required and must be a string', 'activityId');
    }

    // Validation des propriétés numériques
    if (
      properties.retries !== null &&
      properties.retries !== undefined &&
      (typeof properties.retries !== 'number' || !Number.isInteger(properties.retries) || properties.retries < 0)
    ) {
      throw new SfnSqsMapperValidationError('retries must be null or a non-negative integer', 'retries');
    }

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
      processInstanceId: properties.processInstanceId,
      workflowDefinitionVersion: properties.version === undefined ? 1 : Number(properties.version) || 1,
      workflowInstanceKey: properties.workflowInstanceKey,
      workflowKey: properties.workflowKey,
      bpmnProcessId: properties.bpmnProcessId,
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
