/**!
MIT License

Copyright (c) 2019 Ville de Montréal

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
*/

// Note the `file-header` TS lint rule implicitly adds comments around this, and
// makes the first comment line begin with /*!
// See:
// https://github.com/palantir/tslint/blob/b2972495e05710fa55600c233bf46a8a5c02e3cd/src/rules/fileHeaderRule.ts#L224
const fileHeaderTemplate = `Copyright (c) YEAR_PLACEHOLDER Ville de Montreal. All rights reserved.
Licensed under the MIT license.
See LICENSE file in the project root for full license information.`;

const fileHeaderRegexStr =
    fileHeaderTemplate
        .replace(/[\\\/^$.*+?()[\]{}|]/g, '\\$&')  // Escape regex
        .replace(/\n/g, '\n \\* ?')  // Per line space+asterisk, optional space
        .replace('YEAR_PLACEHOLDER', '2\\d{3}');

const fileHeaderDefault =
    fileHeaderTemplate.replace('YEAR_PLACEHOLDER', new Date().getFullYear());

const rules = {
  'file-header': [
    true,
    {
      'allow-single-line-comments': false,
      'match': fileHeaderRegexStr,
      'default': fileHeaderDefault,
    },
  ],
  'naming-convention': [
    true,
    { 'type': 'property', 'modifiers': 'protected', 'leadingUnderscore': 'require' },
    { 'type': 'member', 'modifiers': 'private', 'leadingUnderscore': 'require' }
  ],
  "function-name": [ true, { "method-regex": "^[a-z][\\w\\d]+$", "private-method-regex": "^_?[a-z][\\w\\d]+$", "protected-method-regex": "^_?[a-z][\\w\\d]+$", "static-method-regex": "^_?[a-z][\\w\\d]+$", "function-regex": "^_?[a-z][\\w\\d]+$" } ]
};

module.exports = {
  rules,
};