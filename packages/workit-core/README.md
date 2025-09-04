# WorkIt Core

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

This package provides default and no-op implementations of the WorkIt types for client packages.

```bash
npm i @villedemontreal/workit-core
```

## 🔌 Plugin System

WorkIt Core includes a powerful plugin system that allows you to extend worker functionality without modifying the core code. Plugins use dependency injection for seamless integration.

### Key Features
- **Extensible architecture** - Add custom functionality through plugins
- **Dynamic loading** - Enable/disable plugins at runtime
- **IoC integration** - Full access to the dependency injection container
- **Lifecycle management** - Automatic plugin loading/unloading
- **Configuration support** - Flexible plugin configuration

### Quick Example

```typescript
// Create a custom plugin
export class MyPlugin extends BasePlugin {
  public readonly moduleName = 'my-plugin';
  
  protected bind(): void {
    // Register your services in the IoC container
    this._ioc.bindTo(MyService, 'myService', new MyService());
  }
  
  protected unbind(): void {
    this._ioc.unbind('myService');
  }
}

// Configure and load plugins
const plugins: IPlugins = {
  'my-plugin': {
    enabled: true,
    path: './my-plugin'
  }
};

const pluginLoader = new PluginLoader(IoC, logger);
pluginLoader.load(plugins);
```

### Documentation & Examples
- **📖 [Complete Plugin Guide](docs/PLUGINS.md)** - Comprehensive documentation with API reference
- **🚀 [Metrics Plugin Example](../../../examples/plugin-metrics/)** - Full working example with metrics collection
- **🧪 [Plugin Tests](tests/units/pluginLoader.test.ts)** - Test examples and usage patterns

## Useful links
-   [Get started in 2 minutes](https://github.com/VilledeMontreal/workit/blob/master/packages/workit/.docs/WORKER.md).
-   [Documentation is available in this folder](https://github.com/VilledeMontreal/workit/tree/master/packages/workit/.docs)
-   Comprehensive API documentation is available [online](https://villedemontreal.github.io/workit/) and in the `docs` subdirectory
