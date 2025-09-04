/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { MetricsPlugin, IMetricsService, IMetricsPluginConfig } from '../src/plugins/metrics-plugin';
import { IIoC, ILogger } from '@villedemontreal/workit-types';

describe('MetricsPlugin', () => {
  let plugin: MetricsPlugin;
  let mockIoC: jest.Mocked<IIoC>;
  let mockLogger: jest.Mocked<ILogger>;
  let config: IMetricsPluginConfig;

  beforeEach(() => {
    mockIoC = {
      bindToObject: jest.fn(),
      bind: jest.fn(),
      get: jest.fn(),
      getTask: jest.fn(),
      bindTask: jest.fn()
    } as any;

    mockLogger = {
      info: jest.fn(),
      warn: jest.fn(),
      error: jest.fn(),
      debug: jest.fn()
    } as any;

    config = {
      enabled: true,
      logInterval: 1000,
      httpEndpoint: {
        enabled: false,
        port: 3001,
        path: '/metrics'
      },
      persistence: {
        enabled: false,
        file: './test-metrics.json'
      }
    } as IMetricsPluginConfig;

    plugin = new MetricsPlugin();
  });

  afterEach(() => {
    if (plugin) {
      plugin.disable();
    }
  });

  describe('enable', () => {
    it('should bind metrics service to IoC container', () => {
      plugin.enable(mockIoC, mockLogger, config);

      expect(mockIoC.bindToObject).toHaveBeenCalledWith(
        expect.any(Object),
        'metricsService'
      );
      expect(mockLogger.info).toHaveBeenCalledWith('Metrics plugin enabled');
    });

    it('should create metrics service with default configuration', () => {
      plugin.enable(mockIoC, mockLogger);

      expect(mockIoC.bindToObject).toHaveBeenCalled();
      expect(mockLogger.info).toHaveBeenCalledWith('Metrics plugin enabled');
    });
  });

  describe('disable', () => {
    it('should attempt to unbind metrics service from IoC container', () => {
      // Add unbind method to mock since it's called with try/catch
      (mockIoC as any).unbind = jest.fn();
      
      plugin.enable(mockIoC, mockLogger, config);
      plugin.disable();

      expect((mockIoC as any).unbind).toHaveBeenCalledWith('metricsService');
      expect(mockLogger.info).toHaveBeenCalledWith('Metrics plugin disabled');
    });
  });

  describe('MetricsService integration', () => {
    let metricsService: IMetricsService;

    beforeEach(() => {
      plugin.enable(mockIoC, mockLogger, config);
      // Récupérer l'instance du service depuis les appels mock
      const bindCall = mockIoC.bindToObject.mock.calls.find((call: any[]) => call[1] === 'metricsService');
      metricsService = bindCall![0] as IMetricsService;
    });

    describe('increment', () => {
      it('should increment counter', () => {
        metricsService.increment('test.counter');
        expect(metricsService.getMetric('test.counter')).toBe(1);

        metricsService.increment('test.counter', 5);
        expect(metricsService.getMetric('test.counter')).toBe(6);
      });
    });

    describe('recordDuration', () => {
      it('should record duration statistics', () => {
        metricsService.recordDuration('test.duration', 100);
        metricsService.recordDuration('test.duration', 200);

        const stats = metricsService.getDurationStats('test.duration');
        expect(stats).toEqual({
          count: 2,
          total: 300,
          average: 150
        });
      });

      it('should update metrics with duration data', () => {
        metricsService.recordDuration('test.duration', 100);

        expect(metricsService.getMetric('test.duration.total')).toBe(100);
        expect(metricsService.getMetric('test.duration.count')).toBe(1);
        expect(metricsService.getMetric('test.duration.average')).toBe(100);
      });
    });

    describe('getAllMetrics', () => {
      it('should return all metrics', () => {
        metricsService.increment('metric1', 5);
        metricsService.increment('metric2', 10);

        const metrics = metricsService.getAllMetrics();
        expect(metrics).toEqual({
          metric1: 5,
          metric2: 10,
          'plugin.metrics.started': 1
        });
      });
    });

    describe('reset', () => {
      it('should reset specific metric', () => {
        metricsService.increment('test.counter', 5);
        metricsService.recordDuration('test.duration', 100);

        metricsService.reset('test.counter');

        expect(metricsService.getMetric('test.counter')).toBeUndefined();
        expect(metricsService.getDurationStats('test.duration')).toBeDefined();
      });
    });

    describe('resetAll', () => {
      it('should reset all metrics', () => {
        metricsService.increment('metric1', 5);
        metricsService.recordDuration('duration1', 100);

        metricsService.resetAll();

        const metrics = metricsService.getAllMetrics();
        expect(metrics).toEqual({});
        expect(metricsService.getDurationStats('duration1')).toBeUndefined();
      });
    });
  });
});