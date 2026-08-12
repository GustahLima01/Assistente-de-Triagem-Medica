const { defineConfig } = require("cypress");

module.exports = defineConfig({
  video: false,
  viewportWidth: 1440,
  viewportHeight: 960,
  defaultCommandTimeout: 10000,
  requestTimeout: 10000,
  retries: {
    runMode: 1,
    openMode: 0
  },
  e2e: {
    baseUrl: process.env.CYPRESS_BASE_URL || "http://localhost:4000",
    specPattern: "tests/cypress/e2e/**/*.cy.js",
    supportFile: "tests/cypress/support/e2e.js",
    env: {
      apiUrl: process.env.CYPRESS_API_URL || "http://localhost:3000/api"
    }
  }
});
