# Overview

This example shows how to use [Workit](https://villedemontreal.github.io/workit/) to create a simple Node.js application - e.g. a worker that executes a simple task. You will learn how to instrument your application and get traces.

Have fun!

## Installation

First, start Jaeger with its OTLP HTTP collector enabled:

```bash
docker run -d --name jaeger \
  -p 16686:16686 \
  -p 4318:4318 \
  jaegertracing/all-in-one:latest
```

Be sure to have a Camunda platform running. Let's say, you have Camunda BPM (default):
```bash
docker run -d --name camunda -p 8080:8080 camunda/camunda-bpm-platform:latest
```

Then, with your terminal, go to `examples/opentelemetry` run:
```bash
npm i && npm run build
```
and in order to deploy your bpmn and create a process instance in Camunda, run:
```bash
npm run deploy && npm run create-instance
```
Finally, run the worker by running the following command:
```bash
npm run worker
```

You can then navigate to `http://localhost:16686` to access the Jaeger UI.
You should see something like:

<p align="center">
  <a href="../../getting-started/jaeger/jaeger-home.png"><img src="../../getting-started/jaeger/jaeger-home.png"></a>
</p>

By clicking on a trace, you should see something like:
<p align="center">
  <a href="../../getting-started/jaeger/jaeger-trace.png"><img src="../../getting-started/jaeger/jaeger-trace.png"></a>
</p>

<p align="center">
  <a href="../../getting-started/jaeger/jaeger-span.png"><img src="../../getting-started/jaeger/jaeger-span.png"></a>
</p>

👏 Congrats, you have finished the tracing section!

## Useful links
- For more information on OpenTelemetry, visit: <https://opentelemetry.io/>
- For more information on workit, visit: <https://villedemontreal.github.io/workit/>

## LICENSE

MIT
