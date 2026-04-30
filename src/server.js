const app = require("./app");
const { seedBootstrapCatalog } = require("./data/bootstrapCatalog");

const PORT = process.env.PORT || 3000;

const bootstrapSummary = seedBootstrapCatalog();

app.listen(PORT, () => {
  if (!bootstrapSummary.skipped) {
    console.log(
      `Massa inicial carregada: ${bootstrapSummary.doctorsCreated} medicos e ${bootstrapSummary.symptomsCreated} sintomas.`
    );
  }

  console.log(`Servidor iniciado em http://localhost:${PORT}`);
});
