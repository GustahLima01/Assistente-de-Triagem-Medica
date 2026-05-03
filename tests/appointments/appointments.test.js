const {
  getSeededAdmin,
  seedAppointment,
  seedDoctor,
  seedInactiveDoctor,
  seedInactivePatient,
  seedPatient,
  seedSymptom,
  seedTriage
} = require("../helpers/seeds");
const { buildAppointmentFixture } = require("../fixtures");
const { authenticateAs, authorizedRequest, expect, expectApiError } = require("../helpers/api");

describe("Appointments API", () => {
  it("US21 CT01 e US23 CT01: cria agendamento com data normalizada, status SCHEDULED e usuario responsavel", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedPatient();
    const doctor = seedDoctor();

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-10T10:00:00-03:00"
      })
    );

    expect(response.status).to.equal(201);
    expect(response.body.data.scheduledAt).to.equal("2026-05-10T13:00:00.000Z");
    expect(response.body.data.status).to.equal("SCHEDULED");
    expect(response.body.data.createdByUserId).to.be.a("string");
  });

  it("US21 CT02: rejeita criacao de agendamento por falta de permissao", async () => {
    const token = await authenticateAs("DOCTOR");
    const patient = seedPatient();
    const doctor = seedDoctor();

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id
      })
    );

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US21 CT03: rejeita criacao sem campos obrigatorios", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/appointments", token).send({
      patientId: "1"
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US21 CT04 e US23 CT03: rejeita criacao com data invalida", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const doctor = seedDoctor();

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: "data-invalida"
      })
    );

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US21 CT05: rejeita agendamento para paciente inativo", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedInactivePatient();
    const doctor = seedDoctor();

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id
      })
    );

    expectApiError(response, 409, "PATIENT_INACTIVE");
  });

  it("US21 CT06: rejeita agendamento com medico inativo", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedPatient();
    const doctor = seedInactiveDoctor();

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id
      })
    );

    expectApiError(response, 409, "DOCTOR_INACTIVE");
  });

  it("US22 CT01: permite selecao sem validar aderencia por triagem quando triageId nao e informado", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const doctor = seedDoctor({ specialty: "Dermatologia" });

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id
      })
    );

    expect(response.status).to.equal(201);
    expect(response.body.data.doctorId).to.equal(doctor.id);
  });

  it("US22 CT02: permite selecao do medico compativel com a triagem do mesmo paciente", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const symptom = seedSymptom({ specialty: "Cardiologia", severity: "CRITICAL" });
    const doctor = seedDoctor({ specialty: "Cardiologia" });
    const triage = seedTriage({ patientId: patient.id, symptomIds: [symptom.id] }, getSeededAdmin());

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id,
        triageId: triage.id
      })
    );

    expect(response.status).to.equal(201);
    expect(response.body.data.triageId).to.equal(triage.id);
  });

  it("US22 CT03: rejeita quando a triagem pertence a outro paciente", async () => {
    const token = await authenticateAs("ADMIN");
    const firstPatient = seedPatient({ document: "11111111111" });
    const secondPatient = seedPatient({ document: "22222222222", name: "Segundo paciente" });
    const symptom = seedSymptom({ specialty: "Cardiologia" });
    const doctor = seedDoctor({ specialty: "Cardiologia" });
    const triage = seedTriage({ patientId: secondPatient.id, symptomIds: [symptom.id] }, getSeededAdmin());

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: firstPatient.id,
        doctorId: doctor.id,
        triageId: triage.id
      })
    );

    expectApiError(response, 409, "TRIAGE_PATIENT_MISMATCH");
  });

  it("US22 CT04: rejeita quando a especialidade do medico diverge da triagem", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const symptom = seedSymptom({ specialty: "Cardiologia" });
    const doctor = seedDoctor({ specialty: "Dermatologia" });
    const triage = seedTriage({ patientId: patient.id, symptomIds: [symptom.id] }, getSeededAdmin());

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: patient.id,
        doctorId: doctor.id,
        triageId: triage.id
      })
    );

    expectApiError(response, 409, "DOCTOR_SPECIALTY_MISMATCH");
  });

  it("US23 CT02: rejeita por conflito de horario", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const patient = seedPatient({ document: "11111111111" });
    const anotherPatient = seedPatient({ document: "22222222222", name: "Outro paciente" });
    const doctor = seedDoctor();
    seedAppointment(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-10T10:00:00.000Z"
      },
      getSeededAdmin()
    );

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: anotherPatient.id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-10T10:00:00.000Z"
      })
    );

    expectApiError(response, 409, "APPOINTMENT_CONFLICT");
  });

  it("US24 CT01: permite listar e consultar agendamentos", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const appointment = seedAppointment({}, getSeededAdmin());

    const listResponse = await authorizedRequest("get", "/api/appointments", token);
    const getResponse = await authorizedRequest("get", `/api/appointments/${appointment.id}`, token);

    expect(listResponse.status).to.equal(200);
    expect(listResponse.body.data).to.have.lengthOf(1);
    expect(getResponse.status).to.equal(200);
    expect(getResponse.body.data.id).to.equal(appointment.id);
  });

  it("US24 CT02: rejeita consulta de agendamentos por perfil nao autorizado", async () => {
    const token = await authenticateAs("DOCTOR");

    const response = await authorizedRequest("get", "/api/appointments", token);

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US24 CT03: aplica filtros na consulta de agendamentos", async () => {
    const token = await authenticateAs("ADMIN");
    const appointment = seedAppointment(
      {
        scheduledAt: "2026-05-10T10:00:00.000Z"
      },
      getSeededAdmin()
    );
    seedAppointment(
      {
        doctorId: seedDoctor({ crm: "CRM-SP-777777" }).id,
        patientId: seedPatient({ document: "33333333333" }).id,
        scheduledAt: "2026-05-11T10:00:00.000Z"
      },
      getSeededAdmin()
    );

    const response = await authorizedRequest(
      "get",
      `/api/appointments?doctorId=${appointment.doctorId}&scheduledFrom=2026-05-10T00:00:00.000Z&scheduledTo=2026-05-10T23:59:59.999Z`,
      token
    );

    expect(response.status).to.equal(200);
    expect(response.body.data).to.have.lengthOf(1);
    expect(response.body.data[0].id).to.equal(appointment.id);
  });

  it("US24 CT04: retorna nao encontrado ao consultar agendamento inexistente", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("get", "/api/appointments/999", token);

    expectApiError(response, 404, "APPOINTMENT_NOT_FOUND");
  });

  it("US25 CT01: permite editar observacoes de agendamento SCHEDULED", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const appointment = seedAppointment({}, getSeededAdmin());

    const response = await authorizedRequest("put", `/api/appointments/${appointment.id}`, token).send({
      notes: "  Retorno no fim da tarde  "
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.notes).to.equal("Retorno no fim da tarde");
    expect(response.body.data.updatedByUserId).to.be.a("string");
  });

  it("US25 CT02: permite reagendar consulta para novo horario sem conflito", async () => {
    const token = await authenticateAs("ADMIN");
    const appointment = seedAppointment({}, getSeededAdmin());

    const response = await authorizedRequest("put", `/api/appointments/${appointment.id}`, token).send({
      scheduledAt: "2026-05-11T10:00:00-03:00"
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.scheduledAt).to.equal("2026-05-11T13:00:00.000Z");
  });

  it("US25 CT02: permite editar agendamento com triagem vinculada alterando apenas horario e observacoes", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient({ document: "55555555555" });
    const symptom = seedSymptom({ specialty: "Cardiologia", severity: "HIGH" });
    const doctor = seedDoctor({ specialty: "Cardiologia", crm: "CRM-SP-919191" });
    const triage = seedTriage({ patientId: patient.id, symptomIds: [symptom.id] }, getSeededAdmin());
    const appointment = seedAppointment(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        triageId: triage.id,
        scheduledAt: "2026-05-15T10:00:00.000Z"
      },
      getSeededAdmin()
    );

    const response = await authorizedRequest("put", `/api/appointments/${appointment.id}`, token).send({
      scheduledAt: "2026-05-16T11:30:00.000Z",
      notes: "Reagendado apos confirmacao do paciente."
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.triageId).to.equal(triage.id);
    expect(response.body.data.doctorId).to.equal(doctor.id);
    expect(response.body.data.scheduledAt).to.equal("2026-05-16T11:30:00.000Z");
    expect(response.body.data.notes).to.equal("Reagendado apos confirmacao do paciente.");
  });

  it("US25 CT03: rejeita reagendamento para horario em conflito", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const doctor = seedDoctor();
    const firstAppointment = seedAppointment(
      {
        doctorId: doctor.id,
        scheduledAt: "2026-05-10T10:00:00.000Z"
      },
      getSeededAdmin()
    );
    seedAppointment(
      {
        doctorId: doctor.id,
        patientId: seedPatient({ document: "33333333333" }).id,
        scheduledAt: "2026-05-11T10:00:00.000Z"
      },
      getSeededAdmin()
    );

    const response = await authorizedRequest("put", `/api/appointments/${firstAppointment.id}`, token).send({
      scheduledAt: "2026-05-11T10:00:00.000Z"
    });

    expectApiError(response, 409, "APPOINTMENT_CONFLICT");
  });

  it("US25 CT04: rejeita troca para medico incompativel com a triagem", async () => {
    const token = await authenticateAs("ADMIN");
    const patient = seedPatient();
    const symptom = seedSymptom({ specialty: "Cardiologia" });
    const triage = seedTriage({ patientId: patient.id, symptomIds: [symptom.id] }, getSeededAdmin());
    const compatibleDoctor = seedDoctor({ specialty: "Cardiologia" });
    const incompatibleDoctor = seedDoctor({ specialty: "Dermatologia", crm: "CRM-SP-888888" });
    const appointment = seedAppointment(
      {
        patientId: patient.id,
        doctorId: compatibleDoctor.id,
        triageId: triage.id
      },
      getSeededAdmin()
    );

    const response = await authorizedRequest("put", `/api/appointments/${appointment.id}`, token).send({
      doctorId: incompatibleDoctor.id
    });

    expectApiError(response, 409, "DOCTOR_SPECIALTY_MISMATCH");
  });

  it("US25 CT05: rejeita edicao de agendamento cancelado", async () => {
    const token = await authenticateAs("ADMIN");
    const appointment = seedAppointment({}, getSeededAdmin());

    await authorizedRequest("delete", `/api/appointments/${appointment.id}`, token);

    const response = await authorizedRequest("put", `/api/appointments/${appointment.id}`, token).send({
      notes: "nova observacao"
    });

    expectApiError(response, 409, "APPOINTMENT_CANNOT_BE_EDITED");
  });

  it("US25 CT07: retorna nao encontrado ao editar agendamento inexistente", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("put", "/api/appointments/999", token).send({
      notes: "nova observacao"
    });

    expectApiError(response, 404, "APPOINTMENT_NOT_FOUND");
  });

  it("US26 CT01: cancela agendamento SCHEDULED com sucesso", async () => {
    const token = await authenticateAs("RECEPTIONIST");
    const appointment = seedAppointment({}, getSeededAdmin());

    const response = await authorizedRequest("delete", `/api/appointments/${appointment.id}`, token);

    expect(response.status).to.equal(200);
    expect(response.body.data.status).to.equal("CANCELLED");
    expect(response.body.data.updatedByUserId).to.be.a("string");
  });

  it("US26 CT02: rejeita cancelamento por falta de permissao", async () => {
    const token = await authenticateAs("DOCTOR");
    const appointment = seedAppointment({}, getSeededAdmin());

    const response = await authorizedRequest("delete", `/api/appointments/${appointment.id}`, token);

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US26 CT03: retorna nao encontrado ao cancelar agendamento inexistente", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("delete", "/api/appointments/999", token);

    expectApiError(response, 404, "APPOINTMENT_NOT_FOUND");
  });

  it("US26 CT04: rejeita cancelamento de agendamento ja cancelado", async () => {
    const token = await authenticateAs("ADMIN");
    const appointment = seedAppointment({}, getSeededAdmin());

    await authorizedRequest("delete", `/api/appointments/${appointment.id}`, token);
    const response = await authorizedRequest("delete", `/api/appointments/${appointment.id}`, token);

    expectApiError(response, 409, "APPOINTMENT_ALREADY_CANCELLED");
  });

  it("US26 CT05: permite novo agendamento no mesmo horario apos cancelamento", async () => {
    const token = await authenticateAs("ADMIN");
    const doctor = seedDoctor();
    const patient = seedPatient();
    const firstAppointment = seedAppointment(
      {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-12T10:00:00.000Z"
      },
      getSeededAdmin()
    );

    await authorizedRequest("delete", `/api/appointments/${firstAppointment.id}`, token);

    const response = await authorizedRequest("post", "/api/appointments", token).send(
      buildAppointmentFixture({
        patientId: seedPatient({ document: "44444444444" }).id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-12T10:00:00.000Z"
      })
    );

    expect(response.status).to.equal(201);
    expect(response.body.data.status).to.equal("SCHEDULED");
  });
});
