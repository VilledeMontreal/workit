/*
 * Copyright (c) 2023 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { camundaLogger, logger } from '@villedemontreal/workit-bpm-client';
import { kernel } from '@villedemontreal/workit-core';
import { constants } from './constants';
import { SERVICE_IDENTIFIER } from './constants/identifiers';

kernel.bind(SERVICE_IDENTIFIER.logger).toConstantValue(camundaLogger).whenTargetIsDefault();
Object.values(constants.envs).forEach((env) => {
  kernel.bind(SERVICE_IDENTIFIER.logger).toConstantValue(logger).whenTargetNamed(env);
});
