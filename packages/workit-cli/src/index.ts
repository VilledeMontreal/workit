#!/usr/bin/env node

import * as prog from 'caporal';
import * as fs from 'fs';
import { about } from './command/about';
import { task } from './command/create/task';
import { init } from './command/init';
// tslint:disable: no-console
prog
  .version('1.0.0')
  .description('A simple cli that exploits "workit-camunda" package')
  .command('init', 'Initialize a new application')
  .alias('i')
  .argument(
    '[template]',
    'Template to use',
    input => {
      if (!input || input.toLowerCase() === 'default') {
        return input;
      }
      throw new Error('Invalid template');
    },
    'default'
  )
  .option(
    '--lang [language]',
    'Which <language> node, go, etc. (Only node is supported for now)',
    input => {
      if (!input || input.toLowerCase() === 'node') {
        return input;
      }
      throw new Error('This language is not supported');
    },
    'node',
    false
  )
  // .option('--variant <variant>', 'Which <variant> of the template is going to be created')
  .action(init)

  .command('create', 'Create a new entity (e.g task)')
  .alias('c')
  .argument('<entity>', 'entity to create (e.g task)', input => {
    if (typeof input === 'string' && input.toLowerCase() === 'task') {
      return input;
    }
    throw new Error('Invalid entity');
  })
  .argument(
    '[template]',
    'Template to use',
    input => {
      if (!input || input.toLowerCase() === 'default') {
        return input;
      }
      throw new Error('Invalid template');
    },
    'default'
  )
  .option(
    '--file [file]',
    "Create all external tasks from your bpmn file.\nNotice that for safety, if a file already exists with the same name, it won't be overriden. This way, you can safety crunch the file multiple times and it will add only new external task.",
    input => {
      if (input && fs.existsSync(input)) {
        return input;
      }
      throw new Error('File not found');
    }
  )
  .option(
    '--lang [language]',
    'Which [language] : node, go, etc. (Only node is supported for now)',
    input => {
      if (!input || input.toLowerCase() === 'node') {
        return input;
      }
      throw new Error('This language is not supported');
    },
    'node',
    false
  )
  // .option('--variant <variant>', 'Which <variant> of the template is going to be created')
  .action(task)
  .command('about', 'about this program')
  .action(about);

prog.parse(process.argv);
