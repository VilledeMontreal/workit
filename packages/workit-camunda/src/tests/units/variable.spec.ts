/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { IVariables } from 'workit-types';
import { Variables } from '../../models/camunda/variables';

describe('Variables class', () => {
  it('should return undefined on non existing variable', () => {
    const vars: IVariables = new Variables();
    expect(vars.get('_meta')).toBeUndefined();
  });
});
