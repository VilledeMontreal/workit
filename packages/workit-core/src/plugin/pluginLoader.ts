/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

/* eslint @typescript-eslint/no-unsafe-assignment: 0 */
/* eslint @typescript-eslint/no-unsafe-call: 0 */
/* eslint @typescript-eslint/no-unsafe-member-access: 0 */
/* eslint @typescript-eslint/no-var-requires: 0 */
/* eslint @typescript-eslint/no-unsafe-return: 0 */
/* eslint @typescript-eslint/explicit-member-accessibility: 0 */
/* eslint @typescript-eslint/restrict-template-expressions: 0 */
/* eslint import/no-dynamic-require: 0 */
/* eslint global-require: 0 */
/* eslint no-restricted-syntax: 0 */

import { HookState, IIoC, ILogger, IPlugin, IPlugins } from '@villedemontreal/workit-types';

/**
 * Returns the Plugins object that meet the below conditions.
 * Valid criteria: 1. It should be enabled. 2. Should have non-empty path.
 */
function filterPlugins(plugins: IPlugins): IPlugins {
  const keys = Object.keys(plugins);
  return keys.reduce((acc: IPlugins, key: string) => {
    if (plugins[key].enabled && plugins[key].path) acc[key] = plugins[key];
    return acc;
  }, {});
}

/**
 * The PluginLoader class can load instrumentation plugins that use a patch
 * mechanism to enable automatic tracing for specific target modules.
 */
export class PluginLoader {
  /** A list of loaded plugins. */
  private _plugins: IPlugin[] = [];

  /**
   * A field that tracks whether the plugin has been loaded
   * for the first time, as well as whether the plugin is activated or not.
   */
  private _hookState = HookState.UNINITIALIZED;

  /** Constructs a new PluginLoader instance. */
  constructor(
    readonly ioc: IIoC,
    readonly logger: ILogger,
  ) {}

  /**
   * Loads a list of plugins. Each plugin module should implement the core
   * {@link Plugin} interface and export an instance named as 'plugin'.
   * @param Plugins an object whose keys are plugin names and whose
   *     {@link PluginConfig} values indicate several configuration options.
   */
  load(plugins: IPlugins): void {
    if (this._hookState === HookState.UNINITIALIZED) {
      const pluginsToLoad = filterPlugins(plugins);
      const modulesToHook = Object.keys(pluginsToLoad);

      if (modulesToHook.length === 0) {
        this._hookState = HookState.UNLOADED;
        return;
      }

      const alreadyRequiredModules = Object.keys(require.cache);
      const requiredModulesToHook = modulesToHook.filter(
        (name) =>
          alreadyRequiredModules.find((cached) => {
            try {
              return require.resolve(name) === cached;
            } catch (err) {
              return false;
            }
          }) !== undefined,
      );

      if (requiredModulesToHook.length > 0) {
        this.logger.info(
          `Some modules (${requiredModulesToHook.join(
            ', ',
          )}) were already required when their respective plugin was loaded, some plugins might not work. Make sure Workit is setup before you require in other modules.`,
        );
      }

      modulesToHook.forEach((name) => {
        const config = pluginsToLoad[name];
        const modulePath = config.path!;
        const version = null;

        this.logger.info(`PluginLoader#load: trying loading ${name}@${version}`);
        this.logger.debug(`PluginLoader#load: applying binding to ${name}@${version} using ${modulePath} module`);

        // Expecting a plugin from module;
        try {
          const { plugin } = require(modulePath);

          if (plugin.moduleName !== name) {
            this.logger.error(`PluginLoader#load: Entry ${name} use a plugin that instruments ${plugin.moduleName}`);
            return exports;
          }

          this._plugins.push(plugin as IPlugin);
          // Enable each supported plugin.
          return plugin.enable(this.ioc, this.logger, config);
        } catch (e) {
          this.logger.error(
            `PluginLoader#load: could not load plugin ${modulePath} of module ${name}. Error: ${(e as Error).message}`,
          );
          return exports;
        }
      });
      this._hookState = HookState.LOADED;
    } else if (this._hookState === HookState.UNLOADED) {
      this.logger.error('PluginLoader#load: Currently cannot re-enable plugin loader.');
    } else {
      this.logger.error('PluginLoader#load: Plugin loader already enabled.');
    }
  }

  /** Unloads plugins. */
  unload(): void {
    if (this._hookState === HookState.LOADED) {
      for (const plugin of this._plugins) {
        plugin.disable();
      }
      this._plugins = [];
      this._hookState = HookState.UNLOADED;
    }
  }
}

/**
 * Adds a search path for plugin modules. Intended for testing purposes only.
 * @param searchPath The path to add.
 */
export function searchPathForTest(searchPath: string) {
  module.paths.push(searchPath);
}
