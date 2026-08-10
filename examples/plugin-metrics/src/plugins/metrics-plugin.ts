/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { BasePlugin } from '@villedemontreal/workit-core';
import { IPluginConfig } from '@villedemontreal/workit-types';
import * as express from 'express';
import * as http from 'http';
import * as fs from 'fs/promises';
import * as path from 'path';

export interface IMetricsService {
  /** Incrémenter un compteur */
  increment(name: string, value?: number): void;

  /** Enregistrer une durée en millisecondes */
  recordDuration(name: string, duration: number): void;

  /** Récupérer une métrique */
  getMetric(name: string): number | undefined;

  /** Récupérer toutes les métriques */
  getAllMetrics(): Record<string, number>;

  /** Récupérer les statistiques de durée pour une métrique */
  getDurationStats(name: string): { count: number; total: number; average: number } | undefined;

  /** Réinitialiser une métrique */
  reset(name: string): void;

  /** Réinitialiser toutes les métriques */
  resetAll(): void;
}

export interface IMetricsPluginConfig extends IPluginConfig {
  /** Intervalle de logging des métriques (ms) */
  logInterval?: number;

  /** Configuration du endpoint HTTP */
  httpEndpoint?: {
    enabled: boolean;
    port: number;
    path: string;
  };

  /** Configuration de la persistence */
  persistence?: {
    enabled: boolean;
    file: string;
    interval?: number;
  };

  // Autoriser les propriétés supplémentaires
  [key: string]: any;
}

class MetricsService implements IMetricsService {
  private _metrics = new Map<string, number>();

  private _durations = new Map<string, { count: number; total: number }>();

  public increment(name: string, value = 1): void {
    const current = this._metrics.get(name) || 0;
    this._metrics.set(name, current + value);
  }

  public recordDuration(name: string, duration: number): void {
    const current = this._durations.get(name) || { count: 0, total: 0 };
    current.count += 1;
    current.total += duration;
    this._durations.set(name, current);

    // Aussi stocker en tant que métrique simple
    this._metrics.set(`${name}.total`, current.total);
    this._metrics.set(`${name}.count`, current.count);
    this._metrics.set(`${name}.average`, Math.round(current.total / current.count));
  }

  public getMetric(name: string): number | undefined {
    return this._metrics.get(name);
  }

  public getAllMetrics(): Record<string, number> {
    return Object.fromEntries(this._metrics);
  }

  public getDurationStats(name: string): { count: number; total: number; average: number } | undefined {
    const stats = this._durations.get(name);
    if (!stats) return undefined;

    return {
      count: stats.count,
      total: stats.total,
      average: Math.round(stats.total / stats.count),
    };
  }

  public reset(name: string): void {
    this._metrics.delete(name);
    this._durations.delete(name);
  }

  public resetAll(): void {
    this._metrics.clear();
    this._durations.clear();
  }
}

export class MetricsPlugin extends BasePlugin {
  public readonly moduleName = 'metrics';

  private _metricsService!: MetricsService;

  private _logInterval?: NodeJS.Timeout;

  private _httpServer?: http.Server;

  private _persistenceInterval?: NodeJS.Timeout;

  private _persistenceInFlight?: Promise<void>;

  private _metricsConfig!: IMetricsPluginConfig;

  constructor() {
    super('@villedemontreal/workit-plugin-metrics');
  }

  protected bind(): void {
    this._metricsConfig = this._validateConfig(this._config);
    this._metricsService = new MetricsService();

    // Enregistrer le service dans le container IoC
    this._ioc.bindToObject(this._metricsService, 'metricsService');

    this._setupLogging();
    this._setupHttpEndpoint();
    this._setupPersistence();

    // Métriques de base
    this._metricsService.increment('plugin.metrics.started');

    this._logger.info('Metrics plugin enabled');
  }

  protected unbind(): void {
    // Nettoyer les ressources
    if (this._logInterval) {
      clearInterval(this._logInterval);
    }

    if (this._persistenceInterval) {
      clearInterval(this._persistenceInterval);
    }

    if (this._httpServer) {
      this._httpServer.close();
    }

    try {
      (this._ioc as any).unbind('metricsService');
    } catch (error) {
      // Ignore if not bound
    }
    this._logger.info('Metrics plugin disabled');
  }

  private _validateConfig(config?: IPluginConfig): IMetricsPluginConfig {
    const metricsConfig = (config as IMetricsPluginConfig) || {};

    return {
      ...config,
      enabled: config?.enabled ?? true,
      logInterval: metricsConfig.logInterval || 30000, // 30 secondes par défaut
      httpEndpoint: {
        enabled: metricsConfig.httpEndpoint?.enabled || false,
        port: metricsConfig.httpEndpoint?.port || 3001,
        path: metricsConfig.httpEndpoint?.path || '/metrics',
      },
      persistence: {
        enabled: metricsConfig.persistence?.enabled || false,
        file: metricsConfig.persistence?.file || './metrics.json',
        interval: metricsConfig.persistence?.interval || 60000, // 1 minute par défaut
      },
    };
  }

  private _setupLogging(): void {
    if (this._metricsConfig.logInterval && this._metricsConfig.logInterval > 0) {
      this._logInterval = setInterval(() => {
        this._logMetrics();
      }, this._metricsConfig.logInterval);
    }
  }

  private _setupHttpEndpoint(): void {
    if (!this._metricsConfig.httpEndpoint?.enabled) return;

    const app = (express as any)();

    app.get(this._metricsConfig.httpEndpoint?.path || '/metrics', (req: express.Request, res: express.Response) => {
      const metrics = this._metricsService.getAllMetrics();
      res.json(metrics);
    });

    app.get(
      `${this._metricsConfig.httpEndpoint?.path || '/metrics'}/:name`,
      (req: express.Request, res: express.Response) => {
        const metric = this._metricsService.getMetric(req.params.name);
        if (metric !== undefined) {
          res.json({ [req.params.name]: metric });
        } else {
          res.status(404).json({ error: 'Metric not found' });
        }
      }
    );

    app.get(
      `${this._metricsConfig.httpEndpoint?.path || '/metrics'}/:name/stats`,
      (req: express.Request, res: express.Response) => {
        const stats = this._metricsService.getDurationStats(req.params.name);
        if (stats) {
          res.json(stats);
        } else {
          res.status(404).json({ error: 'Duration stats not found' });
        }
      }
    );

    this._httpServer = app.listen(this._metricsConfig.httpEndpoint?.port || 3001, () => {
      this._logger.info(
        `Metrics HTTP endpoint available at http://localhost:${this._metricsConfig.httpEndpoint?.port || 3001}${this._metricsConfig.httpEndpoint?.path || '/metrics'}`
      );
    });
  }

  private _setupPersistence(): void {
    if (!this._metricsConfig.persistence?.enabled) return;

    this._persistenceInterval = setInterval(() => {
      if (!this._persistenceInFlight) {
        this._persistenceInFlight = this._saveMetrics().finally(() => {
          this._persistenceInFlight = undefined;
        });
      }
    }, this._metricsConfig.persistence.interval || 60000);

    // Charger les métriques existantes au démarrage
    this._loadMetrics().catch(error => {
      this._logger.warn(`Could not load metrics from persistence: ${error.message}`);
    });
  }

  private _logMetrics(): void {
    const metrics = this._metricsService.getAllMetrics();
    const entries = Object.entries(metrics);

    if (entries.length === 0) {
      this._logger.info('[METRICS] No metrics collected yet');
      return;
    }

    this._logger.info('[METRICS] Current metrics:');
    entries.forEach(([name, value]) => {
      this._logger.info(`[METRICS]   ${name}: ${value}`);
    });
  }

  private async _saveMetrics(): Promise<void> {
    try {
      const metrics = this._metricsService.getAllMetrics();
      const data = JSON.stringify(metrics, null, 2);
      await fs.writeFile(this._metricsConfig.persistence?.file || './metrics.json', data);
      this._logger.debug(`Metrics saved to ${this._metricsConfig.persistence?.file || './metrics.json'}`);
    } catch (error) {
      this._logger.error(`Failed to save metrics: ${(error as Error).message}`);
    }
  }

  private async _loadMetrics(): Promise<void> {
    try {
      const data = await fs.readFile(this._metricsConfig.persistence?.file || './metrics.json', 'utf8');
      const metrics = JSON.parse(data);

      // Recharger les métriques
      Object.entries(metrics).forEach(([name, value]) => {
        this._metricsService.increment(name, value as number);
      });

      this._logger.info(`Metrics loaded from ${this._metricsConfig.persistence?.file || './metrics.json'}`);
    } catch (error) {
      // Fichier n'existe pas ou autre erreur - pas grave au premier démarrage
      if ((error as any).code !== 'ENOENT') {
        throw error;
      }
    }
  }
}

// Export du plugin
export const plugin = new MetricsPlugin();
