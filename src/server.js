const app = require("./app");
const { seedBootstrapCatalog } = require("./data/bootstrapCatalog");
const { seedBootstrapOperationalData } = require("./data/bootstrapOperationalData");
const { resetDatabase } = require("./data/memoryDb");

const PORT = process.env.PORT || 3000;

resetDatabase();
const catalogBootstrapSummary = seedBootstrapCatalog();
const operationalBootstrapSummary = seedBootstrapOperationalData();

app.listen(PORT, () => {
  if (!catalogBootstrapSummary.skipped) {
    console.log(
      `Massa inicial carregada: ${catalogBootstrapSummary.doctorsCreated} medicos e ${catalogBootstrapSummary.symptomsCreated} sintomas.`
    );
  }

  if (!operationalBootstrapSummary.skipped) {
    console.log(
      `Massa operacional carregada: ${operationalBootstrapSummary.patientsCreated} pacientes, ${operationalBootstrapSummary.triagesCreated} triagens e ${operationalBootstrapSummary.appointmentsCreated} agendamentos.`
    );
  }

  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
