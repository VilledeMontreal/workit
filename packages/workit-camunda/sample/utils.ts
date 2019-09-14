/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */

import { TAG } from "../src/config/constants/tag";

export const getTag = (): symbol => {
    const args = process.argv;
    const arg = args[2];
    if (!arg) {
        return TAG.camundaBpm;
    }

    if (arg.toLowerCase().indexOf('z') > -1) {
        return TAG.zeebe;
    }
    
    return TAG.camundaBpm;
}