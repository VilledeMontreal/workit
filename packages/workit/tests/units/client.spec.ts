/*
 * Copyright (c) 2026 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IMessage } from '@villedemontreal/workit-types';
import { Client } from '../../src/camunda-n-mq/client';

describe('Client', () => {
  const handler = async (_message: IMessage, _service: unknown): Promise<void> => Promise.resolve();

  it('should propagate subscription errors', async () => {
    const error = new Error('subscription failed');
    const underlyingClient = {
      subscribe: jest.fn().mockRejectedValue(error),
      unsubscribe: jest.fn(),
    };
    const client = new Client(underlyingClient as any);

    await expect(client.subscribe(handler)).rejects.toBe(error);
  });

  it('should propagate unsubscription errors', async () => {
    const error = new Error('unsubscription failed');
    const underlyingClient = {
      subscribe: jest.fn(),
      unsubscribe: jest.fn().mockRejectedValue(error),
    };
    const client = new Client(underlyingClient as any);

    await expect(client.unsubscribe()).rejects.toBe(error);
  });
});
