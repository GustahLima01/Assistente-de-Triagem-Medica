const { buildTriageFixture } = require("../../../fixtures");
const { expectApiError } = require("../../support/api");

describe("Triages API", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US17 CT01 e US20 CT01: registra triagem desconsiderando IDs duplicados e persiste resultado consolidado", () => {
    cy.seedMany({
      patient: { type: "patient" },
      firstSymptom: { type: "symptom", payload: { severity: "HIGH", specialty: "Cardiologia" } },
      secondSymptom: {
        type: "symptom",
        payload: { name: "Febre", severity: "MEDIUM", specialty: "Clinico Geral" }
      }
    }).then(({ patient, firstSymptom, secondSymptom }) => {
      cy.requestAs("RECEPTIONIST", "POST", "/api/triages", {
        patientId: patient.id,
        symptomIds: [firstSymptom.id, firstSymptom.id, secondSymptom.id],
        ...buildTriageFixture()
      }).then((response) => {
        expect(response.status).to.equal(201);
        expect(response.body.data.symptomIds).to.deep.equal([firstSymptom.id, secondSymptom.id]);
        expect(response.body.data.suggestedSpecialty).to.equal("Cardiologia");
        expect(response.body.data.priority).to.equal("HIGH");
        expect(response.body.data.createdByUserId).to.be.a("string");
      });
    });
  });

  it("US17 CT02: rejeita registro de triagem por falta de permissao", () => {
    cy.seedMany({
      patient: { type: "patient" },
      symptom: { type: "symptom" }
    }).then(({ patient, symptom }) => {
      cy.requestAs("DOCTOR", "POST", "/api/triages", {
        patientId: patient.id,
        symptomIds: [symptom.id]
      }).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US17 CT03: rejeita triagem para paciente inativo", () => {
    cy.seedMany({
      patient: { type: "inactivePatient" },
      symptom: { type: "symptom" }
    }).then(({ patient, symptom }) => {
      cy.requestAs("ADMIN", "POST", "/api/triages", {
        patientId: patient.id,
        symptomIds: [symptom.id]
      }).then((response) => {
        expectApiError(response, 409, "PATIENT_INACTIVE");
      });
    });
  });

  it("US17 CT04: rejeita triagem com sintoma inativo", () => {
    cy.seedMany({
      patient: { type: "patient" },
      symptom: { type: "inactiveSymptom" }
    }).then(({ patient, symptom }) => {
      cy.requestAs("ADMIN", "POST", "/api/triages", {
        patientId: patient.id,
        symptomIds: [symptom.id]
      }).then((response) => {
        expectApiError(response, 409, "SYMPTOM_INACTIVE");
      });
    });
  });

  it("US17 CT05 e US20 CT03: rejeita triagem sem dados essenciais", () => {
    cy.requestAs("RECEPTIONIST", "POST", "/api/triages", {
      patientId: ""
    }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US18 CT01: retorna especialidade com maior soma de pesos", () => {
    cy.seedMany({
      firstSymptom: { type: "symptom", payload: { severity: "CRITICAL", specialty: "Cardiologia" } },
      secondSymptom: { type: "symptom", payload: { name: "Tosse", severity: "LOW", specialty: "Pneumologia" } }
    }).then(({ firstSymptom, secondSymptom }) => {
      cy.requestAs("RECEPTIONIST", "POST", "/api/triages/specialty-consult", {
        symptomIds: [firstSymptom.id, secondSymptom.id]
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.suggestedSpecialty).to.equal("Cardiologia");
      });
    });
  });

  it("US18 CT02 e US19 CT02: rejeita consulta de especialidade por falta de permissao", () => {
    cy.seed("symptom").then((symptom) => {
      cy.requestAs("DOCTOR", "POST", "/api/triages/specialty-consult", {
        symptomIds: [symptom.id]
      }).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US18 CT03: rejeita consulta com symptomIds invalido", () => {
    cy.requestAs("ADMIN", "POST", "/api/triages/specialty-consult", {
      symptomIds: []
    }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US18 CT04: desempata especialidade por ordem alfabetica", () => {
    cy.seedMany({
      cardiology: { type: "symptom", payload: { severity: "HIGH", specialty: "Cardiologia" } },
      dermatology: { type: "symptom", payload: { name: "Mancha", severity: "HIGH", specialty: "Dermatologia" } }
    }).then(({ cardiology, dermatology }) => {
      cy.requestAs("ADMIN", "POST", "/api/triages/specialty-consult", {
        symptomIds: [dermatology.id, cardiology.id]
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.suggestedSpecialty).to.equal("Cardiologia");
      });
    });
  });

  it("US19 CT01: retorna a maior severidade entre os sintomas informados", () => {
    cy.seedMany({
      low: { type: "symptom", payload: { severity: "LOW", specialty: "Clinico Geral" } },
      critical: {
        type: "symptom",
        payload: { name: "Dispneia", severity: "CRITICAL", specialty: "Pneumologia" }
      }
    }).then(({ low, critical }) => {
      cy.requestAs("RECEPTIONIST", "POST", "/api/triages/specialty-consult", {
        symptomIds: [low.id, critical.id]
      }).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.priority).to.equal("CRITICAL");
      });
    });
  });

  it("US19 CT03: rejeita consulta de prioridade quando o sintoma esta inativo", () => {
    cy.seed("inactiveSymptom").then((inactiveSymptom) => {
      cy.requestAs("ADMIN", "POST", "/api/triages/specialty-consult", {
        symptomIds: [inactiveSymptom.id]
      }).then((response) => {
        expectApiError(response, 409, "SYMPTOM_INACTIVE");
      });
    });
  });
});
