import { CamundaMessage } from '../../models/camunda/camundaMessage';

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
        workerId: 'demo'
      }
    };
    const camundaObject = CamundaMessage.unwrap(message);
    expect(camundaObject).toMatchSnapshot();
  });
});
