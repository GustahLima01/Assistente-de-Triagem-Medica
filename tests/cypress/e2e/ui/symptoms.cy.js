const { buildSymptom } = require("../../support/factories");

describe("Frontend - sintomas", () => {
  it("cadastra, edita e inativa um sintoma", () => {
    const symptom = buildSymptom();

    cy.loginAs("ADMIN");
    cy.navigateToRoute("symptoms");

    cy.get("#symptom-new-button").click();
    cy.get("#symptom-name").type(symptom.name);
    cy.get("#symptom-description").type(symptom.description);
    cy.get("#symptom-severity").select(symptom.severity);
    cy.get("#symptom-specialty").type(symptom.specialty);
    cy.get("#symptom-form").submit();

    cy.get("#global-feedback").should("contain", "Sintoma");
    cy.get("#symptom-filter-name").type(symptom.name);
    cy.get("#symptom-filter-form").submit();
    cy.contains("#symptoms-table-body tr", symptom.name).should("be.visible");

    cy.contains("#symptoms-table-body tr", symptom.name).find("[data-symptom-edit]").click();
    cy.get("#symptom-description").clear().type("Sintoma atualizado pela automacao.");
    cy.get("#symptom-severity").select("CRITICAL");
    cy.get("#symptom-form").submit();
    cy.get("#global-feedback").should("contain", "Sintoma");
    cy.contains("#symptoms-table-body tr", symptom.name).should("contain", "Crítica");

    cy.contains("#symptoms-table-body tr", symptom.name).find("[data-symptom-toggle]").click();
    cy.get("#global-feedback").should("contain", "Sintoma");
  });

  it("US11 CT04: rejeita atualizacao ao remover a especialidade do sintoma", () => {
    const symptom = buildSymptom();

    cy.loginAs("ADMIN");
    cy.createSymptomByApi(symptom).then((createdSymptom) => {
      cy.navigateToRoute("symptoms");
      cy.get("#symptom-filter-name").type(createdSymptom.name);
      cy.get("#symptom-filter-form").submit();
      cy.contains("#symptoms-table-body tr", createdSymptom.name).find("[data-symptom-edit]").click();
      cy.get("#symptom-specialty").clear();
      cy.get("#symptom-form").submit();
      cy.get("#symptom-form-error").should("be.visible").and("contain", "especialidade");
    });
  });
});
