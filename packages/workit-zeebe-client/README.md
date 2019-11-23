# WorkIt Zeebe Client

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

## Installing

```bash
npm i workit-zeebe-client
```

## How to use 

```js
    const config = {
      maxTasks: 32,
      workerId: 'test-worker',
      baseUrl: `localhost:26500`,
      topicName: 'demo-service',
      bpmnKey: 'BPMN_DEMO'
    };

    const client = new ZeebeClient(config);
    
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
```

## Start a worker

```js
    import { CoreTracer } from '@opencensus/core';
    import { FailureStrategySimple, SCProcessHandler, SuccessStrategySimple, Worker } from 'workit-core';

    const client = new ZeebeClient(config);
    const successHandler = new SuccessStrategySimple();
    const failureHandler = new FailureStrategySimple();
    const tracer = new CoreTracer();
    const processHandler = new SCProcessHandler(successHandler, failureHandler, tracer);
    const worker = new Worker(client, processHandler);

    worker.start();
    worker.run();
```

## Useful links
-   [Get started in 2 minutes](https://github.com/VilledeMontreal/workit/blob/master/packages/workit-camunda/.docs/WORKER.md).
-   [Documentation is available in this folder](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-camunda/.docs)
-   Comprehensive API documentation is available [online](https://villedemontreal.github.io/workit/) and in the `docs` subdirectory

## Maintainers

See the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
