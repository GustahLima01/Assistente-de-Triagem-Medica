const { seedInactivePatient, seedInactiveSymptom, seedPatient, seedSymptom } = require("../helpers/seeds");
const { buildTriageFixture } = require("../fixtures");
const { authenticateAs, authorizedRequest, expect, expectApiError } = require("../helpers/api");

describe("Triages API", () => {
  it("US17 CT01 e US20 CT01: registra triagem desconsiderando IDs duplicados e persiste resultado consolidado", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedPatient();
    const firstSymptom = seedSymptom({ severity: "HIGH", specialty: "Cardiologia" });
    const secondSymptom = seedSymptom({ name: "Febre", severity: "MEDIUM", specialty: "Clinico Geral" });

    const response = await authorizedRequest("post", "/api/triages", token).send({
      patientId: patient.id,
      symptomIds: [firstSymptom.id, firstSymptom.id, secondSymptom.id],
      ...buildTriageFixture()
    });

    expect(response.status).to.equal(201);
    expect(response.body.data.symptomIds).to.deep.equal([firstSymptom.id, secondSymptom.id]);
    expect(response.body.data.suggestedSpecialty).to.equal("Cardiologia");
    expect(response.body.data.priority).to.equal("HIGH");
    expect(response.body.data.createdByUserId).to.be.a("string");
  });

  it("US17 CT02: rejeita registro de triagem por falta de permissao", async () => {
    const token = await authenticateAs("DOCTOR");
    const patient = seedPatient();
    const symptom = seedSymptom();

    const response = await authorizedRequest("post", "/api/triages", token).send({
      patientId: patient.id,
      symptomIds: [symptom.id]
    });

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US17 CT03: rejeita triagem para paciente inativo", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedInactivePatient();
    const symptom = seedSymptom();

    const response = await authorizedRequest("post", "/api/triages", token).send({
      patientId: patient.id,
      symptomIds: [symptom.id]
    });

    expectApiError(response, 409, "PATIENT_INACTIVE");
  });

  it("US17 CT04: rejeita triagem com sintoma inativo", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const symptom = seedInactiveSymptom();

    const response = await authorizedRequest("post", "/api/triages", token).send({
      patientId: patient.id,
      symptomIds: [symptom.id]
    });

    expectApiError(response, 409, "SYMPTOM_INACTIVE");
  });

  it("US17 CT05 e US20 CT03: rejeita triagem sem dados essenciais", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("post", "/api/triages", token).send({
      patientId: ""
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US18 CT01: retorna especialidade com maior soma de pesos", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const firstSymptom = seedSymptom({ severity: "CRITICAL", specialty: "Cardiologia" });
    const secondSymptom = seedSymptom({ name: "Tosse", severity: "LOW", specialty: "Pneumologia" });

    const response = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: [firstSymptom.id, secondSymptom.id]
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.suggestedSpecialty).to.equal("Cardiologia");
  });

  it("US18 CT02 e US19 CT02: rejeita consulta de especialidade por falta de permissao", async () => {
    const token = await authenticateAs("DOCTOR");
    const symptom = seedSymptom();

    const response = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: [symptom.id]
    });

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US18 CT03: rejeita consulta com symptomIds invalido", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: []
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US18 CT04: desempata especialidade por ordem alfabetica", async () => {
    const token = await authenticateAs("ADMIN");
    const cardiology = seedSymptom({ severity: "HIGH", specialty: "Cardiologia" });
    const dermatology = seedSymptom({ name: "Mancha", severity: "HIGH", specialty: "Dermatologia" });

    const response = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: [dermatology.id, cardiology.id]
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.suggestedSpecialty).to.equal("Cardiologia");
  });

  it("US19 CT01: retorna a maior severidade entre os sintomas informados", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const low = seedSymptom({ severity: "LOW", specialty: "Clinico Geral" });
    const critical = seedSymptom({ name: "Dispneia", severity: "CRITICAL", specialty: "Pneumologia" });

    const response = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: [low.id, critical.id]
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.priority).to.equal("CRITICAL");
  });

  it("US19 CT03: rejeita consulta de prioridade quando o sintoma esta inativo", async () => {
    const token = await authenticateAs("ADMIN");
    const inactiveSymptom = seedInactiveSymptom();

    const response = await authorizedRequest("post", "/api/triages/specialty-consult", token).send({
      symptomIds: [inactiveSymptom.id]
    });

    expectApiError(response, 409, "SYMPTOM_INACTIVE");
  });
});
