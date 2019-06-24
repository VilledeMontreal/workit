// Copyright (c) Ville de Montreal. All rights reserved.
// Licensed under the MIT license.
// See LICENSE file in the project root for full license information.

import { APM } from '../enums/apm';
import { ICamundaClientInstrumentation } from './camundaClientInstrumentation';

export interface ICCInstrumentationHandler extends ICamundaClientInstrumentation {
  get(kind: APM): ICamundaClientInstrumentation | undefined;
}
