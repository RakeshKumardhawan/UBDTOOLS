import firebaseRulesPlugin from '@firebase/eslint-plugin-security-rules';

export default [
  {
    ignores: ['dist/**/*', 'node_modules/**/*', 'csharp_solution/**/*']
  },
  firebaseRulesPlugin.configs['flat/recommended']
];
