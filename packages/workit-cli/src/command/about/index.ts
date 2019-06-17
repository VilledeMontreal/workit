import { logo } from '../../configs/constants/logo';

export const about = (args, options, logger) => {
  logger.info(logo);
  logger.info('Made with love by Ville de Montréal');
};
