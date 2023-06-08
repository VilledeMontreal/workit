/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */ // --> OFF
/* eslint @typescript-eslint/ban-types: 0 */ // --> OFF
/* eslint @typescript-eslint/restrict-template-expressions: 0 */ // --> OFF
/* eslint @typescript-eslint/no-unsafe-call: 0 */ // --> OFF
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */ // --> OFF
// eslint-disable-next-line @typescript-eslint/no-var-requires
const stringify = require('fast-safe-stringify');

const { pid } = process;
const { platform } = process;

/**
 * @returns a formatted success message
 */
const success = (message: string | {}) =>
  process.stdout.write(
    `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":30,"msg":"${stringify(
      message
    )}","time":"${new Date().toISOString()}","v":0}\n`
  );

/**
 * @returns a formatted error message
 */
const error = (message: string | {}) =>
  process.stdout.write(
    `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"${stringify(
      message
    )}","time":"${new Date().toISOString()}","v":0}\n`
  );

/**
 * logs various events from client
 * @param client
 */
const log = (client: any) => {
  client.on('subscribe', (topic: string) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","platform":"${platform}","logType":"mtl-worker","level":30,"msg":"subscribed to topic ${topic}","time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('unsubscribe', (topic: string) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","platform":"${platform}","logType":"mtl-worker","level":40,"msg":"unsubscribed from topic ${topic}","time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  // client.on('poll:start', () => {
  //   console.log(
  //     `{"name":"default","pid":"${pid}","platform":"${platform}","logType":"mtl-worker","level":40,"msg":"start polling","time":"${new Date().toISOString()}","v":0}`
  //   );
  // });

  client.on('poll:stop', () => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","platform":"${platform}","logType":"mtl-worker","level":40,"msg":"stop polling","time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  //   client.on("poll:success", tasks => {
  //     const output = success(`polled ${tasks.length} tasks`);
  //     console.log(output);
  //   });

  client.on('poll:error', (e: Error) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"polling failed","error":${stringify(
        e
      )},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('complete:success', (task: any) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":30,"msg":"task completed","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('complete:error', (task: any, e: Error) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"task failed","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"retries":"${task.retries}","error":"${stringify(e)}","time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('handleFailure:success', (task: any) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":40,"msg":"handle failure completed","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('handleFailure:error', (task: any, e: Error) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"handle failure failed... Happy coding!","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"retries":"${task.retries}","error":${stringify(e)},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('handleBpmnError:success', (task: any) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":40,"msg":"handle Bpmn error completed","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('handleBpmnError:error', (task: any, e: Error) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"handle bpmn error failed... Happy coding!","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"retries":"${task.retries}","error":${stringify(e)},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('extendLock:success', (task: any) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":30,"msg":"extend lock success","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('extendLock:error', (task: any, e: Error) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"extend lock error","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"retries":"${task.retries}","error":${stringify(e)},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('unlock:success', (task: any) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":30,"msg":"unlock success","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });

  client.on('unlock:error', (task: any, e: Error) => {
    process.stdout.write(
      `{"name":"default","pid":"${pid}","logType":"mtl-worker","level":50,"msg":"unlock error","activityId":"${
        task.activityId
      }","processInstanceId":"${task.processInstanceId}","workerId":"${task.workerId}","topicName":"${
        task.topicName
      }","processDefinitionId":"${task.processDefinitionId}","variables":${stringify(
        task.variables.getAll()
      )},"retries":"${task.retries}","error":${stringify(e)},"time":"${new Date().toISOString()}","v":0}\n`
    );
  });
};

export const logger = Object.assign(log, { success, error });
