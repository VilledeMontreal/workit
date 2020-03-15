module.exports = {
    // prettier conflicts
    "no-underscore-dangle": "off",
    "max-len": "off",
    "max-classes-per-file": "off",
    "class-methods-use-this": "off",
    "no-await-in-loop": "off",
    "import/prefer-default-export": "off",
    "comma-dangle": "off",
    "object-curly-newline":"off",
    "arrow-parens": "off",
    "implicit-arrow-linebreak": "off",
    "prettier/prettier": "error",
    "@typescript-eslint/no-useless-constructor": "off", // not good with inversify
    "@typescript-eslint/no-misused-promises": "off",
    "@typescript-eslint/interface-name-prefix": ["error", { "prefixWithI": "always" }],
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