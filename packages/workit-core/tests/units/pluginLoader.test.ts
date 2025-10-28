/*
 * Copyright (c) 2020 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { HookState, IIoC, ILogger, IPlugin, IPlugins } from '@villedemontreal/workit-types';
import * as path from 'path';
import { Container } from 'inversify';
import { IoC } from '../../src/config/container';
import { IOC } from '../../src/IoC';
import { PluginLoader, searchPathForTest } from '../../src/plugin/pluginLoader';

const INSTALLED_PLUGINS_PATH = path.join(__dirname, 'node_modules');
console.log(INSTALLED_PLUGINS_PATH);
const simplePlugins: IPlugins = {
  'simple-module': {
    enabled: true,
    path: `${INSTALLED_PLUGINS_PATH}/@villemontreal/plugin-simple-module`,
  },
};

const disablePlugins: IPlugins = {
  'simple-module': {
    enabled: false,
    path: `${INSTALLED_PLUGINS_PATH}/@villemontreal/plugin-simple-module`,
  },
  nonexistent: {
    enabled: false,
    path: `${INSTALLED_PLUGINS_PATH}/@villemontreal/plugin-nonexistent-module`,
  },
};

const nonexistentPlugins: IPlugins = {
  nonexistent: {
    enabled: true,
    path: `${INSTALLED_PLUGINS_PATH}/@villemontreal/plugin-nonexistent-module`,
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
    log: () => {},
    warn: () => {},
    error: () => {},
    info: () => {},
    debug: () => {},
  };

  beforeAll(() => {
    module.paths.push(INSTALLED_PLUGINS_PATH);
    searchPathForTest(INSTALLED_PLUGINS_PATH);
  });

  afterEach(() => {
    // Clear IoC container bindings for the test service
    try {
      // Unbind all by trying to unbind until no more bindings exist
      const container = IoC.getContainer();
      while (container.isBound('test')) {
        container.unbindSync('test');
      }
    } catch (error) {
      // Ignore errors during cleanup - no more bindings to unbind
    }

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
      // Create a fresh IoC instance for this test to avoid conflicts
      const freshContainer = new Container();
      const freshIoC = new IOC(freshContainer);

      const pluginLoader = new PluginLoader(freshIoC, logger);
      expect(pluginLoader['_plugins'].length).toBe(0);
      pluginLoader.load(simplePlugins);
      expect(pluginLoader['_plugins'].length).toBe(1);
      expect(freshIoC.isServiceBound('test', 'simple-process')).toBeTruthy();
      expect(freshIoC.getTask('test', { bpmnProcessId: 'simple-process' })).toBeTruthy();
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

  // Enhanced tests with proper mocking
  describe('Enhanced Plugin Loading Tests', () => {
    let mockLogger: ILogger;
    let mockIoC: IIoC;
    let enhancedPluginLoader: PluginLoader;

    beforeEach(() => {
      jest.clearAllMocks();

      mockLogger = {
        debug: jest.fn(),
        info: jest.fn(),
        warn: jest.fn(),
        error: jest.fn(),
      };

      mockIoC = {
        bindToObject: jest.fn(),
        bind: jest.fn(),
        bindTo: jest.fn(),
        unbind: jest.fn().mockReturnValue(true),
        get: jest.fn(),
        getTask: jest.fn(),
        bindTask: jest.fn(),
        isServiceBound: jest.fn().mockReturnValue(false),
        getWorkflowNamed: jest.fn(),
        getContainer: jest.fn(),
      } as any;

      enhancedPluginLoader = new PluginLoader(mockIoC, mockLogger);
    });

    describe('constructor', () => {
      it('should initialize with IoC container and logger', () => {
        expect(enhancedPluginLoader).toBeInstanceOf(PluginLoader);
        expect((enhancedPluginLoader as any).ioc).toBe(mockIoC);
        expect((enhancedPluginLoader as any).logger).toBe(mockLogger);
        expect((enhancedPluginLoader as any)._plugins).toEqual([]);
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNINITIALIZED);
      });
    });

    describe('load - enhanced scenarios', () => {
      describe('empty and disabled plugins', () => {
        it('should handle empty plugins object', () => {
          enhancedPluginLoader.load({});

          expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNLOADED);
          expect((enhancedPluginLoader as any)._plugins).toHaveLength(0);
        });

        it('should filter out disabled plugins', () => {
          const plugins: IPlugins = {
            'disabled-plugin': {
              enabled: false,
              path: '/path/to/disabled',
            },
            'another-disabled': {
              enabled: false,
              path: '/path/to/another',
            },
          };

          enhancedPluginLoader.load(plugins);

          expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNLOADED);
          expect((enhancedPluginLoader as any)._plugins).toHaveLength(0);
        });

        it('should filter out plugins with empty paths', () => {
          const plugins: IPlugins = {
            'no-path-plugin': {
              enabled: true,
              path: '',
            },
            'undefined-path-plugin': {
              enabled: true,
              path: undefined as any,
            },
          };

          enhancedPluginLoader.load(plugins);

          expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNLOADED);
          expect((enhancedPluginLoader as any)._plugins).toHaveLength(0);
        });
      });

      describe('plugin loading attempts', () => {
        it('should attempt to load valid plugin configurations', () => {
          const plugins: IPlugins = {
            'test-module': {
              enabled: true,
              path: '/path/to/test-module',
            },
          };

          enhancedPluginLoader.load(plugins);

          expect((enhancedPluginLoader as any)._hookState).toBe(HookState.LOADED);
          expect(mockLogger.info).toHaveBeenCalledWith('PluginLoader#load: trying loading test-module@null');
        });

        it('should handle multiple plugin configurations', () => {
          const plugins: IPlugins = {
            'module-1': {
              enabled: true,
              path: '/path/to/module-1',
            },
            'module-2': {
              enabled: true,
              path: '/path/to/module-2',
            },
          };

          enhancedPluginLoader.load(plugins);

          expect((enhancedPluginLoader as any)._hookState).toBe(HookState.LOADED);
          expect(mockLogger.info).toHaveBeenCalledWith('PluginLoader#load: trying loading module-1@null');
          expect(mockLogger.info).toHaveBeenCalledWith('PluginLoader#load: trying loading module-2@null');
        });
      });

      describe('hook state management', () => {
        it('should prevent loading when already loaded', () => {
          (enhancedPluginLoader as any)._hookState = HookState.LOADED;

          const plugins: IPlugins = {
            'test-module': {
              enabled: true,
              path: '/path/to/test',
            },
          };

          enhancedPluginLoader.load(plugins);

          expect(mockLogger.error).toHaveBeenCalledWith('PluginLoader#load: Plugin loader already enabled.');
        });

        it('should prevent re-enabling when unloaded', () => {
          (enhancedPluginLoader as any)._hookState = HookState.UNLOADED;

          const plugins: IPlugins = {
            'test-module': {
              enabled: true,
              path: '/path/to/test',
            },
          };

          enhancedPluginLoader.load(plugins);

          expect(mockLogger.error).toHaveBeenCalledWith('PluginLoader#load: Currently cannot re-enable plugin loader.');
        });
      });
    });

    describe('unload - enhanced scenarios', () => {
      it('should unload plugins when loaded', () => {
        const mockPlugin: IPlugin = {
          moduleName: 'test-module',
          enable: jest.fn(),
          disable: jest.fn(),
        };

        (enhancedPluginLoader as any)._plugins = [mockPlugin];
        (enhancedPluginLoader as any)._hookState = HookState.LOADED;

        enhancedPluginLoader.unload();

        expect(mockPlugin.disable).toHaveBeenCalled();
        expect((enhancedPluginLoader as any)._plugins).toHaveLength(0);
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNLOADED);
      });

      it('should do nothing when not loaded', () => {
        const mockPlugin: IPlugin = {
          moduleName: 'test-module',
          enable: jest.fn(),
          disable: jest.fn(),
        };

        (enhancedPluginLoader as any)._plugins = [mockPlugin];
        (enhancedPluginLoader as any)._hookState = HookState.UNINITIALIZED;

        enhancedPluginLoader.unload();

        expect(mockPlugin.disable).not.toHaveBeenCalled();
        expect((enhancedPluginLoader as any)._plugins).toContain(mockPlugin);
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNINITIALIZED);
      });

      it('should propagate plugin disable errors', () => {
        const mockPlugin: IPlugin = {
          moduleName: 'test-module',
          enable: jest.fn(),
          disable: jest.fn().mockImplementation(() => {
            throw new Error('Disable failed');
          }),
        };

        (enhancedPluginLoader as any)._plugins = [mockPlugin];
        (enhancedPluginLoader as any)._hookState = HookState.LOADED;

        expect(() => enhancedPluginLoader.unload()).toThrow('Disable failed');
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.LOADED);
      });
    });

    describe('error handling scenarios', () => {
      it('should handle loading with invalid plugin paths', () => {
        const plugins: IPlugins = {
          'nonexistent-module': {
            enabled: true,
            path: '/path/to/nonexistent',
          },
        };

        enhancedPluginLoader.load(plugins);

        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.LOADED);
        expect(mockLogger.info).toHaveBeenCalledWith('PluginLoader#load: trying loading nonexistent-module@null');
        expect(mockLogger.error).toHaveBeenCalledWith(
          expect.stringContaining(
            'PluginLoader#load: could not load plugin /path/to/nonexistent of module nonexistent-module',
          ),
        );
      });

      it('should handle plugin configurations with mixed valid and invalid entries', () => {
        const plugins: IPlugins = {
          'valid-plugin': {
            enabled: true,
            path: '/valid/path',
          },
          'disabled-plugin': {
            enabled: false,
            path: '/some/path',
          },
          'invalid-path': {
            enabled: true,
            path: '',
          },
          'another-valid': {
            enabled: true,
            path: '/another/path',
          },
        };

        enhancedPluginLoader.load(plugins);

        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.LOADED);
        expect(mockLogger.info).toHaveBeenCalledWith('PluginLoader#load: trying loading valid-plugin@null');
        expect(mockLogger.info).toHaveBeenCalledWith('PluginLoader#load: trying loading another-valid@null');
        expect(mockLogger.info).not.toHaveBeenCalledWith(expect.stringContaining('disabled-plugin'));
        expect(mockLogger.info).not.toHaveBeenCalledWith(expect.stringContaining('invalid-path'));
      });
    });

    describe('lifecycle management', () => {
      it('should manage complete plugin lifecycle states', () => {
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNINITIALIZED);

        const plugins: IPlugins = {
          'test-plugin': {
            enabled: true,
            path: '/test/path',
          },
        };

        enhancedPluginLoader.load(plugins);
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.LOADED);

        enhancedPluginLoader.load(plugins);
        expect(mockLogger.error).toHaveBeenCalledWith('PluginLoader#load: Plugin loader already enabled.');

        const mockPlugin: IPlugin = {
          moduleName: 'test-plugin',
          enable: jest.fn(),
          disable: jest.fn(),
        };
        (enhancedPluginLoader as any)._plugins = [mockPlugin];

        enhancedPluginLoader.unload();
        expect((enhancedPluginLoader as any)._hookState).toBe(HookState.UNLOADED);
        expect((enhancedPluginLoader as any)._plugins).toHaveLength(0);

        enhancedPluginLoader.load(plugins);
        expect(mockLogger.error).toHaveBeenCalledWith('PluginLoader#load: Currently cannot re-enable plugin loader.');
      });
    });

    describe('searchPathForTest utility', () => {
      it('should be callable without errors', () => {
        const testPath = '/test/search/path';
        expect(() => searchPathForTest(testPath)).not.toThrow();
      });
    });
  });
});
