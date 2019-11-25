/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { JaegerTracerService } from 'workit-core';

export const tracerService = new JaegerTracerService({
    serviceName: 'Workit DEMO',
    host: 'localhost',
    port: 6832,

});
tracerService.start();