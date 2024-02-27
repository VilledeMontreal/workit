/*
 * Copyright (c) 2024 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { TaskBase } from '@villedemontreal/workit-core';
import { IMessage } from '@villedemontreal/workit-types';
import axios from 'axios';

export class HelloWorldTask extends TaskBase<IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    const { properties } = message;

    console.log(`Executing task: ${properties.activityId}`);
    console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);

    // should throw for the purpose of this example
    await axios.get('https://jsonplaceholder.typicode.com/fake/1');

    return message;
  }
}
