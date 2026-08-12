const { buildPatient, nextSameDayAppointmentIso } = require("../../support/factories");

describe("Frontend - jornada E2E de atendimento", () => {
  it("inicia atendimento, registra triagem e confirma agendamento para o dia atual", () => {
    const patient = buildPatient({
      name: `Paciente Jornada ${Date.now()}`
    });
    const scheduledAt = nextSameDayAppointmentIso();

    cy.createPatientByApi(patient, "ADMIN");
    cy.loginAs("ADMIN");

    cy.get("#dashboard-patient-document").type(patient.document);
    cy.get("#dashboard-patient-search-form").submit();
    cy.contains("#dashboard-patient-results tr", patient.name)
      .find("[data-dashboard-triage]")
      .click();

    cy.get("#route-triage").should("be.visible");
    cy.get("#triage-selected-patient").should("contain", patient.name);
    cy.intercept("GET", "/web-api/symptoms*").as("reloadTriageSymptoms");
    cy.get("#triage-reload-symptoms").click();
    cy.wait("@reloadTriageSymptoms")
      .its("response.statusCode")
      .should("be.oneOf", [200, 304]);
    cy.get("#triage-symptom-list [data-symptom-select]")
      .should("have.length.at.least", 2);
    cy.get("[data-symptom-select]").eq(0).check({ force: true });
    cy.get("[data-symptom-select]").eq(1).check({ force: true });
    cy.get("#triage-notes").type("Triagem E2E criada pela automacao Cypress.");
    cy.get("#triage-consult-button").click();

    cy.get("#triage-result").should("contain", "Sugestão");
    cy.get("#triage-result-create").click();

    cy.get("#route-appointments").should("be.visible");
    cy.get("#appointment-patient-id").invoke("val").should("not.be.empty");
    cy.get("#appointment-triage-id").invoke("val").should("not.be.empty");
    cy.get("#appointment-doctor-id").invoke("val").should("not.be.empty");
    cy.setCustomPicker("#appointment-scheduled-at", scheduledAt);
    cy.get("#appointment-notes").type("Agendamento criado na jornada E2E.");
    cy.get("#appointment-form").submit();

    cy.get("#global-feedback").should("contain", "Consulta agendada");
    cy.contains("#appointments-table-body tr", patient.name).should("be.visible");

    cy.navigateToRoute("dashboard");
    cy.get("#dashboard-appointments-list").should("contain", patient.name);
  });
});
