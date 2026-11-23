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
  },
  {
    files: ["tests/**/*.js", "jest.config.js", "eslint.config.js"],
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "commonjs",
      globals: {
        ...globals.node,
        ...globals.jest,
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
