# WorkIt Camunda BPM Client

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installing

```bash
npm i @villedemontreal/workit-stepfunction-client
```

## How to use 

```js
  const env = process.env;
  const config = {
    region: env.AWS_REGION || '',
    credentials: {
      accessKeyId: env.AWS_ACCESS_KEY_ID || '',
      secretAccessKey: env.AWS_SECRET_ACCESS_KEY || ''
    },
    queueUrl: env.AWS_SQS_QUEUE_URL || '',
    apiVersion: env.AWS_API_VERSION '2016-11-23',
    waitTimeSeconds: env.AWS_SQS_WAIT_TIME_SECONDS || undefined,
    workerId: camundaConfig.worker.id
  };

  const clientLib = new StepFunctionClient(config);
  const client = new SFnSQSClient(config, clientLib);
    
  await client.deployWorkflow('deploy-your.bpmn');
  await client.createWorkflowInstance({
      bpmnProcessId: "BPMN_DEMO",
      variables: {
          amount: 1000,
          hello: "world"
      }
  });
  await client.subscribe(async (message, service) => {
    // do something
  });
  
  // client contains other useful methods
```

## Start a worker

```js
    import { NodeTracer } from '@opentelemetry/node';
    import { FailureStrategySimple, SCProcessHandler, SuccessStrategySimple, Worker } from '@villedemontreal/workit-core';

    const clientLib = new StepFunctionClient(config);
    const client = new SFnSQSClient(config, clientLib);
    const successHandler = new SuccessStrategySimple();
    const failureHandler = new FailureStrategySimple();
    const tracer = new NodeTracer();
    const processHandler = new SCProcessHandler(successHandler, failureHandler, tracer);
    const worker = new Worker(client, processHandler);

    worker.start();
    worker.run();
```

## Useful links
-   [Get started in 2 minutes](https://github.com/VilledeMontreal/workit/blob/master/packages/workit/.docs/WORKER.md).
-   [Documentation is available in this folder](https://github.com/VilledeMontreal/workit/tree/master/packages/workit/.docs)
-   Comprehensive API documentation is available [online](https://villedemontreal.github.io/workit/) and in the `docs` subdirectory

## Maintainers

See the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
