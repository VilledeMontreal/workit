/*
 * Copyright (c) 2025 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '@villedemontreal/workit-types';
import { TaskBase, IoC } from '@villedemontreal/workit-core';
import { IMetricsService } from '../src/plugins/metrics-plugin';

export class ProcessDataTask extends TaskBase<IMessage> {
  public async execute(message: IMessage): Promise<IMessage> {
    const startTime = Date.now();
    const metricsService = IoC.get<IMetricsService>('metricsService');

    // Incrémenter le compteur d'exécution
    metricsService.increment('task.process_data.executed');
    metricsService.increment('tasks.total');

    try {
      console.log('🔄 ProcessDataTask: Starting data processing...');

      const input = message.body;
      const data = input.data || [];

      // Métriques sur le volume de données
      metricsService.increment('task.process_data.items_received', data.length);

      if (data.length > 1000) {
        metricsService.increment('task.process_data.large_batch');
      }

      // Simuler le traitement des données
      const processingTime = Math.random() * 800 + 200; // 200ms à 1s
      await new Promise(resolve => setTimeout(resolve, processingTime));

      // Traitement fictif des données
      const processedData = data.map((item: any, index: number) => ({
        ...item,
        processed: true,
        processedAt: new Date().toISOString(),
        index: index,
      }));

      // Simuler des erreurs occasionnelles pour démontrer les métriques d'échec
      if (Math.random() < 0.1) {
        // 10% de chance d'échec
        throw new Error('Random processing error for metrics demonstration');
      }

      const result = {
        processedCount: processedData.length,
        processedData: processedData,
        processingTime: Math.round(processingTime),
        processedAt: new Date().toISOString(),
      };

      // Métriques de succès
      const duration = Date.now() - startTime;
      metricsService.increment('task.process_data.success');
      metricsService.increment('task.process_data.items_processed', processedData.length);
      metricsService.recordDuration('task.process_data.duration', duration);

      // Métriques de performance
      if (duration < 500) {
        metricsService.increment('task.process_data.fast_execution');
      } else if (duration > 1000) {
        metricsService.increment('task.process_data.slow_execution');
      }

      console.log(`🔄 ProcessDataTask: Processed ${processedData.length} items in ${duration}ms`);

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
      metricsService.increment('task.process_data.failure');
      metricsService.recordDuration('task.process_data.error_duration', duration);

      console.error('❌ ProcessDataTask: Error during processing:', error);
      throw error;
    }
  }
}
