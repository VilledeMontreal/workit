/*
 * Copyright (c) 2021 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { TaskBase } from '@villedemontreal/workit-core';
import { IMessage } from '@villedemontreal/workit-types';

export class HelloWorldTaskV3 extends TaskBase<IMessage> {
  public execute(message: IMessage): Promise<IMessage> {
    const { properties } = message;
    // --------------------------
    console.log();
    console.log(`Executing task: ${ properties.activityId } with the class HelloWorldTaskV3`);
    console.log(`${ properties.bpmnProcessId }::${ properties.processInstanceId } Servus!`);
    console.log(`version: ${ properties.workflowDefinitionVersion }`);

    return Promise.resolve(message);
  }
}
