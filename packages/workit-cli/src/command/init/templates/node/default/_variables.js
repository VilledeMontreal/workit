const validate = require("validate-npm-package-name");
const path = require("path");

const folderNames = process.cwd().split(path.sep);
const currentFolder = folderNames[folderNames.length - 1];
/*
 * Variables to replace
 * --------------------
 * They are asked to the user as they appear here.
 * User input will replace the placeholder  values
 * in the template files
 */

module.exports = [{
  name: 'name',
  description: 'Project name',
  type: 'string',
  required: true,
  default: currentFolder.replace(/ /g, ''),
  message: 'Please, project name must be compatible with package name convention',
  before: function(value) { return value.replace(/ /g, ''); },
  conform: function(input) {
    const v = validate(input);
    if (v.validForNewPackages) {
      return true;
    }
    return false;
  }
},{
  name: 'description',
  before: function(value) { return value.replace(/"/g, '\''); },
  description: 'description',
  type: 'string'
},{
  name: 'author',
  description: 'Package author name',
  before: function(value) { return value.replace(/"/g, ''); },
  type: 'string'
},{
  name: 'license',
  description: 'Package license',
  before: function(value) { return value.replace(/"/g, ''); },
  default: 'MIT',
  type: 'string'
},{
  name: 'version',
  before: function(value) { return value.replace(/"/g, ''); },
  conform: function(input) {
    if (
      typeof input === "string" 
      && input.split(".").length === 3) {
      return true;
    }
    return false;
  },
  default: '0.0.1',
  description: 'Package version',
  type: 'string'
}];