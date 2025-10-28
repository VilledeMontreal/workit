/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '@villedemontreal/workit-types';
import { TaskBase, IoC } from '@villedemontreal/workit-core';
import { IMetricsService } from '../src/plugins/metrics-plugin';

export class CalculateTask extends TaskBase<IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    const startTime = Date.now();
    const metricsService = IoC.get<IMetricsService>('metricsService');

    // Incrémenter le compteur d'exécution
    metricsService.increment('task.calculate.executed');
    metricsService.increment('tasks.total');

    try {
      console.log('📊 CalculateTask: Starting calculation...');

      // Simuler un calcul complexe
      const input = message.body;
      const numbers = input.numbers || [1, 2, 3, 4, 5];

      // Ajouter une durée variable pour la démo
      const processingTime = Math.random() * 1000 + 500; // 500ms à 1.5s
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Effectuer le calcul
      const result = {
        sum: numbers.reduce((a: number, b: number) => a + b, 0),
        average: numbers.reduce((a: number, b: number) => a + b, 0) / numbers.length,
        count: numbers.length,
        processedAt: new Date().toISOString(),
        processingTime: Math.round(processingTime),
      };

      // Métriques de succès
      const duration = Date.now() - startTime;
      metricsService.increment('task.calculate.success');
      metricsService.recordDuration('task.calculate.duration', duration);

      // Métriques métier personnalisées
      if (result.sum > 100) {
        metricsService.increment('task.calculate.high_sum');
      }

      if (numbers.length > 10) {
        metricsService.increment('task.calculate.large_dataset');
      }

      console.log(`📊 CalculateTask: Completed in ${duration}ms - Sum: ${result.sum}, Average: ${result.average}`);

      return {
        body: {
          ...result,
          originalInput: input,
        },
        properties: message.properties,
      };
    } catch (error) {
      // Métriques d'échec
      const duration = Date.now() - startTime;
      metricsService.increment('task.calculate.failure');
      metricsService.recordDuration('task.calculate.error_duration', duration);

      console.error('❌ CalculateTask: Error during calculation:', error);
      throw error;
    }
  }
}
