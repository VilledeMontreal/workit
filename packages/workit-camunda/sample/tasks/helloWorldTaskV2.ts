/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { SpanKind } from '@opencensus/core';
import axios from 'axios';
import { IMessage } from "../../src";
import { TaskBase } from "../../src/models/core/specs/taskBase";
import { tracerService } from '../config';

// tslint:disable:no-console
export class HelloWorldTaskV2 extends TaskBase<IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
      const { properties } = message;

      console.log(`Executing task: ${properties.activityId} with the class HelloWorldTaskV2`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
      console.log(`version: ${properties.workflowDefinitionVersion}`);
      
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      const tracer = tracerService.getTracer();
      const span = tracer.startChildSpan({ name: 'customSpan', kind: SpanKind.CLIENT });
      
      console.log();
      console.log('data:');
      console.log(response.data);
      // put your business logic here
      span.end();
      return Promise.resolve(message);
  }
}