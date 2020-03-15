# Overview

This example shows how to use [Workit](https://villedemontreal.github.io/workit/) to create a simple Node.js application - e.g. a worker that executes a simple task. You will learn how to use Camunda Cloud (Zeebe Platform).

Have fun!

## Installation

```sh
$ # from this directory
$ npm install
```

Required Setup: please fills variables to [setup.ts](src/setup.ts) 

```sh
$ # from this directory
$ npm run build
```

## Run the Application

```sh
$ # from this directory
$ # deploy a bpmn provided in the example
$ npm camunda:deploy
$ # create instance(s)
$ npm camunda:create-instance
$ # run worker
$ npm camunda:worker
```

## Useful links
- For more information on workit, visit: <https://villedemontreal.github.io/workit/>

## LICENSE

MIT
