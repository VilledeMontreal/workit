/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CamundaMessage } from '../../src/camundaMessage';
import { Variables } from '../../src/variables';

describe('camundaMessage', () => {
  it('unmap', () => {
    const message = {
      body: { hello: 'world' },
      properties: {
        workflowInstanceKey: '38963',
        bpmnProcessId: 'test-process',
        workflowDefinitionVersion: 4,
        workflowKey: '8806',
        activityId: 'ServiceTask_0xdwuw7',
        elementInstanceKey: '38967',
        customHeaders: { jwt: 'jwt fake' },
        jobKey: '38968',
        processInstanceId: '38963',
        retries: 1,
        lockExpirationTime: new Date(1562269537659),
        topicName: 'topic_demo',
        workerId: 'demo',
      },
    };
    const camundaObject = CamundaMessage.unwrap(message);
    expect(camundaObject).toMatchSnapshot();
  });

  it('wrap', () => {
    const camundaPayload = {
      task: { processInstanceId: '38963', processDefinitionId: 'xxxxx', variables: new Variables() } as any,
      taskService: {
        handleFailure: jest.fn(),
        complete: jest.fn(),
      },
    };
    const [, service] = CamundaMessage.wrap(camundaPayload);
    service.nack({ name: 'error', message: 'Oopps', retries: 0, retryTimeout: 15_000 });
    expect(camundaPayload.taskService.handleFailure).toHaveBeenCalledTimes(1);
    expect(camundaPayload.taskService.complete).toHaveBeenCalledTimes(0);
    expect(camundaPayload.taskService.handleFailure.mock.calls[0][1]).toMatchSnapshot();
  });
});
