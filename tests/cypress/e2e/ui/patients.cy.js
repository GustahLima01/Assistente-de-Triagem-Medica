const { buildPatient } = require("../../support/factories");

describe("Frontend - pacientes", () => {
  it("cadastra, edita e encaminha um paciente para triagem", () => {
    const patient = buildPatient();

    cy.loginAs("ADMIN");
    cy.navigateToRoute("patients");

    cy.get("#patient-new-button").click();
    cy.get("#patient-form-title").should("contain", "Cadastrar paciente");
    cy.get("#patient-name").type(patient.name);
    cy.get("#patient-document").type(patient.document);
    cy.setCustomPicker("#patient-birthdate", patient.birthDate);
    cy.get("#patient-phone").type(patient.phone);
    cy.get("#patient-email").type(patient.email);
    cy.get("#patient-notes").type(patient.notes);
    cy.get("#patient-form").submit();

    cy.get("#global-feedback").should("contain", "Paciente");
    cy.get("#patient-filter-document").type(patient.document);
    cy.get("#patient-filter-form").submit();
    cy.contains("#patients-table-body tr", patient.name).should("be.visible");

    cy.get("[data-patient-edit]").first().click();
    cy.get("#patient-phone").clear().type("+5511777777777");
    cy.get("#patient-notes").clear().type("Paciente atualizado pela automacao.");
    cy.get("#patient-form").submit();
    cy.get("#global-feedback").should("contain", "Paciente");

    cy.contains("#patients-table-body tr", patient.name)
      .find("[data-patient-triage]")
      .click();

    cy.get("#route-triage").should("be.visible");
    cy.get("#triage-selected-patient").should("contain", patient.name);
  });
});
