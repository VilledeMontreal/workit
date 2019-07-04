// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import * as opentracing from 'opentracing';
import { ZeebeMessage } from '../../models/zeebe/zeebeMessage';

// tslint:disable:ter-prefer-arrow-callback
// tslint:disable:only-arrow-functions
// tslint:disable:max-func-body-length
describe('zeebeMessage', function() {
  it.only('unmap', () => {
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
        workerId: 'demo'
      },
      spans: new opentracing.Span()
    };
    const zeebeObject = ZeebeMessage.unwrap(message);
    expect(zeebeObject).toMatchSnapshot();
  });
});
