# WorkIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) [![Greenkeeper badge](https://badges.greenkeeper.io/VilledeMontreal/workit.svg)](https://greenkeeper.io/) [![Codacy Badge](https://api.codacy.com/project/badge/Grade/3c1fca456ba14ed7a1613b7f698d2ee3)](https://www.codacy.com/app/albertini.olivier/workit?utm_source=github.com&amp;utm_medium=referral&amp;utm_content=VilledeMontreal/workit&amp;utm_campaign=Badge_Grade)

✨ Worker extensible pour Node.js fonctionnant avec les plates-formes Zeebe et Camunda BPM optimisées par TypeScript ✨

## Motivation

Nous avions besoin d'un framework pour nous aider à développer rapidement des Workers. Ces derniers sont utilisés pour exécuter des tâches.

Ce framework est utile parce que:
-   Expérimenter et choisir la plate-forme Camunda (et pas seulement Camunda) que vous voulez sans réécrire la logique métier.
-   Zeebe ne fournit pas tous les composants BPMN pour le moment. Zeebe est nouveau et des bugs inattendus peuvent apparaître lors du développement, ce qui nous permet de revenir facilement à l'ancienne plate-forme si un problème se posait.
-   Au lieu de dépendre directement d'un client Camunda, ce projet fournit une couche d'abstraction. De cette façon, il est plus facile de changer de client ou de créer le vôtre.
-   Vous voulez avoir une standardisation des workers.
-   L'uniformisation. En effet, vous pouvez utiliser les deux plates-formes en fonction des besoins du projet.
-   Ajout de fonctionnalités comme Opentracing.
-   Ce Framework impose la parité des fonctionnalités entre Zeebe et Camunda BPM via les bibliothèques clientes. Certaines fonctionnalités exposées à la plate-forme Camunda BPM ne sont pas présentes dans ce package car nous ne pourrions pas les fournir si nous passons à Zeebe. Cette limitation est destinée à guider les développeurs dans la préparation de la migration.

## Démarrage rapide

[Commencez en 2 minutes](packages/workit-camunda/.docs/WORKER.md).

## Documentation

-   [.docs](packages/workit-camunda/.docs/) contient la documentation écrite.
-   Une documentation complète sur l'API est disponible [en ligne](https://villedemontreal.github.io/workit/) et dans le sous répertoire `docs`

## L'installation

```bash
npm i workit-camunda
```
ou utiliser le générateur en dessous
### Yo!

<p align="center"><img src=".repo/render1561149492572.gif?raw=true"/></p>

Ce générateur vous aidera lors de votre développement avec ce framework. Il fournit des outils pratiques.

```bash
npm i -g workit-cli
```

#### Installer un nouveau projet

```bash
workit init
```
#### Générer des tâches à partir de votre BPMN existant

```bash
workit create task --file /your/path.bpmn
```

#### Générer une nouvelle tâche

```bash
workit create task
```

## Comment utiliser

Basculer entre Zeebe et la plate-forme Camunda BPM est simple, il suffit de spécifier un `TAG` pour l'IoC.

### Rouler le worker

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm); // or TAG.zeebe

worker.start();
worker.run();
```

### Déployer un workflow

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
const fullpath = `${process.cwd()}/sample/BPMN_DEMO.bpmn`;
await manager.deployWorkflow(fullpath);
```

### Obtenir les flux de travail

*Zeebe: Vous aurez besoin de l'instance Elasticsearch.*

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.getWorkflows()
```

### Obtenir un flux de travail

*Zeebe: Vous aurez besoin de l'instance Elasticsearch.*

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.getWorkflow({ bpmnProcessId: "DEMO" });
```

### Mettre à jour les variables

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.updateVariables({ 
    processInstanceId: "5c50c48e-4691-11e9-8b8f-0242ac110002",
    variables: { amount: 1000 }
});
```

### Publier un message

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

### Créer une instance de flux de travail

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); // or TAG.zeebe
await manager.createWorkflowInstance({
    bpmnProcessId: "MY_BPMN_KEY",
    variables: {
        hello: "world"
    }
});
```

### Annuler l'instance d'un flux de travail

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); 
// or TAG.zeebe
await manager.cancelWorkflowInstance("4651614f-4b3c-11e9-b5b3-ee5801424400");
```

### Résoudre l'incident

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm); 
// or TAG.zeebe
await manager.resolveIncident("c84fce6c-518e-11e9-bd78-0242ac110003");
```

### Définir les tâches (vos activités bpmn)

Vous pouvez définir plusieurs tâches pour un seul Worker. Il traitera tous les messages et acheminera les requêtes vers les bonnes tâches.

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

Vous pouvez même faire des liaisons complexes comme
```javascript
IoC.bindTask(HelloWorldTaskV2, LOCAL_IDENTIFIER.activity1, { bpmnProcessId: BPMN_PROCESS_ID, version: 2 });
```

Si vous avez installé `workit-cli`, vous pouvez faire` workit create task` (vous devez avoir une structure de fichier standard au projet généré via la commande `workit init`)
et tout sera fait pour vous.

### Cycle de vie et événements des Workers

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.zeebe); 
// or TAG.camundaBpm

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

### Les intercepteurs

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

### Opentracing
WorkIt intègre opentracing afin de fournir des instruments aux développeurs. Par défaut, nous lions un `NoopTracer` mais vous pouvez en fournir un et il doit être compatible avec [l'interface d'Opentracing](https://opentracing.io/docs/overview/tracers/#tracer-interface). Nous utilisons [le pattern "Domain Probe"](https://martinfowler.com/articles/domain-oriented-observability.html#DomainProbesEnableCleanerMore-focusedTests) dans nos clients Camunda. De cette manière, nous permettons aux développeurs de lier les leurs instruments propres et/ou d’ajouter des instrumentations supplémentaires telles que les logs et les métriques. Nous vous recommandons fortement d'utiliser ce type de modèle dans votre tâche.

```javascript
// Simply bind your custom tracer object like this
IoC.bindToObject(tracer, CORE_IDENTIFIER.tracer);
```
Vous pouvez maintenant accéder à la propriété `spans` dans l'objet `IMessage`.

```javascript
export class HelloWorldTask extends TaskBase<IMessage> {
  public execute(message: IMessage): Promise<IMessage> {
      const { properties, spans } = message;
      // --------------------------
      // You should use domain probe pattern here 
      // See internal code (ICamundaClientInstrumentation), but here an example:
      const tracer =  spans.tracer();
      const context = spans.context();
      const span = tracer.startSpan("HelloWorldTask.execute", { childOf: context });
      span.log({ test: true });
      // put your business logic here
      span.finish();
      return Promise.resolve(message);
  }
}
```
Vous pouvez consulter le dossier `sample` où nous fournissons un exemple (parallel.ts) en utilisant [Jaeger](https://www.jaegertracing.io/docs/latest/).

### Définissez votre configuration pour la plate-forme que vous souhaitez utiliser

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

### Définissez vos stratégies en cas d'échec ou de succès

Par défaut, nous définissons une stratégie simple de réussite ou d’échec.
Nous vous recommandons vivement de fournir la vôtre car votre application déclenche des exceptions spécifiques.
Les stratégies sont automatiquement traitées.
Si une exception se dégage de la tâche, une stratégie d'échec est invoquée, sinon c'est un succès et la stratégie de succès est invoquée.

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

## Rouler les tests

Nous utilisons Jest.

```bash
npm test
```

## Construit avec

*   [zeebe-node](https://github.com/CreditSenseAU/zeebe-client-node-js) - client nodejs pour Zeebe
*   [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js) - client nodejs pour Camunda BPM
*   [inversify](https://github.com/inversify/InversifyJS) - Injection de dépendence
*   [opentracing](https://github.com/opentracing/opentracing-javascript) - ajouter de l'instrumentation aux opérations

## Philosophie

1.  Autorisez les développeurs Javascript à écrire du code conforme aux principes SOLID.
2.  Faciliter et encourager l’adhésion aux meilleures pratiques de POO et d’IoC.
3.  Ajoutez le moins de temps système possible.

## Kubernetes

### Zeebe

À FAIRE: fournir un helm chart.
Mais en attendant, pour le développement, vous pouvez faire:
```bash
kubernetes/run
```

## Docker

### Zeebe

Dans votre terminal
```bash
docker/run
```
### Camunda BPM
```bash
docker run -d --name camunda -p 8080:8080 camunda/camunda-bpm-platform:latest
// Go: http://localhost:8080/camunda - user/password : `demo/demo`
```
[Plus de détails](https://github.com/camunda/docker-camunda-bpm-platform)

## TODO
<details>
<summary>Cliquez pour agrandir</summary>

-   Add tests
-   Improve docs
-   Make sample and confirm compatibility with DMN
-   Adding a common exception error codes between Manager clients
-   Add metrics by using prometheus lib
-   Questionning about spliting this project in 4 parts (core-camunda-message, core-camunda-engine-client-lib, core-zeebe-engine-client-lib, core-camunda-client-lib)
    - Dependencies would be 
        - core-camunda-message -> core-camunda-engine-client-lib
        - core-camunda-message -> core-zeebe-engine-client-lib
        - core-camunda-client-lib, core-zeebe-engine-client-lib or core-camunda-engine-client-lib  -> app
</details>

## Gestion des versions

Nous utilisons [SemVer](http://semver.org/) pour la gestion des versions. Pour les versions disponibles, voir les [balises sur ce référentiel](https://github.com/VilledeMontreal/workit/tags).

workit-camunda | Zeebe | Camunda BPM
-- | -- | -- 
2.2.0 | 0.20.x | 7.6 to latest
2.1.0 | 0.19.x | 7.6 to latest
2.0.1 | 0.18.x | 7.6 to latest
< 1.0.0 | <= 0.17.0 | 7.6 to latest

## Mainteneurs

Voir aussi la liste des [contributeurs](CONTRIBUTORS.md) ayant participé à ce projet.

## Contribuer

Veuillez lire [CONTRIBUTING.md](CONTRIBUTING_FR.md) pour plus de détails sur notre code de conduite et sur le processus de soumission des demandes.

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails

## Remerciements

*   [Josh Wulf](https://github.com/jwulf) - zeebe-node m'a inspiré pendant le développement de `workit-cli`
