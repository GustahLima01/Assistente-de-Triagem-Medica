const { buildAppointmentFixture } = require("../../../fixtures");
const { expectApiError } = require("../../support/api");

describe("Appointments API", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US21 CT01 e US23 CT01: cria agendamento com data normalizada, status SCHEDULED e usuario responsavel", () => {
    cy.seedMany({
      patient: { type: "patient" },
      doctor: { type: "doctor" }
    }).then(({ patient, doctor }) => {
      cy.requestAs(
        "RECEPTIONIST",
        "POST",
        "/api/appointments",
        buildAppointmentFixture({
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: "2026-05-10T10:00:00-03:00"
        })
      ).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.data.scheduledAt).to.equal("2026-05-10T13:00:00.000Z");
        expect(response.body.data.status).to.equal("SCHEDULED");
        expect(response.body.data.createdByUserId).to.be.a("string");
      });
    });
  });

  it("US21 CT02: rejeita criacao de agendamento por falta de permissao", () => {
    cy.seedMany({
      patient: { type: "patient" },
      doctor: { type: "doctor" }
    }).then(({ patient, doctor }) => {
      cy.requestAs(
        "DOCTOR",
        "POST",
        "/api/appointments",
        buildAppointmentFixture({
          patientId: patient.id,
          doctorId: doctor.id
        })
      ).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US21 CT03: rejeita criacao sem campos obrigatorios", () => {
    cy.requestAs("ADMIN", "POST", "/api/appointments", {
      patientId: "1"
    }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US21 CT04 e US23 CT03: rejeita criacao com data invalida", () => {
    cy.seedMany({
      patient: { type: "patient" },
      doctor: { type: "doctor" }
    }).then(({ patient, doctor }) => {
      cy.requestAs(
        "ADMIN",
        "POST",
        "/api/appointments",
        buildAppointmentFixture({
          patientId: patient.id,
          doctorId: doctor.id,
          scheduledAt: "data-invalida"
        })
      ).then((response) => {
        expectApiError(response, 400, "VALIDATION_ERROR");
      });
    });
  });

  it("US21 CT05: rejeita agendamento para paciente inativo", () => {
    cy.seedMany({
      patient: { type: "inactivePatient" },
      doctor: { type: "doctor" }
    }).then(({ patient, doctor }) => {
      cy.requestAs(
        "RECEPTIONIST",
        "POST",
        "/api/appointments",
        buildAppointmentFixture({
          patientId: patient.id,
          doctorId: doctor.id
        })
      ).then((response) => {
        expectApiError(response, 409, "PATIENT_INACTIVE");
      });
    });
  });

  it("US21 CT06: rejeita agendamento com medico inativo", () => {
    cy.seedMany({
      patient: { type: "patient" },
      doctor: { type: "inactiveDoctor" }
    }).then(({ patient, doctor }) => {
      cy.requestAs(
        "RECEPTIONIST",
        "POST",
        "/api/appointments",
        buildAppointmentFixture({
          patientId: patient.id,
          doctorId: doctor.id
        })
      ).then((response) => {
        expectApiError(response, 409, "DOCTOR_INACTIVE");
      });
    });
  });

  it("US22 CT01: permite selecao sem validar aderencia por triagem quando triageId nao e informado", () => {
    cy.seedMany({
      patient: { type: "patient" },
      doctor: { type: "doctor", payload: { specialty: "Dermatologia" } }
    }).then(({ patient, doctor }) => {
      cy.requestAs(
        "ADMIN",
        "POST",
        "/api/appointments",
        buildAppointmentFixture({
          patientId: patient.id,
          doctorId: doctor.id
        })
      ).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.data.doctorId).to.equal(doctor.id);
      });
    });
  });

  it("US22 CT02: permite selecao do medico compativel com a triagem do mesmo paciente", () => {
    cy.seedMany({
      patient: { type: "patient" },
      symptom: { type: "symptom", payload: { specialty: "Cardiologia", severity: "CRITICAL" } },
      doctor: { type: "doctor", payload: { specialty: "Cardiologia" } }
    }).then(({ patient, symptom, doctor }) => {
      cy.seed("triage", { patientId: patient.id, symptomIds: [symptom.id] }).then((triage) => {
        cy.requestAs(
          "ADMIN",
          "POST",
          "/api/appointments",
          buildAppointmentFixture({
            patientId: patient.id,
            doctorId: doctor.id,
            triageId: triage.id
          })
        ).then((response) => {
          expect(response.status).to.equal(201);
          expect(response.body.data.triageId).to.equal(triage.id);
        });
      });
    });
  });

  it("US22 CT03: rejeita quando a triagem pertence a outro paciente", () => {
    cy.seedMany({
      firstPatient: { type: "patient", payload: { document: "11111111111" } },
      secondPatient: { type: "patient", payload: { document: "22222222222", name: "Segundo paciente" } },
      symptom: { type: "symptom", payload: { specialty: "Cardiologia" } },
      doctor: { type: "doctor", payload: { specialty: "Cardiologia" } }
    }).then(({ firstPatient, secondPatient, symptom, doctor }) => {
      cy.seed("triage", { patientId: secondPatient.id, symptomIds: [symptom.id] }).then((triage) => {
        cy.requestAs(
          "ADMIN",
          "POST",
          "/api/appointments",
          buildAppointmentFixture({
            patientId: firstPatient.id,
            doctorId: doctor.id,
            triageId: triage.id
          })
        ).then((response) => {
          expectApiError(response, 409, "TRIAGE_PATIENT_MISMATCH");
        });
      });
    });
  });

  it("US22 CT04: rejeita quando a especialidade do medico diverge da triagem", () => {
    cy.seedMany({
      patient: { type: "patient" },
      symptom: { type: "symptom", payload: { specialty: "Cardiologia" } },
      doctor: { type: "doctor", payload: { specialty: "Dermatologia" } }
    }).then(({ patient, symptom, doctor }) => {
      cy.seed("triage", { patientId: patient.id, symptomIds: [symptom.id] }).then((triage) => {
        cy.requestAs(
          "ADMIN",
          "POST",
          "/api/appointments",
          buildAppointmentFixture({
            patientId: patient.id,
            doctorId: doctor.id,
            triageId: triage.id
          })
        ).then((response) => {
          expectApiError(response, 409, "DOCTOR_SPECIALTY_MISMATCH");
        });
      });
    });
  });

  it("US23 CT02: rejeita por conflito de horario", () => {
    cy.seedMany({
      patient: { type: "patient", payload: { document: "11111111111" } },
      anotherPatient: { type: "patient", payload: { document: "22222222222", name: "Outro paciente" } },
      doctor: { type: "doctor" }
    }).then(({ patient, anotherPatient, doctor }) => {
      cy.seed("appointment", {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-10T10:00:00.000Z"
      }).then(() => {
        cy.requestAs(
          "RECEPTIONIST",
          "POST",
          "/api/appointments",
          buildAppointmentFixture({
            patientId: anotherPatient.id,
            doctorId: doctor.id,
            scheduledAt: "2026-05-10T10:00:00.000Z"
          })
        ).then((response) => {
          expectApiError(response, 409, "APPOINTMENT_CONFLICT");
        });
      });
    });
  });

  it("US24 CT01: permite listar e consultar agendamentos", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("RECEPTIONIST", "GET", "/api/appointments").then((listResponse) => {
        cy.requestAs("RECEPTIONIST", "GET", `/api/appointments/${appointment.id}`).then((getResponse) => {
          expect(listResponse.status).to.equal(200);
          expect(listResponse.body.data).to.have.length(1);
          expect(getResponse.status).to.equal(200);
          expect(getResponse.body.data.id).to.equal(appointment.id);
        });
      });
    });
  });

  it("US24 CT02: rejeita consulta de agendamentos por perfil nao autorizado", () => {
    cy.requestAs("DOCTOR", "GET", "/api/appointments").then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US24 CT03: aplica filtros na consulta de agendamentos", () => {
    cy.seed("appointment", {
      scheduledAt: "2026-05-10T10:00:00.000Z"
    }).then((appointment) => {
      cy.seedMany({
        doctor: { type: "doctor", payload: { crm: "CRM-SP-777777" } },
        patient: { type: "patient", payload: { document: "33333333333" } }
      }).then(({ doctor, patient }) => {
        cy.seed("appointment", {
          doctorId: doctor.id,
          patientId: patient.id,
          scheduledAt: "2026-05-11T10:00:00.000Z"
        }).then(() => {
          cy.requestAs(
            "ADMIN",
            "GET",
            `/api/appointments?doctorId=${appointment.doctorId}&scheduledFrom=2026-05-10T00:00:00.000Z&scheduledTo=2026-05-10T23:59:59.999Z`
          ).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data).to.have.length(1);
            expect(response.body.data[0].id).to.equal(appointment.id);
          });
        });
      });
    });
  });

  it("US24 CT04: retorna nao encontrado ao consultar agendamento inexistente", () => {
    cy.requestAs("ADMIN", "GET", "/api/appointments/999").then((response) => {
      expectApiError(response, 404, "APPOINTMENT_NOT_FOUND");
    });
  });

  it("US25 CT01: permite editar observacoes de agendamento SCHEDULED", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("RECEPTIONIST", "PUT", `/api/appointments/${appointment.id}`, {
        notes: "  Retorno no fim da tarde  "
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.notes).to.equal("Retorno no fim da tarde");
        expect(response.body.data.updatedByUserId).to.be.a("string");
      });
    });
  });

  it("US25 CT02: permite reagendar consulta para novo horario sem conflito", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("ADMIN", "PUT", `/api/appointments/${appointment.id}`, {
        scheduledAt: "2026-05-11T10:00:00-03:00"
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.scheduledAt).to.equal("2026-05-11T13:00:00.000Z");
      });
    });
  });

  it("US25 CT02: permite editar agendamento com triagem vinculada alterando apenas horario e observacoes", () => {
    cy.seedMany({
      patient: { type: "patient", payload: { document: "55555555555" } },
      symptom: { type: "symptom", payload: { specialty: "Cardiologia", severity: "HIGH" } },
      doctor: { type: "doctor", payload: { specialty: "Cardiologia", crm: "CRM-SP-919191" } }
    }).then(({ patient, symptom, doctor }) => {
      cy.seed("triage", { patientId: patient.id, symptomIds: [symptom.id] }).then((triage) => {
        cy.seed("appointment", {
          patientId: patient.id,
          doctorId: doctor.id,
          triageId: triage.id,
          scheduledAt: "2026-05-15T10:00:00.000Z"
        }).then((appointment) => {
          cy.requestAs("ADMIN", "PUT", `/api/appointments/${appointment.id}`, {
            scheduledAt: "2026-05-16T11:30:00.000Z",
            notes: "Reagendado apos confirmacao do paciente."
          }).then((response) => {
            expect(response.status).to.equal(200);
            expect(response.body.data.triageId).to.equal(triage.id);
            expect(response.body.data.doctorId).to.equal(doctor.id);
            expect(response.body.data.scheduledAt).to.equal("2026-05-16T11:30:00.000Z");
            expect(response.body.data.notes).to.equal("Reagendado apos confirmacao do paciente.");
          });
        });
      });
    });
  });

  it("US25 CT03: rejeita reagendamento para horario em conflito", () => {
    cy.seed("doctor").then((doctor) => {
      cy.seed("appointment", {
        doctorId: doctor.id,
        scheduledAt: "2026-05-10T10:00:00.000Z"
      }).then((firstAppointment) => {
        cy.seed("patient", { document: "33333333333" }).then((patient) => {
          cy.seed("appointment", {
            doctorId: doctor.id,
            patientId: patient.id,
            scheduledAt: "2026-05-11T10:00:00.000Z"
          }).then(() => {
            cy.requestAs("RECEPTIONIST", "PUT", `/api/appointments/${firstAppointment.id}`, {
              scheduledAt: "2026-05-11T10:00:00.000Z"
            }).then((response) => {
              expectApiError(response, 409, "APPOINTMENT_CONFLICT");
            });
          });
        });
      });
    });
  });

  it("US25 CT04: rejeita troca para medico incompativel com a triagem", () => {
    cy.seedMany({
      patient: { type: "patient" },
      symptom: { type: "symptom", payload: { specialty: "Cardiologia" } },
      compatibleDoctor: { type: "doctor", payload: { specialty: "Cardiologia" } },
      incompatibleDoctor: { type: "doctor", payload: { specialty: "Dermatologia", crm: "CRM-SP-888888" } }
    }).then(({ patient, symptom, compatibleDoctor, incompatibleDoctor }) => {
      cy.seed("triage", { patientId: patient.id, symptomIds: [symptom.id] }).then((triage) => {
        cy.seed("appointment", {
          patientId: patient.id,
          doctorId: compatibleDoctor.id,
          triageId: triage.id
        }).then((appointment) => {
          cy.requestAs("ADMIN", "PUT", `/api/appointments/${appointment.id}`, {
            doctorId: incompatibleDoctor.id
          }).then((response) => {
            expectApiError(response, 409, "DOCTOR_SPECIALTY_MISMATCH");
          });
        });
      });
    });
  });

  it("US25 CT05: rejeita edicao de agendamento cancelado", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("ADMIN", "DELETE", `/api/appointments/${appointment.id}`).then(() => {
        cy.requestAs("ADMIN", "PUT", `/api/appointments/${appointment.id}`, {
          notes: "nova observacao"
        }).then((response) => {
          expectApiError(response, 409, "APPOINTMENT_CANNOT_BE_EDITED");
        });
      });
    });
  });

  it("US25 CT07: retorna nao encontrado ao editar agendamento inexistente", () => {
    cy.requestAs("ADMIN", "PUT", "/api/appointments/999", {
      notes: "nova observacao"
    }).then((response) => {
      expectApiError(response, 404, "APPOINTMENT_NOT_FOUND");
    });
  });

  it("US26 CT01: cancela agendamento SCHEDULED com sucesso", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("RECEPTIONIST", "DELETE", `/api/appointments/${appointment.id}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.status).to.equal("CANCELLED");
        expect(response.body.data.updatedByUserId).to.be.a("string");
      });
    });
  });

  it("US26 CT02: rejeita cancelamento por falta de permissao", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("DOCTOR", "DELETE", `/api/appointments/${appointment.id}`).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US26 CT03: retorna nao encontrado ao cancelar agendamento inexistente", () => {
    cy.requestAs("ADMIN", "DELETE", "/api/appointments/999").then((response) => {
      expectApiError(response, 404, "APPOINTMENT_NOT_FOUND");
    });
  });

  it("US26 CT04: rejeita cancelamento de agendamento ja cancelado", () => {
    cy.seed("appointment").then((appointment) => {
      cy.requestAs("ADMIN", "DELETE", `/api/appointments/${appointment.id}`).then(() => {
        cy.requestAs("ADMIN", "DELETE", `/api/appointments/${appointment.id}`).then((response) => {
          expectApiError(response, 409, "APPOINTMENT_ALREADY_CANCELLED");
        });
      });
    });
  });

  it("US26 CT05: permite novo agendamento no mesmo horario apos cancelamento", () => {
    cy.seedMany({
      doctor: { type: "doctor" },
      patient: { type: "patient" }
    }).then(({ doctor, patient }) => {
      cy.seed("appointment", {
        patientId: patient.id,
        doctorId: doctor.id,
        scheduledAt: "2026-05-12T10:00:00.000Z"
      }).then((firstAppointment) => {
        cy.requestAs("ADMIN", "DELETE", `/api/appointments/${firstAppointment.id}`).then(() => {
          cy.seed("patient", { document: "44444444444" }).then((anotherPatient) => {
            cy.requestAs(
              "ADMIN",
              "POST",
              "/api/appointments",
              buildAppointmentFixture({
                patientId: anotherPatient.id,
                doctorId: doctor.id,
                scheduledAt: "2026-05-12T10:00:00.000Z"
              })
            ).then((response) => {
              expect(response.status).to.equal(201);
              expect(response.body.data.status).to.equal("SCHEDULED");
            });
          });
        });
      });
    });
  });
});
