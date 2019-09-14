/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import { logo } from '../../configs/constants/logo';

export const about = (args, options, logger) => {
  logger.info(logo);
  logger.info('Made with love by Ville de Montréal');
};
