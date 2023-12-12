# Configurations

If you use our default clients (todo, camunda-external-task-client-js), below supported configurations.

## AWS Step function

TODO:

## Camunda BPM

| Option | Description | Type | Required | Default |
|:--------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|------------------------|:--------:|:----------------:|
| baseUrl | Path to the engine api | string | ✓ |  |
| workerId | The id of the worker on which behalf tasks are fetched. The returned tasks are locked for that worker and can only be completed when providing the same worker id. | string |  | "some-random-id" |
| topicName | topic to subscribe | string | ✓ |  |
| maxTasks | The maximum number of tasks to fetch | number |  | 10 |
| maxParallelExecutions | The maximum number of tasks to be worked on simultaneously | number |  | |
| interval | Interval of time to wait before making a new poll. | number |  | 300 |
| lockDuration | The default duration to lock the external tasks for in milliseconds. | number |  | 50000 |
| autoPoll | If true, then polling start automatically as soon as a Client instance is created. | boolean |  | override to false and you should set to false if you inject you own client that use  `camunda/camunda-external-task-client-js` |
| asyncResponseTimeout | The Long Polling timeout in milliseconds. | number |  |  |
| interceptors | Function(s) that will be called before a request is sent. Interceptors receive the configuration of the request and return a new configuration. | function or [function] |  |  |
| use | Function(s) that have access to the client instance as soon as it is created and before any polling happens.  Check out [logger](/lib/logger.js) for a better understanding of the usage of middlewares. | function or [function] |  |  |
| subscriptionOptions | Options about subscriptions. Like restricting what Camunda will send to the worker | ISubscriptionOptions |  |  |

[More details](https://github.com/camunda/camunda-external-task-client-js/blob/master/docs/Client.md)

### Environment variables

| Variable | Description 
|:--------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|
| CAMUNDA_BPM_ADDRESS | REST API Server |

## Process handler

| Option | Description | Type | Required | Default |
|:--------------------:|:--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------:|------------------------|:--------:|:----------------:|
| interceptors | Function(s) that will be called before executing activity. Interceptors receive the message `IMessage` return IMessage object. | function or [function] |  |  |