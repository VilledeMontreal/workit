/*!
 * Copyright (c) 2019 Ville de Montreal. All rights reserved.
 * Licensed under the MIT license.
 * See LICENSE file in the project root for full license information.
 */
import * as colors from 'colors/safe';
import * as fs from 'fs';
import * as path from 'path';
import * as prompt from 'prompt';
import * as shell from 'shelljs';
import { Project, SyntaxKind } from 'ts-morph';
import { symbols } from '../../../configs/constants/symbols';

// Set prompt as green
prompt.message = colors.green('Replace');

const localPath = process.cwd();

function processHandler(className, contentFile, isBpmn = false): Promise<void> {
  const camelCase = require('camelcase');
  const classNameWithMaj = camelCase(className, { pascalCase: true });
  const classNameSanitized = camelCase(className);
  const project = new Project({
    // Optionally specify compiler options, tsconfig.json, virtual file system, and more here.
    // If you initialize with a tsconfig.json, then it will automatically populate the project
    // with the associated source files.
    // Read more: https://dsherret.github.io/ts-morph/setup/
  });

  if (fs.existsSync(`${localPath}/src/tasks/${classNameSanitized}.ts`)) {
    return Promise.resolve();
  }

  fs.writeFileSync(
    `${localPath}/src/tasks/${classNameSanitized}.ts`,
    contentFile.toString().replace('[CLASSNAME]', classNameWithMaj)
  );

  const filePath = path.resolve(`${localPath}/src/config/ioc.ts`);
  project.addExistingSourceFiles(filePath);
  const file = project.getSourceFile(filePath);
  if (file) {
    let iocFound = false;
    let j = 0;
    const statements = file.getDescendantsOfKind(SyntaxKind.ExpressionStatement);
    const imports = file.getDescendantsOfKind(SyntaxKind.ImportDeclaration);
    while (!iocFound && j < statements.length) {
      const exp = statements[j];
      const ex = exp.getDescendantsOfKind(SyntaxKind.PropertyAccessExpression);

      let i = 0;
      while (!iocFound && i < ex.length) {
        const prop = ex[i];
        const node = prop.compilerNode;
        if ((node.expression as any).escapedText === 'IoC') {
          iocFound = true;
          const firstImport = imports[0];
          firstImport.replaceWithText(
            `import { ${classNameWithMaj} } from "../tasks/${classNameSanitized}";\n${firstImport.getText()}`
          );
          exp.replaceWithText(
            `IoC.bindTo(${classNameWithMaj}, '${isBpmn ? className : '<ACTIVITY_ID>'}');\n${exp.getText()}`
          );
        }
        i += 1;
      }
      j += 1;
    }
    // improve this with a pattern
    if (!iocFound) {
      if (imports.length === 0) {
        file.addImportDeclaration({
          moduleSpecifier: `../tasks/${classNameSanitized}`,
          namedImports: [{ name: classNameWithMaj }],
        });
        file.addImportDeclaration({
          moduleSpecifier: `workit-core`,
          namedImports: [{ name: 'IoC' }],
        });
      } else {
        const firstImport = imports[0];
        firstImport.replaceWithText(
          `import { ${classNameWithMaj} } from "../tasks/${classNameSanitized}";\n${firstImport.getText()}`
        );
      }

      if (statements.length === 0) {
        file.addStatements((writer) =>
          writer.newLine().writeLine(`IoC.bindTo(${classNameWithMaj}, '${isBpmn ? className : '<ACTIVITY_ID>'}');`)
        );
      } else {
        const statement = statements[0];
        statement.replaceWithText(
          `\nIoC.bindTo(${classNameWithMaj}, '${isBpmn ? className : '<ACTIVITY_ID>'}');\n${statement.getText()}`
        );
      }
    }
    file.organizeImports();
    return project.save();
  }

  return Promise.resolve();
}

function getExternalTasks(pathToFile: string): Set<string> {
  const parser = require('fast-xml-parser');
  const he = require('he');

  const options = {
    attributeNamePrefix: '',
    attrNodeName: '', // default is false
    textNodeName: '#text',
    ignoreAttributes: false,
    cdataTagName: '__cdata', // default is false
    cdataPositionChar: '\\c',
    format: false,
    indentBy: '  ',
    supressEmptyNode: false,
    tagValueProcessor: (a) => he.encode(a, { useNamedReferences: true }), // default is a=>a
    attrValueProcessor: (a) => he.encode(a, { isAttributeValue: true, useNamedReferences: true }), // default is a=>a
  };

  const xmlData = fs.readFileSync(pathToFile).toString();
  const externalTasks = new Set<string>();
  if (!parser.validate(xmlData)) {
    throw new Error('Your bpmn file cannot be parsed as xml file.');
  }
  const bpmn = parser.parse(xmlData, options);
  const bpmnDef = bpmn['bpmn:definitions'];
  const bpmnProc = bpmnDef['bpmn:process'];
  let serviceTasks = bpmnProc['bpmn:serviceTask'];

  if (!Array.isArray(serviceTasks)) {
    serviceTasks = [serviceTasks];
  }
  serviceTasks.forEach((_task: any) => {
    if (_task['camunda:type'] === 'external' || _task['bpmn:extensionElements']['zeebe:taskDefinition']) {
      // const className = camelCase(task.id, { pascalCase: true });
      // this.fs.copyTpl(
      //   this.templatePath('task.ts'),
      //   this.destinationPath(`src/tasks/${ camelCase(task.id) }`),
      //   { className }
      // );
      externalTasks.add(_task.id);
    }
  });
  return externalTasks;
}

/*
 * Command function
 */
export const task = async (args, options, logger): Promise<void> => {
  const language = options.lang;
  const workflowPath = options.file;
  const { template } = args;
  // console.log(options);
  // console.log(args);
  if (!template || template !== 'default') {
    throw new Error(`Invalid template ${template}`);
  }
  if (!language || language !== 'node') {
    throw new Error(`This language is not supported ${language}`);
  }

  const templatePath = `${__dirname}/templates/${language}/${template}`.replace(
    'workit-cli/lib/command',
    'workit-cli/src/command'
  );
  const contentFile = fs.readFileSync(`${templatePath}/src/task`);
  /*
   * File variables
   */

  const variables = require(`${templatePath}/_variables`);

  // Remove variables file from the current directory
  // since it only is needed on the template directory
  if (fs.existsSync(`${localPath}/_variables.js`)) {
    shell.rm(`${localPath}/_variables.js`);
  }

  if (workflowPath) {
    if (!fs.existsSync(workflowPath)) {
      throw new Error("Le fichier n'a pas été trouvé");
    }
    const tasks = getExternalTasks(workflowPath);
    const ProgressBar = require('progress');
    const bar = new ProgressBar('  generating tasks [:bar] :percent :etas', {
      complete: '=',
      incomplete: ' ',
      width: 30,
      total: tasks.size,
    });

    // eslint-disable-next-line no-restricted-syntax
    for (const currentTask of tasks) {
      await processHandler(currentTask, contentFile, true);
      bar.tick(1);
    }

    logger.info(`\n${symbols.ok} Success!`);
  } else {
    logger.info('Please fill the following values…');
    prompt.start().get(variables, (err, result) => {
      if (err || !result || !result.className) {
        return;
      }
      processHandler(result.className, contentFile)
        .then(() => logger.info(`${symbols.ok} Success!`))
        .catch((error: any) => logger.error(`${symbols.err} Fail!\n${error.message}`));
    });
  }
};
