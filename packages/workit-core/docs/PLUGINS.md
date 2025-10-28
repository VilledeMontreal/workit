# Plugin System - WorkIt Framework

Le système de plugins de WorkIt permet d'étendre facilement les fonctionnalités du worker sans modifier le code principal. Il utilise un mécanisme d'injection de dépendance pour charger et gérer dynamiquement les extensions.

## 📋 Table des matières

- [Architecture](#architecture)
- [Avantages](#avantages)
- [Créer un plugin personnalisé](#créer-un-plugin-personnalisé)
- [Configuration et chargement](#configuration-et-chargement)
- [API Reference](#api-reference)
- [Exemples](#exemples)
- [Bonnes pratiques](#bonnes-pratiques)

## 🏗️ Architecture

### Vue d'ensemble

Le système de plugins WorkIt repose sur trois composants principaux :

1. **BasePlugin** - Classe abstraite de base pour tous les plugins
2. **PluginLoader** - Gestionnaire de chargement et du cycle de vie des plugins
3. **IoC Container** - Container d'injection de dépendance pour l'enregistrement des services

```
┌─────────────────┐    ┌──────────────────┐    ┌─────────────────┐
│   Plugin A      │    │   Plugin B       │    │   Plugin C      │
│ (Metrics)       │    │ (Logging)        │    │ (Custom Tasks)  │
└─────────────────┘    └──────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                 ┌───────────────────────────┐
                 │    PluginLoader           │
                 │  - load()                 │
                 │  - unload()               │
                 │  - filterPlugins()        │
                 └───────────────────────────┘
                                 │
                 ┌───────────────────────────┐
                 │    IoC Container          │
                 │  - Service registration   │
                 │  - Dependency injection   │
                 └───────────────────────────┘
```

### Références dans le code

- **BasePlugin** : [`packages/workit-core/src/plugin/basePlugin.ts`](../src/plugin/basePlugin.ts)
- **PluginLoader** : [`packages/workit-core/src/plugin/pluginLoader.ts`](../src/plugin/pluginLoader.ts)
- **Interfaces** : [`packages/workit-types/src/plugin/`](../../workit-types/src/plugin/)

## 🎯 Avantages

### 1. **Extensibilité sans modification**
- Ajoutez de nouvelles fonctionnalités sans toucher au code principal
- Isolation du code métier dans des modules séparés
- Maintenance facilitée et réduction des risques

### 2. **Réutilisabilité**
- Modules réutilisables à travers différents projets
- Partage de plugins entre équipes
- Écosystème de plugins communautaires

### 3. **Chargement dynamique**
- Activation/désactivation des plugins à la volée
- Configuration flexible par environnement
- Déploiement modulaire

### 4. **Injection de dépendance**
- Intégration native avec le container IoC
- Accès aux services existants du worker
- Gestion automatique du cycle de vie

### 5. **Observabilité intégrée**
- Logging centralisé avec le système de logs du framework
- Suivi du statut des plugins (UNINITIALIZED, LOADED, UNLOADED)
- Détection des modules déjà chargés

## 🔧 Créer un plugin personnalisé

### Étape 1: Créer la classe du plugin

```typescript
// my-custom-plugin.ts
import { BasePlugin } from '@villedemontreal/workit-core';
import { IIoC, ILogger } from '@villedemontreal/workit-types';

export class MyCustomPlugin extends BasePlugin {
  public readonly moduleName = 'my-custom-module';

  constructor() {
    super('@my-company/workit-plugin-custom');
  }

  protected bind(): void {
    // Enregistrer vos services dans le container IoC
    this._ioc.bindTo(MyService, 'MyService', this.createMyService());
    
    // Log de l'activation
    this._logger.info('MyCustomPlugin activated');
  }

  protected unbind(): void {
    // Nettoyer les ressources
    this._ioc.unbind('MyService');
    this._logger.info('MyCustomPlugin deactivated');
  }

  private createMyService() {
    return new MyService(this._config, this._logger);
  }
}

// Exporter l'instance du plugin
export const plugin = new MyCustomPlugin();
```

### Étape 2: Configuration du plugin

```typescript
// Configuration dans votre worker
import { IPlugins } from '@villedemontreal/workit-types';

const plugins: IPlugins = {
  'my-custom-module': {
    enabled: true,
    path: './my-custom-plugin',
    // Configuration spécifique au plugin
    customConfig: {
      apiUrl: 'https://api.example.com',
      timeout: 5000
    }
  }
};
```

### Étape 3: Chargement du plugin

```typescript
// worker.ts
import { PluginLoader } from '@villedemontreal/workit-core';
import { IoC } from './config/container';
import { logger } from './logger';

const pluginLoader = new PluginLoader(IoC, logger);

// Charger les plugins avant de démarrer le worker
pluginLoader.load(plugins);

// Démarrer le worker
const worker = IoC.get<Worker>(CORE_IDENTIFIER.worker, TAG.camundaBpm);
worker.start();
worker.run();

// Nettoyer au moment de l'arrêt
process.on('SIGINT', async () => {
  await worker.stop();
  pluginLoader.unload();
  process.exit(0);
});
```

## ⚙️ Configuration et chargement

### Interface IPluginConfig

```typescript
export interface IPluginConfig {
  /** Active ou désactive le plugin */
  enabled?: boolean;
  /** Chemin vers le module du plugin */
  path?: string;
  /** Configuration personnalisée (optionnelle) */
  [key: string]: any;
}
```

### Mécanisme de filtrage

Le `PluginLoader` filtre automatiquement les plugins selon ces critères :
1. Le plugin doit être activé (`enabled: true`)
2. Le chemin doit être spécifié (`path` non vide)

Référence : [`pluginLoader.ts:24-30`](../src/plugin/pluginLoader.ts#L24-L30)

### Détection des modules pré-chargés

Le système détecte automatiquement les modules déjà requis et émet un avertissement si nécessaire :

```typescript
// Référence: pluginLoader.ts:68-86
const alreadyRequiredModules = Object.keys(require.cache);
const requiredModulesToHook = modulesToHook.filter(/*...*/);

if (requiredModulesToHook.length > 0) {
  this.logger.info(`Some modules were already required...`);
}
```

## 📖 API Reference

### BasePlugin

Classe abstraite de base pour tous les plugins.

**Référence** : [`basePlugin.ts`](../src/plugin/basePlugin.ts)

#### Propriétés
- `moduleName: string` - Nom du module (requis)
- `supportedVersions?: string[]` - Versions supportées (optionnel)
- `version?: string` - Version du plugin (optionnel)

#### Méthodes protégées
- `_ioc: IIoC` - Container d'injection de dépendance
- `_logger: ILogger` - Instance de logger
- `_config: IPluginConfig` - Configuration du plugin

#### Méthodes à implémenter
```typescript
protected abstract bind(): void;    // Enregistrement des services
protected abstract unbind(): void;  // Nettoyage des ressources
```

### PluginLoader

Gestionnaire du cycle de vie des plugins.

**Référence** : [`pluginLoader.ts`](../src/plugin/pluginLoader.ts)

#### Constructeur
```typescript
constructor(readonly ioc: IIoC, readonly logger: ILogger)
```

#### Méthodes publiques

##### `load(plugins: IPlugins): void`
Charge une liste de plugins selon leur configuration.

##### `unload(): void`
Décharge tous les plugins chargés et nettoie les ressources.

#### États du cycle de vie

```typescript
enum HookState {
  UNINITIALIZED, // État initial
  LOADED,        // Plugins chargés
  UNLOADED       // Plugins déchargés
}
```

## 💡 Exemples

### Plugin de métriques simples

```typescript
import { BasePlugin } from '@villedemontreal/workit-core';

export class MetricsPlugin extends BasePlugin {
  public readonly moduleName = 'metrics';
  private metrics = new Map<string, number>();

  constructor() {
    super('@my-company/workit-plugin-metrics');
  }

  protected bind(): void {
    // Enregistrer le service de métriques
    this._ioc.bindTo(Object, 'metrics', {
      increment: (name: string) => this.increment(name),
      get: (name: string) => this.get(name),
      getAll: () => this.getAll()
    });

    this._logger.info('Metrics plugin enabled');
  }

  protected unbind(): void {
    this.metrics.clear();
    this._ioc.unbind('metrics');
    this._logger.info('Metrics plugin disabled');
  }

  private increment(name: string): void {
    const current = this.metrics.get(name) || 0;
    this.metrics.set(name, current + 1);
  }

  private get(name: string): number {
    return this.metrics.get(name) || 0;
  }

  private getAll(): Record<string, number> {
    return Object.fromEntries(this.metrics);
  }
}

export const plugin = new MetricsPlugin();
```

### Utilisation dans une tâche

```typescript
// Dans votre task handler
import { IoC } from './container';

@injectable()
export class HelloWorldTask implements IActivityHandler<IMessage, IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    // Utiliser le service de métriques
    const metricsService = IoC.get('metrics');
    metricsService.increment('task.hello_world.executed');

    return {
      body: {
        hello: 'world',
        executedAt: new Date().toISOString()
      }
    };
  }
}
```

### Plugin de logging personnalisé

```typescript
import { BasePlugin } from '@villedemontreal/workit-core';

export class CustomLoggerPlugin extends BasePlugin {
  public readonly moduleName = 'custom-logger';

  constructor() {
    super('@my-company/workit-plugin-logger');
  }

  protected bind(): void {
    const customLogger = this.createCustomLogger();
    
    // Enregistrer le logger personnalisé
    this._ioc.bindTo(Object, 'customLogger', customLogger);
    
    // Override du logger par défaut (optionnel)
    this._ioc.rebind('logger').to(customLogger);
  }

  protected unbind(): void {
    this._ioc.unbind('customLogger');
  }

  private createCustomLogger() {
    return {
      info: (message: string) => console.log(`[CUSTOM-INFO] ${message}`),
      error: (message: string) => console.error(`[CUSTOM-ERROR] ${message}`),
      warn: (message: string) => console.warn(`[CUSTOM-WARN] ${message}`),
      debug: (message: string) => console.debug(`[CUSTOM-DEBUG] ${message}`)
    };
  }
}

export const plugin = new CustomLoggerPlugin();
```

## 📋 Bonnes pratiques

### 1. **Nommage et structure**
- Utilisez des noms explicites pour vos plugins
- Suivez la convention `@company/workit-plugin-name`
- Organisez le code en modules séparés

### 2. **Gestion des erreurs**
- Toujours encapsuler le code dans try/catch dans `bind()`
- Logger les erreurs de manière appropriée
- Gérer gracieusement l'échec de chargement

```typescript
protected bind(): void {
  try {
    // Initialisation du plugin
    this._ioc.bindTo(MyService, 'myService', new MyService());
    this._logger.info('Plugin loaded successfully');
  } catch (error) {
    this._logger.error(`Failed to load plugin: ${error.message}`);
    throw error;
  }
}
```

### 3. **Configuration**
- Validez toujours la configuration reçue
- Fournissez des valeurs par défaut sensées
- Documentez les options de configuration

```typescript
protected bind(): void {
  const config = this.validateConfig(this._config);
  const service = new MyService(config);
  this._ioc.bindTo(MyService, 'myService', service);
}

private validateConfig(config: IPluginConfig): MyServiceConfig {
  return {
    apiUrl: config.apiUrl || 'https://default-api.com',
    timeout: config.timeout || 5000,
    retries: config.retries || 3
  };
}
```

### 4. **Nettoyage des ressources**
- Implémentez toujours `unbind()` proprement
- Fermez les connexions, timers, et autres ressources
- Désenregistrez tous les services du container IoC

```typescript
protected unbind(): void {
  // Nettoyer les timers
  if (this.timer) {
    clearInterval(this.timer);
  }
  
  // Fermer les connexions
  if (this.connection) {
    this.connection.close();
  }
  
  // Désenregistrer les services
  this._ioc.unbind('myService');
}
```

### 5. **Tests**
- Créez des tests unitaires pour vos plugins
- Mockez les dépendances IoC et Logger
- Testez les scénarios d'erreur

```typescript
// Exemple de test
describe('MyCustomPlugin', () => {
  let plugin: MyCustomPlugin;
  let mockIoC: jest.Mocked<IIoC>;
  let mockLogger: jest.Mocked<ILogger>;

  beforeEach(() => {
    mockIoC = {
      bindTo: jest.fn(),
      unbind: jest.fn()
    } as any;
    
    mockLogger = {
      info: jest.fn(),
      error: jest.fn()
    } as any;

    plugin = new MyCustomPlugin();
    plugin.enable(mockIoC, mockLogger);
  });

  it('should register service when enabled', () => {
    expect(mockIoC.bindTo).toHaveBeenCalledWith(
      expect.anything(),
      'myService',
      expect.any(Object)
    );
  });
});
```

### 6. **Performance**
- Évitez les opérations coûteuses dans `bind()`
- Utilisez le lazy loading quand c'est possible
- Surveillez l'utilisation mémoire de vos plugins

### 7. **Documentation**
- Documentez l'API de votre plugin
- Fournissez des exemples d'utilisation
- Spécifiez les dépendances et prérequis

---

Pour des exemples complets et fonctionnels, consultez le dossier [`examples/`](../../../../examples/) et en particulier l'exemple [`plugin-metrics`](../../../../examples/plugin-metrics/).

Les tests du système de plugins sont disponibles dans [`pluginLoader.test.ts`](../tests/units/pluginLoader.test.ts).