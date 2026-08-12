const { buildDoctor } = require("../../support/factories");

describe("Frontend - medicos", () => {
  it("cadastra, edita e inativa um medico", () => {
    const doctor = buildDoctor();

    cy.loginAs("ADMIN");
    cy.navigateToRoute("doctors");

    cy.get("#doctor-new-button").click();
    cy.get("#doctor-name").type(doctor.name);
    cy.get("#doctor-crm").type(doctor.crm);
    cy.get("#doctor-specialty").type(doctor.specialty);
    cy.get("#doctor-phone").type(doctor.phone);
    cy.get("#doctor-email").type(doctor.email);
    cy.get("#doctor-form").submit();

    cy.get("#global-feedback").should("contain", "Médico");
    cy.get("#doctor-filter-name").type(doctor.name);
    cy.get("#doctor-filter-form").submit();
    cy.contains("#doctors-table-body tr", doctor.name).should("be.visible");

    cy.contains("#doctors-table-body tr", doctor.name).find("[data-doctor-edit]").click();
    cy.get("#doctor-specialty").clear().type("Cardiologia");
    cy.get("#doctor-form").submit();
    cy.get("#global-feedback").should("contain", "Médico");
    cy.contains("#doctors-table-body tr", doctor.name).should("contain", "Cardiologia");

    cy.contains("#doctors-table-body tr", doctor.name).find("[data-doctor-toggle]").click();
    cy.get("#global-feedback").should("contain", "Médico");
  });
});
