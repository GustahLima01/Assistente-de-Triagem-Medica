const { buildUser } = require("../../support/factories");

describe("Frontend - usuarios", () => {
  it("cadastra, edita e inativa um usuario", () => {
    const user = buildUser();

    cy.loginAs("ADMIN");
    cy.navigateToRoute("users");

    cy.get("#user-new-button").click();
    cy.get("#user-name").type(user.name);
    cy.get("#user-email").type(user.email);
    cy.get("#user-role").select(user.role);
    cy.get("#user-password").type(user.password);
    cy.get("#user-form").submit();

    cy.get("#global-feedback").should("contain", "Usuário");
    cy.contains("#users-table-body tr", user.name).should("be.visible");

    cy.contains("#users-table-body tr", user.name).find("[data-user-edit]").click();
    cy.get("#user-name").clear().type(`${user.name} Atualizado`);
    cy.get("#user-form").submit();
    cy.get("#global-feedback").should("contain", "Usuário");
    cy.contains("#users-table-body tr", `${user.name} Atualizado`).should("be.visible");

    cy.contains("#users-table-body tr", `${user.name} Atualizado`).find("[data-user-toggle]").click();
    cy.get("#global-feedback").should("contain", "Usuário");
  });
});
