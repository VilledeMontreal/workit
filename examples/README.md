# Overview

Examples show how to use [Workit](https://villedemontreal.github.io/workit/) to create a simple Node.js application - e.g. a worker that executes a simple task.

You can also combine different examples into one - e.g you want to use [OpenTelemetry](opentelemetry) and [Camunda Cloud](camunda-cloud).

Have fun!

## Installation

```sh
$ # inside a directory
$ npm install
```

(Optional) Setup, we can switch to `TAG.camundaBpm` or `TAG.stepFunction` in order to use both plateform (some comments are added in examples when BPMN is available see [basic example](basic)). 

## Run the Application

```sh
$ # inside a directory

$ # deploy a bpmn provided in the example
$ npm deploy
$ # create instance(s)
$ npm create-instance
$ # run worker
$ npm worker
```

## Useful links
-   For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
-   For more information on workit, visit: <https://villedemontreal.github.io/workit/>

## LICENSE

MIT
