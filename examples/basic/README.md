# Overview

This example shows how to use [Workit](https://villedemontreal.github.io/workit/) to create a simple Node.js application - e.g. a worker that executes a simple task. You will learn how to use Camunda BPM platform as well as AWS Step function

Have fun!

## Installation

```sh
$ # from this directory
$ npm install
```

### Configuring Step function

#### Deploying new workflow

##### Use CloudFormation and the AWS CDK (recommanded)

Todo: provide steps

##### Manually

In `examples/basic/bpmn/stepfunction/BPMN_DEMO.json`, you will need to specify the `QueueUrl` and in `examples/basic/src/deploy.ts` , you must specify the `roleArn` to use for deploying the new workflow.

Notice that you can skip this step if you deploy the workflow through the AWS Step function UI and it won't be necessary to run `npm run deploy`

### For All files

You must specify the following environment variables :

- AWS_REGION
- AWS_ACCESS_KEY_ID
- AWS_SECRET_ACCESS_KEY
- AWS_SQS_QUEUE_URL
- AWS_SQS_WAIT_TIME_SECONDS (Optional)

(Optional) Setup, we can switch to `TAG.camundaBpm` or `TAG.stepFunction` in order to use both plateform (some comments are added in the example).

```sh
$ # from this directory
$ npm run build
```

## Run the Application

```sh
$ # from this directory
$ # deploy the workflow provided in the example
$ npm run deploy
$ # create instance(s)
$ npm run create-instance
$ # run worker
$ npm run worker
```

## Useful links
- For more information on workit, visit: <https://villedemontreal.github.io/workit/>

## LICENSE

MIT
