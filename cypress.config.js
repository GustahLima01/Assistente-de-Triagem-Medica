const { defineConfig } = require("cypress");
const net = require("node:net");
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

const DEFAULT_TEST_PORT = Number(process.env.CYPRESS_API_PORT || 3101);

let server;
let testPort = DEFAULT_TEST_PORT;

function isPortAvailable(port) {
  return new Promise((resolve) => {
    const candidate = net.createServer();

    candidate.once("error", () => {
      resolve(false);
    });

    candidate.once("listening", () => {
      candidate.close(() => resolve(true));
    });

    candidate.listen(port, "127.0.0.1");
  });
}

async function findAvailablePort(startPort) {
  for (let port = startPort; port < startPort + 100; port += 1) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }

  throw new Error(`Nenhuma porta livre encontrada a partir de ${startPort}.`);
}

async function ensureServer() {
  if (server) {
    return server;
  }

  resetDatabase();

  server = await new Promise((resolve, reject) => {
    const startedServer = app.listen(testPort, "127.0.0.1", () => resolve(startedServer));
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
  allowCypressEnv: false,
  e2e: {
    baseUrl: `http://127.0.0.1:${DEFAULT_TEST_PORT}`,
    experimentalRunAllSpecs: true,
    supportFile: "tests/cypress/support/e2e.js",
    specPattern: "tests/cypress/e2e/**/*.cy.js",
    async setupNodeEvents(on, config) {
      testPort = await findAvailablePort(DEFAULT_TEST_PORT);
      config.baseUrl = `http://127.0.0.1:${testPort}`;
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
