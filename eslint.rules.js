module.exports = {
  // prettier conflicts
  "no-underscore-dangle": "off",
  "max-len": "off",
  "max-classes-per-file": "off",
  "class-methods-use-this": "off",
  "no-await-in-loop": "off",
  "import/prefer-default-export": "off",
  "comma-dangle": "off",
  "object-curly-newline": "off",
  "arrow-parens": "off",
  "implicit-arrow-linebreak": "off",
  "prettier/prettier": "error",
  "@typescript-eslint/no-unused-vars": "off",
  "no-use-before-define": "off",
  "@typescript-eslint/no-use-before-define": ["error", {
    "functions": false,
    "classes": true,
    "variables": true,
    "typedefs": false,
    "ignoreTypeReferences": true,
    "allowNamedExports": true
  }],
  "no-useless-constructor": "off",
  "@typescript-eslint/no-useless-constructor": "off", // not good with inversify
  "no-empty-function": "off",
  "@typescript-eslint/no-empty-function": ["error", { "allow": ["constructors", "methods"] }],
  "@typescript-eslint/no-explicit-any": "off",
  "import/named": "off", // not working properly
  "import/extensions": ["error", "ignorePackages", {
    "js": "never",
    "jsx": "never",
    "ts": "never",
    "tsx": "never"
  }],
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "interface",
      "format": ["PascalCase"],
      "custom": {
        "regex": "^I[A-Z]",
        "match": true
      }
    }
  ],
  "@typescript-eslint/explicit-member-accessibility": ["error", {
    "accessibility": "explicit",
    "overrides": {
      "accessors": "explicit",
      "constructors": "no-public",
      "methods": "explicit",
      "properties": "explicit",
      "parameterProperties": "explicit"
    }
  }],
  "@typescript-eslint/naming-convention": [
    "error",
    {
      "selector": "memberLike",
      "modifiers": ["private"],
      "format": ["camelCase", "UPPER_CASE"],
      "leadingUnderscore": "require"
    }
  ],
  "header/header": [2, "block", [
    `\n * Copyright (c) ${new Date().getFullYear()} Ville de Montreal. All rights reserved.\n * Licensed under the MIT license.\n * See LICENSE file in the project root for full license information.\n `
  ]]
};
