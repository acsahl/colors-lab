const js = require("@eslint/js");
const globals = require("globals");

module.exports = [
  {
    // Third-party library (blueimp JavaScript-MD5), kept as shipped.
    ignores: ["public/js/md5.js"]
  },
  js.configs.recommended,
  {
    files: ["public/js/**/*.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "script",
      globals: {
        ...globals.browser
      }
    },
    rules: {
      "eqeqeq": "error",
      "no-var": "error",
      "prefer-const": "error",
      "semi": "error"
    }
  }
];
