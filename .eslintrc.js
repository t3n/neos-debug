module.exports = {
    root: true,
    parser: '@typescript-eslint/parser',
    extends: [
        'eslint:recommended',
        'plugin:@typescript-eslint/recommended',
        'plugin:preact/recommended',
        'plugin:prettier/recommended',
    ],
    plugins: ['prettier', 'preact'],
    settings: {
        react: {
            pragma: 'h',
            version: 'detect',
        },
    },
    env: {
        browser: true,
        es6: true,
        node: true,
    },
    ignorePatterns: ['.cache', 'Classes', 'node_modules', 'Configuration', 'Resources/Public'],
    rules: {
        '@typescript-eslint/explicit-module-boundary-types': 'off',
        '@typescript-eslint/explicit-function-return-type': 'off',
        '@typescript-eslint/no-explicit-any': 'off',
        '@typescript-eslint/no-var-requires': 'off',
        '@typescript-eslint/ban-ts-ignore': 'off',
        '@typescript-eslint/ban-ts-comment': 'off',
        '@typescript-eslint/ban-types': 'off',
        'react/no-danger': 'off',
        'react/jsx-no-bind': 'off',
        'prettier/prettier': ['error'],
    },
};
