/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import 'reflect-metadata';
import { TAG } from '@villedemontreal/workit';
import { Worker, SERVICE_IDENTIFIER, IoC, PluginLoader } from '@villedemontreal/workit-core';
import { IPlugins } from '@villedemontreal/workit-types';

// Import des tâches
import { CalculateTask } from '../tasks/calculateTask';
import { ProcessDataTask } from '../tasks/processDataTask';

// Configuration des plugins
const plugins: IPlugins = {
  metrics: {
    enabled: true,
    path: `${__dirname}/plugins/metrics-plugin`,
    // Configuration du plugin metrics
    logInterval: 15000, // Log toutes les 15 secondes pour la démo
    httpEndpoint: {
      enabled: true,
      port: 3001,
      path: '/metrics',
    },
    persistence: {
      enabled: true,
      file: './demo-metrics.json',
      interval: 30000, // Sauvegarde toutes les 30 secondes
    },
  } as any,
};

async function main() {
  const platform = process.argv[2] || 'camunda';
  const tag = platform === 'stepfunction' ? TAG.stepFunction : TAG.camundaBpm;

  console.log(`🚀 Starting WorkIt worker with Metrics plugin for ${platform.toUpperCase()}`);

  // Obtenir le logger
  const logger = IoC.get(SERVICE_IDENTIFIER.logger);

  // Charger les plugins
  const pluginLoader = new PluginLoader(IoC, logger);
  pluginLoader.load(plugins);

  // Enregistrer les tâches
  IoC.bindTo(CalculateTask, 'CalculateTask');
  IoC.bindTo(ProcessDataTask, 'ProcessDataTask');

  // Créer et démarrer le worker
  const worker = IoC.get<Worker>(SERVICE_IDENTIFIER.worker, tag);

  // Gestion gracieuse de l'arrêt
  process.on('SIGINT', async () => {
    console.log('\n⏹️  Shutting down gracefully...');

    try {
      await worker.stop();
      pluginLoader.unload();

      // Afficher un résumé final des métriques
      const metricsService = IoC.get('metricsService');
      const finalMetrics = metricsService.getAllMetrics();

      console.log('\n📊 Final Metrics Summary:');
      console.log('========================');
      Object.entries(finalMetrics).forEach(([name, value]) => {
        console.log(`${name}: ${value}`);
      });

      console.log('\n✅ Worker stopped successfully');
      process.exit(0);
    } catch (error) {
      console.error('❌ Error during shutdown:', error);
      process.exit(1);
    }
  });

  // Démarrer le worker
  worker.start();

  // Incrémenter la métrique de démarrage
  const metricsService = IoC.get('metricsService');
  metricsService.increment('worker.started');

  console.log('✅ Worker started successfully');
  console.log('📊 Metrics endpoint: http://localhost:3001/metrics');
  console.log('⏹️  Press Ctrl+C to stop');

  // Démarrer le traitement
  await worker.run();
}

// Gestion des erreurs non catchées
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
  process.exit(1);
});

process.on('uncaughtException', error => {
  console.error('Uncaught Exception:', error);
  process.exit(1);
});

// Lancer l'application
main().catch(error => {
  console.error('❌ Failed to start worker:', error);
  process.exit(1);
});
