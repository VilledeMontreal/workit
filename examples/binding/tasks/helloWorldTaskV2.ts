/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import axios from 'axios';
import { TaskBase } from 'workit-core';
import { IMessage } from 'workit-types';

export class HelloWorldTaskV2 extends TaskBase<IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    const { properties } = message;

    console.log();
    console.log(`Executing task: ${properties.activityId} with the class HelloWorldTaskV2`);
    console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
    console.log(`version: ${properties.workflowDefinitionVersion}`);

    const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');

    console.log();
    console.log('data:');
    console.log(response.data);

    return message;
  }
}
