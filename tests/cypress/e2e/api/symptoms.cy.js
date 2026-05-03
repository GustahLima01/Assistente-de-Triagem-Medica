const { buildSymptomFixture } = require("../../../fixtures");
const { expectApiError } = require("../../support/api");
const {
  createResourceAs,
  deleteResourceAs,
  expectSingleResourceLookup,
  getResourceAs,
  listResourcesAs,
  updateResourceAs
} = require("../../support/resource-api");

describe("Symptoms API", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US09 CT01: cria sintoma com severidade valida e especialidade informada", () => {
    createResourceAs("ADMIN", "/api/symptoms", buildSymptomFixture()).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.data.severity).to.equal("HIGH");
    });
  });

  it("US09 CT02: rejeita criacao de sintoma por perfil nao admin", () => {
    createResourceAs("RECEPTIONIST", "/api/symptoms", buildSymptomFixture()).then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US09 CT03: rejeita criacao sem campos obrigatorios", () => {
    createResourceAs("ADMIN", "/api/symptoms", { name: "Sintoma" }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US09 CT04: rejeita criacao com severidade invalida", () => {
    createResourceAs("ADMIN", "/api/symptoms", buildSymptomFixture({ severity: "URGENT" })).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US09 CT05: rejeita criacao sem especialidade", () => {
    createResourceAs("ADMIN", "/api/symptoms", buildSymptomFixture({ specialty: "" })).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US10 CT01: permite listar e consultar sintomas", () => {
    cy.seed("symptom").then((symptom) => {
      expectSingleResourceLookup("ADMIN", "/api/symptoms", symptom.id);
    });
  });

  it("US10 CT02: rejeita consulta de sintomas por perfil nao admin", () => {
    listResourcesAs("RECEPTIONIST", "/api/symptoms").then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US10 CT03: retorna apenas sintomas ativos disponiveis para triagem", () => {
    cy.seedMany({
      activeSymptom: { type: "symptom", payload: { name: "Ativo" } },
      inactiveSymptom: { type: "inactiveSymptom", payload: { name: "Inativo", specialty: "Neurologia" } }
    }).then(() => {
      listResourcesAs("ADMIN", "/api/symptoms").then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data).to.have.length(1);
        expect(response.body.data[0].name).to.equal("Ativo");
      });
    });
  });

  it("US10 CT04: retorna nao encontrado ao consultar sintoma inexistente", () => {
    getResourceAs("ADMIN", "/api/symptoms", 999).then((response) => {
      expectApiError(response, 404, "SYMPTOM_NOT_FOUND");
    });
  });

  it("US11 CT01: atualiza sintoma com severidade valida e especialidade informada", () => {
    cy.seed("symptom").then((symptom) => {
      updateResourceAs("ADMIN", "/api/symptoms", symptom.id, {
        severity: "CRITICAL",
        specialty: "Neurologia",
        description: "Descricao atualizada"
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.severity).to.equal("CRITICAL");
      });
    });
  });

  it("US11 CT02: rejeita atualizacao de sintoma por perfil nao admin", () => {
    cy.seed("symptom").then((symptom) => {
      updateResourceAs("RECEPTIONIST", "/api/symptoms", symptom.id, {
        severity: "LOW"
      }).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US11 CT03: rejeita atualizacao com severidade invalida", () => {
    cy.seed("symptom").then((symptom) => {
      updateResourceAs("ADMIN", "/api/symptoms", symptom.id, {
        severity: "INVALIDA"
      }).then((response) => {
        expectApiError(response, 400, "VALIDATION_ERROR");
      });
    });
  });

  it("US11 CT04: rejeita atualizacao ao remover a especialidade do sintoma", () => {
    cy.seed("symptom").then((symptom) => {
      updateResourceAs("ADMIN", "/api/symptoms", symptom.id, {
        specialty: ""
      }).then((response) => {
        expectApiError(response, 400, "VALIDATION_ERROR");
      });
    });
  });

  it("US12 CT01: inativa sintoma e impede uso em consulta de especialidade e triagem", () => {
    cy.seedMany({
      patient: { type: "patient" },
      symptom: { type: "inactiveSymptom" }
    }).then(({ patient, symptom }) => {
      cy.requestAs("ADMIN", "POST", "/api/triages/specialty-consult", {
        symptomIds: [symptom.id]
      }).then((consultResponse) => {
        cy.requestAs("ADMIN", "POST", "/api/triages", {
          patientId: patient.id,
          symptomIds: [symptom.id]
        }).then((triageResponse) => {
          expectApiError(consultResponse, 409, "SYMPTOM_INACTIVE");
          expectApiError(triageResponse, 409, "SYMPTOM_INACTIVE");
        });
      });
    });
  });

  it("US12 CT02: rejeita inativacao de sintoma por perfil nao admin", () => {
    cy.seed("symptom").then((symptom) => {
      deleteResourceAs("RECEPTIONIST", "/api/symptoms", symptom.id).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });
});
