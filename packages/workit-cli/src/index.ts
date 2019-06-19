#!/usr/bin/env node

import * as prog from 'caporal';
import { about } from './command/about';
import { task } from './command/create/task';
import { init } from './command/init';

prog
  .version('1.0.1')
  .description('A simple cli that exploits "workit-camunda" package')
  .command('init', 'Initialize a new application')
  .alias('i')
  .argument(
    '[template]',
    'Template to use',
    undefined,
    'default'
  )
  .option(
    '--lang [language]',
    'Which <language> node, go, etc. (Only node is supported for now)',
    undefined,
    'node',
    false
  )
  // .option('--variant <variant>', 'Which <variant> of the template is going to be created')
  .action(init)

  .command('create', 'Create a new entity (e.g task)')
  .alias('c')
  .argument('<entity>', 'entity to create (e.g task)')
  .argument(
    '[template]',
    'Template to use',
    undefined,
    'default'
  )
  .option(
    '--file [file]',
    "Create all external tasks from your bpmn file.\nNotice that for safety, if a file already exists with the same name, it won't be overriden. This way, you can safety crunch the file multiple times and it will add only new external task."
  )
  .option(
    '--lang [language]',
    'Which [language] : node, go, etc. (Only node is supported for now)',
    undefined,
    'node',
    false
  )
  // .option('--variant <variant>', 'Which <variant> of the template is going to be created')
  .action(task)
  .command('about', 'about this program')
  .action(about);

prog.parse(process.argv);