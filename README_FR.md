# WorkIt

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE) [![lerna](https://img.shields.io/badge/maintained%20with-lerna-cc00ff.svg)](https://lerna.js.org/) ![npm](https://img.shields.io/npm/v/@villedemontreal/workit-types)

✨ Worker extensible pour Node.js fonctionnant avec les plates-formes AWS Step function et Camunda BPM optimisées par TypeScript ✨

## Motivation

Nous avions besoin d'un framework pour nous aider à développer rapidement des Workers. Ces derniers sont utilisés pour exécuter des tâches.

Ce framework offre les avantages suivants:
-   Expérimenter et choisir la plate-forme Camunda, AWS Step function ou d'autres sans réécrire la logique métier.
-   Au lieu de dépendre directement d'un client Camunda, ce projet fournit une couche d'abstraction. De cette façon, il est plus facile de changer de client ou de créer le vôtre.
-   Vous voulez avoir une standardisation des workers.
-   L'uniformisation. En effet, vous pouvez utiliser plusieurs plates-formes en fonction des besoins du projet.
-   Ajout de fonctionnalités comme l'automatisation des traces (incluant la propagation).
-   Ce Framework impose la parité des fonctionnalités entre AWS Step function et Camunda BPM via les bibliothèques clientes. Certaines fonctionnalités exposées à la plate-forme Camunda BPM ne sont pas présentes dans ce package car nous ne pourrions pas les fournir si nous passons à AWS Step function. Cette limitation est destinée à guider les développeurs dans la préparation de la migration.

## Démarrage rapide

[Commencez en 2 minutes](getting-started/README.md).

## Documentation

-   [La documentation est disponible dans ce dossier](packages/workit/.docs/)
-   Une documentation complète sur l'API est disponible [en ligne](https://villedemontreal.github.io/workit/) et dans le sous répertoire `docs`

## Librairies

### API

| Librairie               | Description |
| ----------------------- | -----------------|
| [workit-types](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-types) | Cette librairie fournit les interfaces / enums TypeScript pour les classes de Workit|
| [workit-core](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-core) | Cette librairie fournit les implémentations par défaut de la librairie "Workit types" |

### Implémentation / Clients

| Librairie               | Description |
| ----------------------- | -----------------|
| [workit-bpm-client](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-bpm-client) | Ce module fournit un contrôle complet pour intéragir avec la plateforme Camunda Bpm.<br> Il utilise [`camunda-external-task-client-js`](https://github.com/camunda/camunda-external-task-client-js) par défaut. |
| [workit-stepfunction-client](https://github.com/VilledeMontreal/workit/tree/master/packages/workit-stepfunction-client) | Ce module fournit un contrôle complet pour intéragir avec la plateforme Step functions.<br> Par défaut, il utilise `@aws-sdk/client-sqs`, `@aws-sdk/client-sfn`. |
## L'installation

```bash
npm i @villedemontreal/workit
```
ou utiliser le générateur en dessous

## Comment utiliser

Basculer entre les plateformes est simple, il suffit de spécifier un `TAG` pour l'IoC.

### Rouler le worker

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);

worker.start();
worker.run();
```

### Déployer un workflow

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
const fullpath = `${process.cwd()}/sample/BPMN_DEMO.bpmn`;
await manager.deployWorkflow(fullpath);
```

### Obtenir les flux de travail

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.getWorkflows()
```

### Obtenir un flux de travail

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.getWorkflow({ bpmnProcessId: "DEMO" });
```

### Créer une instance de flux de travail

```javascript
const manager = IoC.get<IWorkflowClient>(CORE_IDENTIFIER.client_manager, TAG.camundaBpm);
await manager.createWorkflowInstance({
    bpmnProcessId: "MY_BPMN_KEY",
    variables: {
        hello: "world"
    }
});
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

### Cycle de vie et événements des Workers

```javascript
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm); 
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

### Open-telemetry
Par défaut, nous lions un `NoopTracer` mais vous pouvez en fournir un et il doit étandre [Tracer](https://github.com/open-telemetry/opentelemetry-js/blob/master/packages/opentelemetry-api/src/trace/tracer.ts#L29). Nous vous recommandons fortement d'utiliser ce type de pattern dans vos tâches : [le pattern "Domain Probe"](https://martinfowler.com/articles/domain-oriented-observability.html#DomainProbesEnableCleanerMore-focusedTests). Mais voici un exemple :

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
Vous pouvez consulter le dossier `sample` où nous fournissons un exemple (parallel.ts) en utilisant [Jaeger](https://www.jaegertracing.io/docs/latest/).

[Voir le tutoriel relié aux traces](packages/workit/.docs/WORKER.md#add-traces-to-your-worker-with-opentelemetry)

### Définissez votre configuration pour la plate-forme que vous souhaitez utiliser

TODO: show for step function

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

## Rouler les tests

Nous utilisons Jest.

```bash
npm test
```

## Construit avec

*   [camunda-external-task-client-js](https://github.com/camunda/camunda-external-task-client-js) - client nodejs pour Camunda BPM
*   [@aws-sdk/client-sqs](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sqs/) - client nodejs pour recevoir les messages de la file d'attente
*   [@aws-sdk/client-sfn](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/client/sfn/) - client nodejs pour gérer l'état des processus
*   [inversify](https://github.com/inversify/InversifyJS) - injection de dépendance
*   [opentelemetry](https://opentelemetry.io/) - ajouter de l'instrumentation aux opérations

## Philosophie

1.  Autorisez les développeurs Javascript à écrire du code conforme aux principes SOLID.
2.  Faciliter et encourager l’adhésion aux meilleures pratiques de POO et d’IoC.
3.  Ajoutez le moins de temps système possible.

## Docker

### Camunda BPM
```bash
docker run -d --name camunda -p 8080:8080 camunda/camunda-bpm-platform:latest
// Go: http://localhost:8080/camunda - user/password : `demo/demo`
```
[Plus de détails](https://github.com/camunda/docker-camunda-bpm-platform)


## Gestion des versions

Nous utilisons [SemVer](http://semver.org/) pour la gestion des versions. Pour les versions disponibles, voir les [balises sur ce référentiel](https://github.com/VilledeMontreal/workit/tags).

workit | AWS Step function | Camunda BPM
-- | -- | -- 
\>=6.0.0 | tous | 7.6 to latest


## Mainteneurs

Voir aussi la liste des [contributeurs](CONTRIBUTORS.md) ayant participé à ce projet.

## Contribuer

Veuillez lire [CONTRIBUTING.md](CONTRIBUTING_FR.md) pour plus de détails sur notre code de conduite et sur le processus de soumission des demandes.

## Licence

Ce projet est sous licence MIT - voir le fichier [LICENSE](LICENSE) pour plus de détails
