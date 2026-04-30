const { seedDoctor, seedInactiveDoctor, seedPatient } = require("../helpers/seeds");
const { buildAppointmentFixture, buildDoctorFixture } = require("../fixtures");
const { authenticateAs, authorizedRequest, expect, expectApiError } = require("../helpers/api");

describe("Doctors API", () => {
  it("US13 CT01: cria medico com CRM unico", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/doctors", token).send(buildDoctorFixture());

    expect(response.status).to.equal(201);
    expect(response.body.data.crm).to.match(/^CRM-SP-/);
  });

  it("US13 CT02: rejeita criacao de medico por falta de permissao", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("post", "/api/doctors", token).send(buildDoctorFixture());

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US13 CT03: rejeita criacao sem campos obrigatorios", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/doctors", token).send({ name: "Medico" });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US13 CT04: rejeita criacao com CRM duplicado", async () => {
    const token = await authenticateAs("ADMIN");
    const doctor = seedDoctor();

    const response = await authorizedRequest("post", "/api/doctors", token).send(
      buildDoctorFixture({ crm: doctor.crm })
    );

    expectApiError(response, 409, "DOCTOR_CRM_ALREADY_EXISTS");
  });

  it("US14 CT01: permite listar e consultar medicos", async () => {
    const token = await authenticateAs("ADMIN");
    const doctor = seedDoctor();

    const listResponse = await authorizedRequest("get", "/api/doctors", token);
    const getResponse = await authorizedRequest("get", `/api/doctors/${doctor.id}`, token);

    expect(listResponse.status).to.equal(200);
    expect(listResponse.body.data).to.have.lengthOf(1);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.data.id).to.equal(doctor.id);
  });

  it("US14 CT02: rejeita consulta de medicos por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("get", "/api/doctors", token);

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US14 CT03: retorna apenas medicos ativos por padrao", async () => {
    const token = await authenticateAs("ADMIN");
    seedDoctor({ name: "Ativo" });
    seedInactiveDoctor({ crm: "CRM-SP-999999", name: "Inativo" });

    const response = await authorizedRequest("get", "/api/doctors", token);

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.lengthOf(1);
    expect(response.body.data[0].name).to.equal("Ativo");
  });

  it("US14 CT04: retorna nao encontrado ao consultar medico inexistente", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("get", "/api/doctors/999", token);

    expectApiError(response, 404, "DOCTOR_NOT_FOUND");
  });

  it("US15 CT01: atualiza medico mantendo CRM unico", async () => {
    const token = await authenticateAs("ADMIN");
    const doctor = seedDoctor();

    const response = await authorizedRequest("put", `/api/doctors/${doctor.id}`, token).send({
      name: "Dra. Atualizada",
      specialty: "Neurologia",
      email: "atualizada@clinica.local"
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.specialty).to.equal("Neurologia");
  });

  it("US15 CT02: rejeita atualizacao de medico por falta de permissao", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const doctor = seedDoctor();

    const response = await authorizedRequest("put", `/api/doctors/${doctor.id}`, token).send({
      specialty: "Pediatria"
    });

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US15 CT03: rejeita atualizacao com CRM duplicado", async () => {
    const token = await authenticateAs("ADMIN");
    const firstDoctor = seedDoctor({ crm: "CRM-SP-111111" });
    seedDoctor({ crm: "CRM-SP-222222", name: "Outra medica" });

    const response = await authorizedRequest("put", `/api/doctors/${firstDoctor.id}`, token).send({
      crm: "CRM-SP-222222"
    });

    expectApiError(response, 409, "DOCTOR_CRM_ALREADY_EXISTS");
  });

  it("US16 CT01: inativa medico e impede novo agendamento", async () => {
    const token = await authenticateAs("ADMIN");
    const doctor = seedInactiveDoctor();
    const patient = seedPatient();

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id
      })
    );

    expectApiError(response, 409, "DOCTOR_INACTIVE");
  });

  it("US16 CT02: rejeita inativacao por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const doctor = seedDoctor();

    const response = await authorizedRequest("delete", `/api/doctors/${doctor.id}`, token);

    expectApiError(response, 403, "FORBIDDEN");
  });
});
