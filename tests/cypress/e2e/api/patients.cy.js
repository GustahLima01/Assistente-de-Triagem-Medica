const { buildAppointmentFixture, buildPatientFixture } = require("../../../fixtures");
const { expectApiError } = require("../../support/api");
const {
  createResourceAs,
  deleteResourceAs,
  expectSingleResourceLookup,
  getResourceAs,
  listResourcesAs,
  updateResourceAs
} = require("../../support/resource-api");

describe("Patients API", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US05 CT01: cria paciente convertendo opcionais vazios para null", () => {
    createResourceAs("RECEPTIONIST", "/api/patients", buildPatientFixture({ email: "", notes: "" })).then(
      (response) => {
        expect(response.status).to.equal(201);
        expect(response.body.data.email).to.equal(null);
        expect(response.body.data.notes).to.equal(null);
      }
    );
  });

  it("US05 CT02: rejeita criacao de paciente por falta de permissao", () => {
    createResourceAs("DOCTOR", "/api/patients", buildPatientFixture()).then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US05 CT03: rejeita criacao sem campos obrigatorios", () => {
    createResourceAs("ADMIN", "/api/patients", {
      name: "Paciente incompleto"
    }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US05 CT04: rejeita criacao com data invalida", () => {
    createResourceAs("ADMIN", "/api/patients", buildPatientFixture({ birthDate: "2026-99-99" })).then(
      (response) => {
        expectApiError(response, 400, "VALIDATION_ERROR");
      }
    );
  });

  it("US05 CT05: rejeita criacao com documento duplicado", () => {
    cy.seed("patient").then((patient) => {
      createResourceAs("ADMIN", "/api/patients", buildPatientFixture({ document: patient.document })).then(
        (response) => {
          expectApiError(response, 409, "PATIENT_DOCUMENT_ALREADY_EXISTS");
        }
      );
    });
  });

  it("US06 CT01: permite listar e consultar pacientes por perfil autorizado", () => {
    cy.seed("patient").then((patient) => {
      expectSingleResourceLookup("RECEPTIONIST", "/api/patients", patient.id);
    });
  });

  it("US06 CT02: rejeita consulta de pacientes por perfil nao autorizado", () => {
    listResourcesAs("DOCTOR", "/api/patients").then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US06 CT03: aplica filtros na consulta de pacientes", () => {
    cy.seedMany({
      firstPatient: { type: "patient", payload: { name: "Joao da Costa", document: "11111111111" } },
      secondPatient: { type: "patient", payload: { name: "Maria Silva", document: "22222222222" } }
    }).then(({ firstPatient }) => {
      listResourcesAs("ADMIN", "/api/patients", `?document=${firstPatient.document}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data).to.have.length(1);
        expect(response.body.data[0].name).to.equal("Joao da Costa");
      });
    });
  });

  it("US06 CT04: retorna nao encontrado ao consultar paciente inexistente", () => {
    getResourceAs("ADMIN", "/api/patients", 999).then((response) => {
      expectApiError(response, 404, "PATIENT_NOT_FOUND");
    });
  });

  it("US07 CT01: atualiza paciente convertendo opcionais vazios para null", () => {
    cy.seed("patient").then((patient) => {
      updateResourceAs("RECEPTIONIST", "/api/patients", patient.id, {
        birthDate: "1991-06-11",
        document: "33333333333",
        email: "",
        notes: ""
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.email).to.equal(null);
        expect(response.body.data.notes).to.equal(null);
      });
    });
  });

  it("US07 CT02: rejeita atualizacao por falta de permissao", () => {
    cy.seed("patient").then((patient) => {
      updateResourceAs("DOCTOR", "/api/patients", patient.id, {
        name: "Nome bloqueado"
      }).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US07 CT03: rejeita atualizacao com data invalida", () => {
    cy.seed("patient").then((patient) => {
      updateResourceAs("ADMIN", "/api/patients", patient.id, {
        birthDate: "invalida"
      }).then((response) => {
        expectApiError(response, 400, "VALIDATION_ERROR");
      });
    });
  });

  it("US07 CT04: rejeita atualizacao com documento duplicado", () => {
    cy.seedMany({
      firstPatient: { type: "patient", payload: { document: "11111111111" } },
      secondPatient: { type: "patient", payload: { document: "22222222222", name: "Outro paciente" } }
    }).then(({ firstPatient }) => {
      updateResourceAs("ADMIN", "/api/patients", firstPatient.id, {
        document: "22222222222"
      }).then((response) => {
        expectApiError(response, 409, "PATIENT_DOCUMENT_ALREADY_EXISTS");
      });
    });
  });

  it("US08 CT01: inativa paciente e impede novo uso em triagem e agendamento", () => {
    cy.seedMany({
      patient: { type: "inactivePatient" },
      symptom: { type: "symptom" },
      doctor: { type: "doctor" }
    }).then(({ patient, symptom, doctor }) => {
      cy.requestAs("ADMIN", "POST", "/api/triages", {
        patientId: patient.id,
        symptomIds: [symptom.id]
      }).then((triageResponse) => {
        cy.requestAs(
          "ADMIN",
          "POST",
          "/api/appointments",
          buildAppointmentFixture({
            patientId: patient.id,
            doctorId: doctor.id
          })
        ).then((appointmentResponse) => {
          expectApiError(triageResponse, 409, "PATIENT_INACTIVE");
          expectApiError(appointmentResponse, 409, "PATIENT_INACTIVE");
        });
      });
    });
  });

  it("US08 CT02: rejeita inativacao por perfil nao autorizado", () => {
    cy.seed("patient").then((patient) => {
      deleteResourceAs("DOCTOR", "/api/patients", patient.id).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });
});
