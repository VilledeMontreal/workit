# WorkIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![Greenkeeper badge](https://badges.greenkeeper.io/VilledeMontreal/workit.svg)](https://greenkeeper.io/) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3c1fca456ba14ed7a1613b7f698d2ee3)](https://www.codacy.com/app/albertini.olivier/workit?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=VilledeMontreal/workit&amp;utm_campaign=Badge_Grade)

[Français](README_FR.md)

✨Extensible worker for Node.js that works with both Zeebe and Camunda BPM platforms powered by TypeScript ✨

## Motivation

We needed a framework to help us quickly build workers used to execute tasks.

This package can be useful because:
-   Experiment and choose the Camunda platform you want without rewritting the business logic.
-   At this moment, Zeebe doesn't provide all BPMN components. Zeebe is new and some unexpected bugs can appear during development so we can easily revert back to the the former platform if an issue was to rise.
-   Instead of depending directly from a Camunda client, this project provides an abstraction layer. This way it’s easier to change the client or to make your own.
-   You want to have a worker standardization.
-   Uniformisation. Indeed, you can use both platforms depending project needs.
-   Added features like automated tracing.
-   This package enforce feature parity between Zeebe and Camunda BPM through the client libraries. Some features exposed to the Camunda BPM platform are not presents in this package because we couldn't provide them if we switch to Zeebe. This limitation is to guide developers to prepare migration.

## Quickstart

[Get started in 2 minutes](getting-started/README.md).

## Documentation

-   [Documentation is available in this folder](packages/workit-camunda/.docs/)
-   Comprehensive API documentation is available [online](https://villedemontreal.github.io/workit/) and in the `docs` subdirectory

## Packages

### API

| <div style="width:100px">Package</div> | Description |
| -------------------------------------------- | -----------------|
| [workit-types](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-types) | This package provides TypeScript interfaces and enums for the Workit core model. |
| [workit-core](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-core) | This package provides default and no-op implementations of the Workit types for Camunda Bpm and Zeebe. |

### Implementation / Clients

| <div style="width:150px">Package</div>  | Description |
| --------------------------------------- | -----------------|
| [workit-bpm-client](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-bpm-client) | This module provides a full control over the Camunda Bpm platform. It use [`camunda-external-task-client-js`](https://github.com/camunda/camunda-external-task-client-js) by default. |
| [workit-zeebe-client](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-zeebe-client) | This module provides a full control over the Zeebe platform. It use [`zeebe-node`](https://github.com/creditsenseau/zeebe-client-node-js) and [`zeebe-elasticsearch-client`](https://github.com/VilledeMontreal/workit/tree/master/packages/zeebe-elasticsearch-client)  by default. |
| [workit-camunda](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-camunda) | This module allows you to switch between Camunda BPM and Zeebe easily. It use [`workit-bpm-client`](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-bpm-client) and [`workit-zeebe-client`](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-zeebe-client) by default. |

## Installing

```bash
npm i workit-camunda
```
or using the generator below
### Yo!

<p align="center"><img src=".repo/render1561149492572.gif?raw=true"/></p>

This generator will help you during your development with this library. It provides handy tools.

```bash
npm i -g workit-cli
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

Switching between Zeebe and the bpmn platform is easy as specifying a `TAG` to the IoC.

### Run worker

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm); // or TAG.zeebe

worker.start();
worker.run();
```

### Deploy a workflow

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
const fullpath = `${process.cwd()}/sample/BPMN_DEMO.bpmn`;
await manager.deployWorkflow(fullpath);
```

### Get workflows

*Zeebe: You will need elasticsearch instance.*

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.getWorkflows()
```

### Get a workflow

*Zeebe: You will need elasticsearch instance.*

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.getWorkflow({ bpmnProcessId: "DEMO" });
```

### Update variables

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.updateVariables({ 
    processInstanceId: "5c50c48e-4691-11e9-8b8f-0242ac110002",
    variables: { amount: 1000 }
});
```

### Publish message

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.publishMessage({
    correlation: {},
    name: "catching",
    variables: { amount: 100 },
    timeToLive: undefined, // only supported for Zeebe
    messageId: "5c50c48e-4691-11e9-8b8f-0242ac110002"
});
```

### Create workflow instance

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.createWorkflowInstance({
    bpmnProcessId: "MY_BPMN_KEY",
    variables: {
        hello: "world"
    }
});
```

### Cancel workflow instance

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.cancelWorkflowInstance("4651614f-4b3c-11e9-b5b3-ee5801424400");
```

### Resolve incident

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
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
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.zeebe); // or TAG.camundaBpm

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

### Open-telemetry
By default, we bound a `NoopTracer` but you can provide your own and it must extend [Tracer](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-types/src/trace/tracer.ts#L29).We strongly recommand to use this kind of pattern in your task: [Domain Probe pattern](https://martinfowler.com/articles/domain-oriented-observability.html#DomainProbesEnableCleanerMore-focusedTests). But here an example:

```javascript
// Simply bind your custom tracer object like this
IoC.bindToObject(tracer, CORE_IDENTIFIER.tracer);
```

```javascript
export class HelloWorldTask extends TaskBase<IMessage> {
  private readonly _tracer: TracerBase;
    
  constructor(tracer: TracerBase) {
        this._tracer = tracer
  }

  public async execute(message: IMessage): Promise<IMessage> {
      const { properties } = message;
      
      console.log(`Executing task: ${properties.activityId}`);
      console.log(`${properties.bpmnProcessId}::${properties.processInstanceId} Servus!`);
      message.body.test = true;
      // This call will be traced automatically
      const response = await axios.get('https://jsonplaceholder.typicode.com/todos/1');
      
      // you can also create a custom trace like this :
      const span = this._tracer.startChildSpan({ name: 'customSpan', kind: SpanKind.CLIENT });
      
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

[See get started section with OpenTelemetry](packages/workit-camunda/.docs/WORKER.md#add-traces-to-your-worker-with-opentelemetry)

### Define your config for the platform you want to use

```javascript
const configBase: ICamundaConfig = {
    workerId: 'demo',
    baseUrl: `__undefined__`,
    topicName: 'topic_demo'
};

// For Camunda BPM platform
const bpmnPlatformClientConfig = { ...configBase, baseUrl: 'http://localhost:8080/engine-rest',  maxTasks: 32, autoPoll: false, use: [] };

IoC.bindToObject(bpmnPlatformClientConfig, CORE_IDENTIFIER.camunda_external_config);

// For Zeebe platform
const zeebeClientConfig = { ...configBase, baseUrl: 'localhost:2650', timeout: 2000 };

// For Zeebe exporter (Elasticsearch instance)
const zeebeElasticExporterConfig = {
    url: `http://localhost:9200`,
};

IoC.bindToObject(zeebeClientConfig, CORE_IDENTIFIER.zeebe_external_config);
IoC.bindToObject(zeebeElasticExporterConfig, CORE_IDENTIFIER.zeebe_elastic_exporter_config)
```
[See documentation](packages/workit-camunda/.docs/CONFIG.md)

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
/// "FailureStrategy" implements "IFailureStrategy", this interface is provided by workit-camunda
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

*   [zeebe-node](https://github.com/CreditSenseAU/zeebe-client-node-js) - nodejs client for Zeebe
*   [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js) - nodejs client for Camunda BPM
*   [inversify](https://github.com/inversify/InversifyJS) - Dependency injection
*   [opentelemtry](https://opentelemetry.io/) - add instrumentation to the operations (provides a single set of APIs, libraries to capture distributed traces)

## Philosophy

1.  Allow Javascript developers to write code that adheres to the SOLID principles.
2.  Facilitate and encourage the adherence to the best OOP and IoC practices.
3.  Add as little runtime overhead as possible.

## Kubernetes

### Zeebe

TODO: provide helm chart.
But in the meantime, you can do for development: 
```bash
kubernetes/run
```

## Docker

### Zeebe

In your terminal
```bash
docker/run
```
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

workit-camunda | Zeebe | Camunda BPM
-- | -- | -- 
3.2.x <=4.0.0 | 0.20.x < 0.20.1 | 7.6 to latest
3.1.x | 0.20.x < 0.20.1 | 7.6 to latest
2.2.0 | 0.20.x < 0.20.1 | 7.6 to latest
2.1.0 | 0.19.x | 7.6 to latest
2.0.1 | 0.18.x | 7.6 to latest
< 1.0.0 | <= 0.17.0 | 7.6 to latest

## Maintainers

See the list of [contributors](CONTRIBUTORS.md) who participated in this project.

## Contributing

Please read [CONTRIBUTING.md](CONTRIBUTING.md) for details on our code of conduct, and the process for submitting pull requests to us.

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details

## Acknowledgments

*   [Josh Wulf](https://github.com/jwulf) - zeebe-node inspired me during `workit-cli` development
