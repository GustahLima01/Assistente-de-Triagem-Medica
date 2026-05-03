const { buildAppointmentFixture, buildDoctorFixture } = require("../../../fixtures");
const { expectApiError } = require("../../support/api");
const {
  createResourceAs,
  deleteResourceAs,
  expectSingleResourceLookup,
  getResourceAs,
  listResourcesAs,
  updateResourceAs
} = require("../../support/resource-api");

describe("Doctors API", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US13 CT01: cria medico com CRM unico", () => {
    createResourceAs("ADMIN", "/api/doctors", buildDoctorFixture()).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.data.crm).to.match(/^CRM-SP-/);
    });
  });

  it("US13 CT02: rejeita criacao de medico por falta de permissao", () => {
    createResourceAs("RECEPTIONIST", "/api/doctors", buildDoctorFixture()).then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US13 CT03: rejeita criacao sem campos obrigatorios", () => {
    createResourceAs("ADMIN", "/api/doctors", { name: "Medico" }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US13 CT04: rejeita criacao com CRM duplicado", () => {
    cy.seed("doctor").then((doctor) => {
      createResourceAs("ADMIN", "/api/doctors", buildDoctorFixture({ crm: doctor.crm })).then((response) => {
        expectApiError(response, 409, "DOCTOR_CRM_ALREADY_EXISTS");
      });
    });
  });

  it("US14 CT01: permite listar e consultar medicos", () => {
    cy.seed("doctor").then((doctor) => {
      expectSingleResourceLookup("ADMIN", "/api/doctors", doctor.id);
    });
  });

  it("US14 CT02: rejeita consulta de medicos por perfil nao admin", () => {
    listResourcesAs("RECEPTIONIST", "/api/doctors").then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US14 CT03: retorna apenas medicos ativos por padrao", () => {
    cy.seedMany({
      activeDoctor: { type: "doctor", payload: { name: "Ativo" } },
      inactiveDoctor: { type: "inactiveDoctor", payload: { crm: "CRM-SP-999999", name: "Inativo" } }
    }).then(() => {
      listResourcesAs("ADMIN", "/api/doctors").then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data).to.have.length(1);
        expect(response.body.data[0].name).to.equal("Ativo");
      });
    });
  });

  it("US14 CT04: retorna nao encontrado ao consultar medico inexistente", () => {
    getResourceAs("ADMIN", "/api/doctors", 999).then((response) => {
      expectApiError(response, 404, "DOCTOR_NOT_FOUND");
    });
  });

  it("US15 CT01: atualiza medico mantendo CRM unico", () => {
    cy.seed("doctor").then((doctor) => {
      updateResourceAs("ADMIN", "/api/doctors", doctor.id, {
        name: "Dra. Atualizada",
        specialty: "Neurologia",
        email: "atualizada@clinica.local"
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.specialty).to.equal("Neurologia");
      });
    });
  });

  it("US15 CT02: rejeita atualizacao de medico por falta de permissao", () => {
    cy.seed("doctor").then((doctor) => {
      updateResourceAs("RECEPTIONIST", "/api/doctors", doctor.id, {
        specialty: "Pediatria"
      }).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US15 CT03: rejeita atualizacao com CRM duplicado", () => {
    cy.seedMany({
      firstDoctor: { type: "doctor", payload: { crm: "CRM-SP-111111" } },
      secondDoctor: { type: "doctor", payload: { crm: "CRM-SP-222222", name: "Outra medica" } }
    }).then(({ firstDoctor }) => {
      updateResourceAs("ADMIN", "/api/doctors", firstDoctor.id, {
        crm: "CRM-SP-222222"
      }).then((response) => {
        expectApiError(response, 409, "DOCTOR_CRM_ALREADY_EXISTS");
      });
    });
  });

  it("US16 CT01: inativa medico e impede novo agendamento", () => {
    cy.seedMany({
      doctor: { type: "inactiveDoctor" },
      patient: { type: "patient" }
    }).then(({ doctor, patient }) => {
      cy.requestAs(
        "ADMIN",
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

  it("US16 CT02: rejeita inativacao por perfil nao admin", () => {
    cy.seed("doctor").then((doctor) => {
      deleteResourceAs("RECEPTIONIST", "/api/doctors", doctor.id).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });
});
