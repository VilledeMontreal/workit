module.exports = {
    "plugins": [
        "@typescript-eslint",
        "prettier",
        "header"
    ],
    "extends": [
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier/@typescript-eslint"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json"
    },
    "rules": {
        ...require('../../eslint.rules.js'),
        "no-console": "off"
    }
}
