// const validate = require("validate-npm-package-name");

/*
 * Variables to replace
 * --------------------
 * They are asked to the user as they appear here.
 * User input will replace the placeholder  values
 * in the template files
 */

module.exports = [{
  name: 'className',
  description: 'Class name for the task',
  type: 'string',
  required: true,
  message: 'Please, Give a right class name',
  before: function(value) {
    if (!value) {
      return;
    }
    return value
    .replace(/ /g, '')
    .replace(/-/g, '')

  },
  // conform: function(input) {
  //   const v = validate(input);
  //   if (v.validForNewPackages) {
  //     return true;
  //   }
  //   return false;
  // }
}];