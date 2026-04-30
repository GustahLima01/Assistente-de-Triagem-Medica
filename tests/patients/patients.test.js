const { seedDoctor, seedInactivePatient, seedPatient, seedSymptom } = require("../helpers/seeds");
const { buildAppointmentFixture, buildPatientFixture } = require("../fixtures");
const { authenticateAs, authorizedRequest, expect, expectApiError } = require("../helpers/api");

describe("Patients API", () => {
  it("US05 CT01: cria paciente convertendo opcionais vazios para null", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("post", "/api/patients", token).send(
      buildPatientFixture({ email: "", notes: "" })
    );

    expect(response.status).to.equal(201);
    expect(response.body.data.email).to.equal(null);
    expect(response.body.data.notes).to.equal(null);
  });

  it("US05 CT02: rejeita criacao de paciente por falta de permissao", async () => {
    const token = await authenticateAs("DOCTOR");

    const response = await authorizedRequest("post", "/api/patients", token).send(buildPatientFixture());

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US05 CT03: rejeita criacao sem campos obrigatorios", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/patients", token).send({
      name: "Paciente incompleto"
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US05 CT04: rejeita criacao com data invalida", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/patients", token).send(
      buildPatientFixture({ birthDate: "2026-99-99" })
    );

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US05 CT05: rejeita criacao com documento duplicado", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();

    const response = await authorizedRequest("post", "/api/patients", token).send(
      buildPatientFixture({ document: patient.document })
    );

    expectApiError(response, 409, "PATIENT_DOCUMENT_ALREADY_EXISTS");
  });

  it("US06 CT01: permite listar e consultar pacientes por perfil autorizado", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedPatient();

    const listResponse = await authorizedRequest("get", "/api/patients", token);
    const getResponse = await authorizedRequest("get", `/api/patients/${patient.id}`, token);

    expect(listResponse.status).to.equal(200);
    expect(listResponse.body.data).to.have.lengthOf(1);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.data.id).to.equal(patient.id);
  });

  it("US06 CT02: rejeita consulta de pacientes por perfil nao autorizado", async () => {
    const token = await authenticateAs("DOCTOR");

    const response = await authorizedRequest("get", "/api/patients", token);

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US06 CT03: aplica filtros na consulta de pacientes", async () => {
    const token = await authenticateAs("ADMIN");
    const firstPatient = seedPatient({ name: "Joao da Costa", document: "11111111111" });
    seedPatient({ name: "Maria Silva", document: "22222222222" });

    const response = await authorizedRequest(
      "get",
      `/api/patients?document=${firstPatient.document}`,
      token
    );

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.lengthOf(1);
    expect(response.body.data[0].name).to.equal("Joao da Costa");
  });

  it("US06 CT04: retorna nao encontrado ao consultar paciente inexistente", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("get", "/api/patients/999", token);

    expectApiError(response, 404, "PATIENT_NOT_FOUND");
  });

  it("US07 CT01: atualiza paciente convertendo opcionais vazios para null", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedPatient();

    const response = await authorizedRequest("put", `/api/patients/${patient.id}`, token).send({
      birthDate: "1991-06-11",
      document: "33333333333",
      email: "",
      notes: ""
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.email).to.equal(null);
    expect(response.body.data.notes).to.equal(null);
  });

  it("US07 CT02: rejeita atualizacao por falta de permissao", async () => {
    const token = await authenticateAs("DOCTOR");
    const patient = seedPatient();

    const response = await authorizedRequest("put", `/api/patients/${patient.id}`, token).send({
      name: "Nome bloqueado"
    });

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US07 CT03: rejeita atualizacao com data invalida", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();

    const response = await authorizedRequest("put", `/api/patients/${patient.id}`, token).send({
      birthDate: "invalida"
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US07 CT04: rejeita atualizacao com documento duplicado", async () => {
    const token = await authenticateAs("ADMIN");
    const firstPatient = seedPatient({ document: "11111111111" });
    seedPatient({ document: "22222222222", name: "Outro paciente" });

    const response = await authorizedRequest("put", `/api/patients/${firstPatient.id}`, token).send({
      document: "22222222222"
    });

    expectApiError(response, 409, "PATIENT_DOCUMENT_ALREADY_EXISTS");
  });

  it("US08 CT01: inativa paciente e impede novo uso em triagem e agendamento", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedInactivePatient();
    const symptom = seedSymptom();
    const doctor = seedDoctor();

    const triageResponse = await authorizedRequest("post", "/api/triages", token).send({
      patientId: patient.id,
      symptomIds: [symptom.id]
    });

    const appointmentResponse = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id
      })
    );

    expectApiError(triageResponse, 409, "PATIENT_INACTIVE");
    expectApiError(appointmentResponse, 409, "PATIENT_INACTIVE");
  });

  it("US08 CT02: rejeita inativacao por perfil nao autorizado", async () => {
    const token = await authenticateAs("DOCTOR");
    const patient = seedPatient();

    const response = await authorizedRequest("delete", `/api/patients/${patient.id}`, token);

    expectApiError(response, 403, "FORBIDDEN");
  });
});
