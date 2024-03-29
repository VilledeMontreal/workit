# WorkIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) ![npm](https://img.shields.io/npm/v/@villedemontreal/workit-types)

[Français](README_FR.md)

✨Extensible worker for Node.js that works with both AWS Step function and Camunda BPM platforms powered by TypeScript ✨

## Motivation

We needed a framework to help us quickly build workers used to execute tasks.

This package can be useful because:
-   Experiment and choose the platform you want without rewritting the business logic. Today, only Camunda and AWS Step function clients are maintained
-   Instead of depending directly from a Camunda client, this project provides an abstraction layer. This way it’s easier to change the client or to make your own.
-   You want to have a worker standardization.
-   Uniformisation. Indeed, you can use both platforms depending project needs.
-   Added features like automated tracing.

## Quickstart

[Get started in 2 minutes](getting-started/README.md).

## Documentation

-   [Documentation is available in this folder](packages/workit/.docs/)
-   Comprehensive API documentation is available [online](https://villedemontreal.github.io/workit/) and in the `docs` subdirectory
-   [Examples](examples)

### API

| Package | Description |
| --- | ---|
| [workit-types](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-types) | This package provides TypeScript interfaces and enums for the Workit core model. 
| [workit-core](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-core) | This package provides default and no-op implementations of the Workit types 

### Implementation / Clients

| Package                                  | Description |
| ---------------------------------------- | -----------------|
| [workit-bpm-client](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-bpm-client) | This module provides a full control over the Camunda Bpm platform.<br> It use [`camunda-external-task-client-js`](https://github.com/camunda/camunda-external-task-client-js) by default. |

## Installing

```bash
npm i @villedemontreal/workit
```
or using the generator below
### Yo!

<p align="center"><img src=".repo/render1561149492572.gif?raw=true"/></p>

This generator will help you during your development with this library. It provides handy tools.

```bash
npm i -g @villedemontreal/workit-cli
```

#### Install a fresh new project

```bash
workit init
```
#### Generate tasks from your existing BPMN

```bash
workit create task --file /your/path.bpmn
```

#### Generate new task

```bash
workit create task
```

## How to use

Switching between platforms is easy as specifying a `TAG` to the IoC.

### Run worker

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.start();
worker.run();
```

### Deploy a workflow

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
const fullpath = `${process.cwd()}/sample/BPMN_DEMO.bpmn`;
await manager.deployWorkflow(fullpath);
```

### Get workflows

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.getWorkflows()
```

### Get a workflow

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.getWorkflow({ bpmnProcessId: "DEMO" });
```

### Update variables

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.updateVariables({ 
    processInstanceId: "5c50c48e-4691-11e9-8b8f-0242ac110002",
    variables: { amount: 1000 }
});
```

### Publish message

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.publishMessage({
    correlation: {},
    name: "catching",
    variables: { amount: 100 },
    messageId: "5c50c48e-4691-11e9-8b8f-0242ac110002"
});
```

### Create workflow instance

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.createWorkflowInstance({
    bpmnProcessId: "MY_BPMN_KEY",
    variables: {
        hello: "world"
    }
});
```

### Cancel workflow instance

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.cancelWorkflowInstance("4651614f-4b3c-11e9-b5b3-ee5801424400");
```

### Resolve incident

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.resolveIncident("c84fce6c-518e-11e9-bd78-0242ac110003");
```

### Define tasks (your bpmn activities)

You can define many tasks to one worker. It will handle all messages and will route to the right tasks.

```javascript
export class HelloWorldTask extends TaskBase<IMessage> {
  // You can type message like IMessage<TBody, TProps> default any
  public execute(message: IMessage): Promise<IMessage> {
      const { properties } = message;
      console.log(`Executing task: ${properties.activityId}`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
      // put your business logic here
      return Promise.resolve(message);
  }
}


enum LOCAL_IDENTIFIER {
    // sample_activity must match the activityId in your bpmn
    sample_activity= 'sample_activity'
}

// Register your task
IoC.bindTo(HelloWorldTask, LOCAL_IDENTIFIER.sample_activity);
```

You can even make complex binding like
```javascript
IoC.bindTask(HelloWorldTaskV2, LOCAL_IDENTIFIER.activity1, { bpmnProcessId: BPMN_PROCESS_ID, version: 2 });
```

If you have installed `workit-cli`, you can do `workit create task` 
and everything will be done for you.

### Worker life cycle and events

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.once('starting', () => {
    // slack notification 
});

worker.once('stopping', () => {
    // close connections
});

worker.once('stopped', () => {
    // slack notification
});

const handler = worker.getProcessHandler();

handler.on('message', (msg: IMessage) => {
    // log/audit
});

handler.on('message-handled', (err: Error, msg: IMessage) => {
    if (err) {
        // something wrong
    } else {
        // everything is fine
    }
});

worker.start();
worker.run(); // Promise
worker.stop(); // Promise
```

### Interceptors

```javascript
const workerConfig = {
  interceptors: [
    async (message: IMessage): Promise<IMessage> => {
      // do something before we execute task.
      return message;
    }
  ]
};

IoC.bindToObject(workerConfig, CORE_IDENTIFIER.worker_config);
```

### OpenTelemetry
By default, we bound a `NoopTracer` but you can provide your own and it must extend [Tracer](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-api/src/trace/tracer.ts#L29).We strongly recommand to use this kind of pattern in your task: [Domain Probe pattern](https://martinfowler.com/articles/domain-oriented-observability.html#DomainProbesEnableCleanerMore-focusedTests). But here an example:

```javascript
// Simply bind your custom tracer object like this
IoC.bindToObject(tracer, CORE_IDENTIFIER.tracer);
```

```javascript
export class HelloWorldTask extends TaskBase<IMessage> {
  private readonly _tracer: Tracer;
    
  constructor(tracer: Tracer) {
        this._tracer = tracer
  }

  public async execute(message: IMessage): Promise<IMessage> {
      const { properties } = message;
      
      console.log(`Executing task: ${properties.activityId}`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);

      // This call will be traced automatically
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      
      // you can also create a custom trace like this :
      const currentSpan = tracer.getCurrentSpan();
      const span = this._tracer.startSpan('customSpan', {
        parent: currentSpan,
        kind: SpanKind.CLIENT,
        attributes: { key: 'value' },
      });
      
      console.log();
      console.log('data:');
      console.log(response.data);
      // put your business logic here

      // finish the span scope
      span.end();
      
      return Promise.resolve(message);
  }
}
```
You can look to `sample` folder where we provide an example (parallel.ts) using [Jaeger](https://www.jaegertracing.io/docs/latest/).

[See get started section with OpenTelemetry](packages/workit/.docs/WORKER.md#add-traces-to-your-worker-with-opentelemetry)

### Define your config for the platform you want to use

TODO show for step function

### Define your strategies in case of failure or success

By default, we define simple strategy for success or failure. 
We strongly recommend you to provide yours as your app trigger specific exceptions.
Strategies are automatically handled.
If an exeption is bubble up from the task, failure strategy  is raised, otherwise it's success.

```javascript
// the idea is to create your own but imagine that your worker works mainly with HTTP REST API
class ServerErrorHandler extends ErrorHandlerBase {
  constructor(config: { maxRetries: number }) {
    super(config);
  }

  public isHandled(error: IErrorResponse<IResponse<IApiError>>): boolean {
    return error.response.status >= 500;
  }
  public handle(error: IErrorResponse<IResponse<IApiError>>, message: IMessage): Failure {
    const retries = this.getRetryValue(message);
    return new Failure(error.message, this.buildErrorDetails(error, message), retries, 2000 * retries);
  }
}

// You got the idea...

// You could create also
// BadRequestErrorHandler
// TimeoutErrorHandler
// UnManagedErrorHandler
// ...
// Then you could build your strategy
/// "FailureStrategy" implements "IFailureStrategy", this interface is provided by workit
const strategy = new FailureStrategy([
  new AxiosApiErrorHandler(errorConfig, [
    new BadRequestErrorHandler(errorConfig),
    new TimeoutErrorHandler(errorConfig),
    new ServerErrorHandler(errorConfig),
    new UnManagedErrorHandler(errorConfig),
    //...
  ]),
  new ErrorHandler(errorConfig)
]);
// worker will use your new strategy
IoC.bindToObject(strategy, CORE_IDENTIFIER.failure_strategy);
```

## Running the tests

We use Jest.

```bash
npm test
```

## Built With

*   [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js) - nodejs client for Camunda BPM
*   [inversify](https://github.com/inversify/InversifyJS) - Dependency injection
*   [opentelemetry](https://opentelemetry.io/) - add instrumentation to the operations (provides a single set of APIs, libraries to capture distributed traces)

## Philosophy

1.  Allow Javascript developers to write code that adheres to the SOLID principles.
2.  Facilitate and encourage the adherence to the best OOP and IoC practices.
3.  Add as little runtime overhead as possible.

## Docker

### Bpmn platform
```bash
docker run -d --name camunda -p 8080:8080 camunda/camunda-bpm-platform:latest
// Go: http://localhost:8080/camunda - user/password : `demo/demo`
```
[More details](https://github.com/camunda/docker-camunda-bpm-platform)

## TODO
<details>
<summary>Click to expand</summary>

-   Add tests
-   Improve docs
-   Make sample and confirm compatibility with DMN
-   Adding a common exception error codes between Manager clients
-   Add metrics by using prometheus lib
</details>

## Versionning

We use [SemVer](http://semver.org/) for versioning. For the versions available, see the [tags on this repository](https://github.com/VilledeMontreal/workit/tags).

workit | AWS Step function | Camunda BPM
-- | -- | -- 
\>=6.0.0 | TODO | 7.6 to latest

## Maintainers

See the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details
