/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { HookState, IPlugins } from '@villedemontreal/workit-types';
import * as path from 'path';
import { IoC } from '../../src/config/container';
import { PluginLoader, searchPathForTest } from '../../src/plugin/pluginLoader';

const INSTALLED_PLUGINS_PATH = path.join(__dirname, 'node_modules');

const simplePlugins: IPlugins = {
  'simple-module': {
    enabled: true,
    path: `${ INSTALLED_PLUGINS_PATH }/@villemontreal/plugin-simple-module`,
  },
};

const disablePlugins: IPlugins = {
  'simple-module': {
    enabled: false,
    path: `${ INSTALLED_PLUGINS_PATH }/@villemontreal/plugin-simple-module`,
  },
  nonexistent: {
    enabled: false,
    path: `${ INSTALLED_PLUGINS_PATH }/@villemontreal/plugin-nonexistent-module`,
  },
};

const nonexistentPlugins: IPlugins = {
  nonexistent: {
    enabled: true,
    path: `${ INSTALLED_PLUGINS_PATH }/@villemontreal/plugin-nonexistent-module`,
  },
};

const missingPathPlugins: IPlugins = {
  'simple-module': {
    enabled: true,
  },
  nonexistent: {
    enabled: true,
  },
};

describe('PluginLoader', () => {
  const logger = {
    log: () => { },
    warn: () => { },
    error: () => { },
    info: () => { },
    debug: () => { },
  };

  beforeAll(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
    searchPathForTest(INSTALLED_PLUGINS_PATH);
  });

  afterEach(() => {
    // clear require cache
    Object.keys(require.cache).forEach((key) => delete require.cache[key]);
  });

  describe('.state()', () => {
    it('returns UNINITIALIZED when first called', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      expect(pluginLoader['_hookState']).toBe(HookState.UNINITIALIZED);
    });

    it('transitions from UNINITIALIZED to LOADED', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      pluginLoader.load(simplePlugins);
      expect(pluginLoader['_hookState']).toBe(HookState.LOADED);
      pluginLoader.unload();
    });

    it('transitions from LOADED to UNLOADED', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      pluginLoader.load(simplePlugins);
      pluginLoader.unload();
      expect(pluginLoader['_hookState']).toBe(HookState.UNLOADED);
    });
  });
  describe('.load()', () => {
    it('sanity check', () => {
      // Ensure that module fixtures contain values that we expect.
      const { moduleName, packageName } = require('@villemontreal/plugin-simple-module').plugin;

      expect(moduleName).toBe('simple-module');
      expect(packageName).toBe('@villemontreal/plugin-simple-module');
      expect(IoC.isServiceBound('test')).toBeFalsy();
      expect(() => require('nonexistent-module')).toThrow();
    });

    it('should load a plugin and bind the target', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.load(simplePlugins);
      expect(pluginLoader['_plugins'].length).toBe(1);
      expect(IoC.isServiceBound('test')).toBeTruthy();
      pluginLoader.unload();
    });

    it('should not load a plugin when value is true but path is missing', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.load(missingPathPlugins);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.unload();
    });

    it('should not load a non existing plugin', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.load(nonexistentPlugins);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.unload();
    });

    it('should not load a plugin when value is false', () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.load(disablePlugins);
      expect(pluginLoader['_plugins'].length).toBe(0);
      expect(IoC.isServiceBound('test')).toBeFalsy();
      pluginLoader.unload();
    });

    it(`doesn't patch modules for which plugins aren't specified`, () => {
      const pluginLoader = new PluginLoader(IoC, logger);
      pluginLoader.load({});
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.unload();
    });
  });

  describe('.unload()', () => {
    it('should unload a plugin and unbind the target', () => {
      const pluginLoader = new PluginLoader(IoC, logger);

      pluginLoader.load(simplePlugins);
      pluginLoader.unload();

      expect(IoC.isServiceBound('test')).toBeFalsy();
    });
  });
});
