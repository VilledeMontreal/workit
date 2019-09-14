/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { CamundaMessage } from '../../models/camunda/camundaMessage';

describe('Camunda Message', () => {
  describe('Unwrap', () => {
    it('unwrap body message', () => {
      const cDate = new Date();
      const message = {
        body: { a: 1, b: true, c: cDate, d: { d1: new Date() }, e: [] },
        properties: { customHeaders: {} } as any
      };
      const variables = CamundaMessage.unwrap(message);
      const data = variables.getAll();

      expect(data.a).toStrictEqual(1);
      expect(data.b).toBeTruthy();
      expect((data.c as Date).toUTCString()).toStrictEqual(cDate.toUTCString());
      expect(typeof data.d).toStrictEqual('object');
      expect(data._meta).toBeUndefined();
    });

    it('should unwrap customHeaders in properties message to _meta field in variable object', () => {
      const message = { body: {}, properties: { customHeaders: { a: 1 } } as any };
      const variables = CamundaMessage.unwrap(message);
      const data = variables.getAll();

      expect(data._meta.customHeaders.a).toStrictEqual(1);
    });
  });
});
