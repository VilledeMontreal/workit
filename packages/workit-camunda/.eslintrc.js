module.exports = {
    "root": true,
    "plugins": [
        "@typescript-eslint",
        "prettier",
        "header",
        "import"
    ],
    "extends": [
        "airbnb-typescript/base",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking",
        "prettier"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "project": "./tsconfig.json"
    },
    "rules": require('../../eslint.rules.js')
}