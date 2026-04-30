const { seedInactiveSymptom, seedPatient, seedSymptom } = require("../helpers/seeds");
const { buildSymptomFixture } = require("../fixtures");
const { authenticateAs, authorizedRequest, expect, expectApiError } = require("../helpers/api");

describe("Symptoms API", () => {
  it("US09 CT01: cria sintoma com severidade valida e especialidade informada", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/symptoms", token).send(buildSymptomFixture());

    expect(response.status).to.equal(201);
    expect(response.body.data.severity).to.equal("HIGH");
  });

  it("US09 CT02: rejeita criacao de sintoma por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("post", "/api/symptoms", token).send(buildSymptomFixture());

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US09 CT03: rejeita criacao sem campos obrigatorios", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/symptoms", token).send({ name: "Sintoma" });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US09 CT04: rejeita criacao com severidade invalida", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/symptoms", token).send(
      buildSymptomFixture({ severity: "URGENT" })
    );

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US09 CT05: rejeita criacao sem especialidade", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/symptoms", token).send(
      buildSymptomFixture({ specialty: "" })
    );

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US10 CT01: permite listar e consultar sintomas", async () => {
    const token = await authenticateAs("ADMIN");
    const symptom = seedSymptom();

    const listResponse = await authorizedRequest("get", "/api/symptoms", token);
    const getResponse = await authorizedRequest("get", `/api/symptoms/${symptom.id}`, token);

    expect(listResponse.status).to.equal(200);
    expect(listResponse.body.data).to.have.lengthOf(1);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.data.id).to.equal(symptom.id);
  });

  it("US10 CT02: rejeita consulta de sintomas por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("get", "/api/symptoms", token);

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US10 CT03: retorna apenas sintomas ativos disponiveis para triagem", async () => {
    const token = await authenticateAs("ADMIN");
    seedSymptom({ name: "Ativo" });
    seedInactiveSymptom({ name: "Inativo", specialty: "Neurologia" });

    const response = await authorizedRequest("get", "/api/symptoms", token);

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.lengthOf(1);
    expect(response.body.data[0].name).to.equal("Ativo");
  });

  it("US10 CT04: retorna nao encontrado ao consultar sintoma inexistente", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("get", "/api/symptoms/999", token);

    expectApiError(response, 404, "SYMPTOM_NOT_FOUND");
  });

  it("US11 CT01: atualiza sintoma com severidade valida e especialidade informada", async () => {
    const token = await authenticateAs("ADMIN");
    const symptom = seedSymptom();

    const response = await authorizedRequest("put", `/api/symptoms/${symptom.id}`, token).send({
      severity: "CRITICAL",
      specialty: "Neurologia",
      description: "Descricao atualizada"
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.severity).to.equal("CRITICAL");
  });

  it("US11 CT02: rejeita atualizacao de sintoma por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const symptom = seedSymptom();

    const response = await authorizedRequest("put", `/api/symptoms/${symptom.id}`, token).send({
      severity: "LOW"
    });

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US11 CT03: rejeita atualizacao com severidade invalida", async () => {
    const token = await authenticateAs("ADMIN");
    const symptom = seedSymptom();

    const response = await authorizedRequest("put", `/api/symptoms/${symptom.id}`, token).send({
      severity: "INVALIDA"
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US11 CT04: rejeita atualizacao ao remover a especialidade do sintoma", async () => {
    const token = await authenticateAs("ADMIN");
    const symptom = seedSymptom();

    const response = await authorizedRequest("put", `/api/symptoms/${symptom.id}`, token).send({
      specialty: ""
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US12 CT01: inativa sintoma e impede uso em consulta de especialidade e triagem", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const symptom = seedInactiveSymptom();

    const consultResponse = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: [symptom.id]
    });

    const triageResponse = await authorizedRequest("post", "/api/triages", token).send({
      patientId: patient.id,
      symptomIds: [symptom.id]
    });

    expectApiError(consultResponse, 409, "SYMPTOM_INACTIVE");
    expectApiError(triageResponse, 409, "SYMPTOM_INACTIVE");
  });

  it("US12 CT02: rejeita inativacao de sintoma por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const symptom = seedSymptom();

    const response = await authorizedRequest("delete", `/api/symptoms/${symptom.id}`, token);

    expectApiError(response, 403, "FORBIDDEN");
  });
});
