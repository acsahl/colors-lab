// Jest runs two groups of tests:
//   unit        - front-end tests for public/js (jsdom, no server needed)
//   integration - real HTTP calls to the PHP API (needs PHP + MySQL running)
module.exports = {
  projects: [
    {
      displayName: "unit",
      testMatch: ["<rootDir>/tests/unit/**/*.test.js"],
      testEnvironment: "jsdom"
    },
    {
      displayName: "integration",
      testMatch: ["<rootDir>/tests/integration/**/*.test.js"],
      testEnvironment: "node"
    }
  ]
};
