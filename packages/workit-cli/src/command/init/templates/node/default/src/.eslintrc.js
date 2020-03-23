module.exports = {
    "root": true,
    "plugins": [
        "@typescript-eslint",
        "prettier"
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
        "@typescript-eslint/no-misused-promises": "off",
        "@typescript-eslint/interface-name-prefix": ["error", { "prefixWithI": "always" }]
    }
}