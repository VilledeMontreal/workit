import * as colors from 'colors/safe';
import * as fs from 'fs';
import * as prompt from 'prompt';
import * as shell from 'shelljs';
import { symbols } from '../../configs/constants/symbols';

// Set prompt as green
prompt.message = colors.green('Replace');

/*
 * Command function
 */

export const init = (args, options, logger) => {
  const localPath = process.cwd();
  const template = args.template.toLowerCase();
  const language = options.lang.toLowerCase();
  
  if (!template || template !== 'default') {
    throw new Error(`Invalid template ${template}`);
  }
  if (!language || language !== 'node') {
    throw new Error(`This language is not supported ${language}`);
  }
    
  const templatePath = `${__dirname}/templates/${language}/${template}`.replace('workit-cli/lib', 'workit-cli/src');

  /*
   * Copy Template
   */

  if (fs.existsSync(templatePath)) {
    logger.info('Copying files…');
    shell.cp('-R', `${templatePath}/src/*`, localPath);
    logger.info(`${symbols.ok} The files have been copied!`);
  } else {
    logger.error(`The requested template for ${template} wasn’t found.`);
    process.exit(1);
  }

  /*
   * File variables
   */

  const variables = require(`${templatePath}/_variables`);

  // Remove variables file from the current directory
  // since it only is needed on the template directory
  if (fs.existsSync(`${localPath}/_variables.js`)) {
    shell.rm(`${localPath}/_variables.js`);
  }

  logger.info('Please fill the following values…');

  // Ask for variable values
  prompt.start().get(variables, (err, result) => {
    if (err || !result) {
      return;
    }
    // Remove MIT License file if another is selected
    if (result.license !== 'MIT' && result.license !== 'mit') {
      shell.rm(`${localPath}/LICENSE`);
    }

    // Replace variable values in all files
    shell.ls('-Rl', '.').forEach((entry: any) => {
      if (entry.isFile()) {
        // Replace '[VARIABLE]` with the corresponding variable value from the prompt
        variables.forEach(variable => {
          shell.sed('-i', `\\[${variable.name.toUpperCase()}\\]`, result[variable.name], entry.name);
        });

        // Insert current year in files
        shell.sed('-i', '\\[YEAR\\]', new Date().getFullYear().toString(), entry.name);
      }
    });

    logger.info(`${symbols.ok} Success!`);
  });
};
