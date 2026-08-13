const { defineConfig } = require("cypress");
const app = require("./src/app");
const { db, resetDatabase } = require("./src/data/memoryDb");
const {
  getSeededAdmin,
  seedAppointment,
  seedDoctor,
  seedInactiveDoctor,
  seedInactivePatient,
  seedInactiveSymptom,
  seedInactiveUser,
  seedPatient,
  seedSymptom,
  seedTriage,
  seedUser
} = require("./tests/helpers/seeds");

let server;
const API_PORT = 3000;
const WEB_PORT = 4000;

async function ensureServer() {
  if (server) {
    return server;
  }

  resetDatabase();

  server = await new Promise((resolve, reject) => {
    const startedServer = app.listen(API_PORT, "127.0.0.1", () => resolve(startedServer));
    startedServer.once("error", reject);
  });

  return server;
}

function closeServer() {
  if (!server) {
    return Promise.resolve();
  }

  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error);
        return;
      }

      server = null;
      resolve();
    });
  });
}

function createSeedTaskMap() {
  return {
    user: seedUser,
    inactiveUser: seedInactiveUser,
    patient: seedPatient,
    inactivePatient: seedInactivePatient,
    doctor: seedDoctor,
    inactiveDoctor: seedInactiveDoctor,
    symptom: seedSymptom,
    inactiveSymptom: seedInactiveSymptom,
    triage: (payload = {}) => seedTriage(payload, getSeededAdmin()),
    appointment: (payload = {}) => seedAppointment(payload, getSeededAdmin())
  };
}

module.exports = defineConfig({
  allowCypressEnv: true,
  e2e: {
    baseUrl: `http://localhost:${WEB_PORT}`,
    env: {
      apiUrl: `http://localhost:${API_PORT}/api`
    },
    experimentalRunAllSpecs: true,
    supportFile: "tests/cypress/support/e2e.js",
    specPattern: "tests/cypress/e2e/**/*.cy.js",
    async setupNodeEvents(on, config) {
      await ensureServer();

      on("task", {
        resetDatabase() {
          resetDatabase();
          return null;
        },
        seed({ type, payload = {} }) {
          const seedTask = createSeedTaskMap()[type];

          if (!seedTask) {
            throw new Error(`Tipo de seed nao suportado: ${type}`);
          }

          return seedTask(payload);
        },
        getDbSnapshot() {
          return JSON.parse(JSON.stringify(db));
        }
      });

      on("after:run", async () => {
        await closeServer();
      });

      return config;
    }
  },
  video: false,
  screenshotOnRunFailure: false
});
