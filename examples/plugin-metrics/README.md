# Exemple Plugin Metrics - WorkIt Framework

Cet exemple démontre comment créer et utiliser un plugin personnalisé pour collecter des métriques d'exécution dans WorkIt.

## 📋 Description

Le plugin metrics collecte automatiquement :
- Nombre d'exécutions de tâches
- Durée d'exécution des tâches
- Nombre de succès/échecs
- Métriques personnalisées

## 🚀 Démarrage rapide

### Installation

```bash
# Installer les dépendances
npm install

# Construire l'exemple
npm run build
```

### Exécution avec Camunda BPM

```bash
# Démarrer le worker avec plugin metrics
npm run start:camunda

# Dans un autre terminal, créer des instances de processus
npm run create-instances:camunda
```

### Exécution avec AWS Step Functions

```bash
# Configurer les credentials AWS
export AWS_ACCESS_KEY_ID=your_access_key
export AWS_SECRET_ACCESS_KEY=your_secret_key
export AWS_REGION=us-east-1

# Déployer le workflow (optionnel)
npm run deploy:stepfunction

# Démarrer le worker avec plugin metrics
npm run start:stepfunction

# Dans un autre terminal, créer des instances
npm run create-instances:stepfunction
```

## 📁 Structure du projet

```
plugin-metrics/
├── README.md
├── package.json
├── tsconfig.json
├── src/
│   ├── worker.ts              # Configuration et démarrage du worker
│   ├── create-instances.ts    # Script pour créer des instances de workflow
│   ├── deploy.ts             # Script de déploiement des workflows
│   └── plugins/
│       └── metrics-plugin.ts  # Implémentation du plugin metrics
├── tasks/
│   ├── calculateTask.ts      # Tâche de calcul avec métriques
│   └── processDataTask.ts    # Tâche de traitement avec métriques
└── workflow/
    ├── camunda/
    │   └── METRICS_DEMO.bpmn  # Workflow Camunda
    └── stepfunctions/
        └── METRICS_DEMO.json  # Workflow Step Functions
```

## 🔧 Le Plugin Metrics

### Fonctionnalités

Le plugin collecte automatiquement :

1. **Métriques d'exécution**
   - `task.{taskName}.executed` - Nombre d'exécutions
   - `task.{taskName}.duration` - Durée moyenne d'exécution
   - `task.{taskName}.success` - Nombre de succès
   - `task.{taskName}.failure` - Nombre d'échecs

2. **Métriques système**
   - `worker.started` - Démarrages du worker
   - `worker.tasks.total` - Total des tâches traitées

3. **API d'accès aux métriques**
   - `getMetric(name)` - Récupérer une métrique
   - `getAllMetrics()` - Récupérer toutes les métriques
   - `increment(name)` - Incrémenter un compteur
   - `recordDuration(name, duration)` - Enregistrer une durée

### Utilisation dans les tâches

```typescript
import { IoC } from '../config/container';

@injectable()
export class CalculateTask implements IActivityHandler<IMessage, IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    const startTime = Date.now();
    
    try {
      // Votre logique métier
      const result = await this.performCalculation(message.body);
      
      // Enregistrer le succès
      const metrics = IoC.get('metricsService');
      metrics.increment('task.calculate.success');
      metrics.recordDuration('task.calculate.duration', Date.now() - startTime);
      
      return { body: result };
    } catch (error) {
      // Enregistrer l'échec
      const metrics = IoC.get('metricsService');
      metrics.increment('task.calculate.failure');
      
      throw error;
    }
  }
}
```

## 📊 Monitoring des métriques

### Endpoint HTTP (optionnel)

Le plugin expose optionnellement un endpoint HTTP pour consulter les métriques :

```bash
# Récupérer toutes les métriques
curl http://localhost:3001/metrics

# Récupérer une métrique spécifique
curl http://localhost:3001/metrics/task.calculate.executed
```

### Logs

Les métriques sont également loggées périodiquement :

```
[METRICS] task.calculate.executed: 15
[METRICS] task.calculate.success: 14
[METRICS] task.calculate.failure: 1
[METRICS] task.calculate.duration: 245ms (average)
```

## ⚙️ Configuration

Le plugin peut être configuré via la configuration WorkIt :

```typescript
const plugins: IPlugins = {
  'metrics': {
    enabled: true,
    path: './lib/plugins/metrics-plugin',
    // Configuration du plugin
    logInterval: 30000,          // Log des métriques toutes les 30s
    httpEndpoint: {
      enabled: true,
      port: 3001,
      path: '/metrics'
    },
    persistence: {
      enabled: false,
      file: './metrics.json'
    }
  }
};
```

## 🧪 Tests

```bash
# Exécuter les tests
npm test

# Tests avec couverture
npm run test:coverage
```

## 📖 Intégration

Pour utiliser ce plugin dans votre propre projet :

1. **Copier le plugin**
```bash
cp src/plugins/metrics-plugin.ts your-project/src/plugins/
```

2. **Configurer dans votre worker**
```typescript
import { MetricsPlugin } from './plugins/metrics-plugin';

const plugins: IPlugins = {
  'metrics': {
    enabled: true,
    path: './plugins/metrics-plugin'
  }
};
```

3. **Utiliser dans vos tâches**
```typescript
const metrics = IoC.get('metricsService');
metrics.increment('my.custom.metric');
```

## 🎯 Cas d'usage avancés

### Métriques métier personnalisées

```typescript
// Dans une tâche de traitement de commande
export class OrderProcessingTask {
  async execute(message: IMessage): Promise<IMessage> {
    const metrics = IoC.get('metricsService');
    const order = message.body;
    
    // Métriques métier
    metrics.increment('business.orders.processed');
    metrics.increment(`business.orders.${order.type}`);
    
    if (order.amount > 1000) {
      metrics.increment('business.orders.high_value');
    }
    
    return { body: { orderId: order.id, status: 'processed' } };
  }
}
```

### Intégration avec des systèmes externes

```typescript
// Configuration pour envoyer les métriques vers Prometheus/InfluxDB
const plugins: IPlugins = {
  'metrics': {
    enabled: true,
    path: './plugins/metrics-plugin',
    exporters: [
      {
        type: 'prometheus',
        endpoint: 'http://prometheus:9090/api/v1/import'
      },
      {
        type: 'influxdb',
        url: 'http://influxdb:8086',
        database: 'workit_metrics'
      }
    ]
  }
};
```

---

Pour plus d'informations sur le système de plugins, consultez la [documentation complète](../../packages/workit-core/docs/PLUGINS.md).