describe("Frontend - menus principais", () => {
  const adminRoutes = [
    { route: "dashboard", title: "Atendimento", selector: "#dashboard-patient-search-form" },
    { route: "patients", title: "Pacientes", selector: "#patients-table-body" },
    { route: "triage", title: "Nova triagem", selector: "#triage-selected-patient" },
    { route: "appointments", title: "Agendamentos", selector: "#appointments-table-body" },
    { route: "doctors", title: "Médicos", selector: "#doctors-table-body" },
    { route: "symptoms", title: "Sintomas", selector: "#symptoms-table-body" },
    { route: "users", title: "Usuários", selector: "#users-table-body" }
  ];

  it("permite ao admin navegar e carregar todas as telas do menu", () => {
    cy.loginAs("ADMIN");

    adminRoutes.forEach(({ route, title, selector }) => {
      cy.navigateToRoute(route);
      cy.get("#page-title").should("contain", title);
      cy.get(selector).should("be.visible");
    });
  });

  it("restringe menus administrativos para o perfil recepcao", () => {
    cy.loginAs("RECEPTIONIST");

    cy.get("[data-route=\"dashboard\"]").should("be.visible");
    cy.get("[data-route=\"patients\"]").should("be.visible");
    cy.get("[data-route=\"triage\"]").should("be.visible");
    cy.get("[data-route=\"appointments\"]").should("be.visible");
    cy.get("[data-route=\"doctors\"]").should("not.be.visible");
    cy.get("[data-route=\"symptoms\"]").should("not.be.visible");
    cy.get("[data-route=\"users\"]").should("not.be.visible");
  });
});
