describe("API - Auth", () => {
  beforeEach(() => cy.resetApiData());

  it("US02 CT01: autentica usuario ativo com credenciais validas", () => {
    cy.loginRequest({ email: "admin@clinica.local", password: "Admin@123" })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.token).to.be.a("string");
        expect(response.body.data.user.email).to.eq("admin@clinica.local");
      });
  });

  it("US02 CT01.1: autentica usuario receptionist semeado para o fluxo web", () => {
    cy.loginRequest({ email: "recepcao@clinica.local", password: "Recepcao@123" })
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.user.role).to.eq("RECEPTIONIST");
      });
  });

  it("US02 CT02: rejeita autenticacao de usuario inativo", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", {
      name: "Inativo",
      email: "inativo@clinica.local",
      password: "Senha@123",
      role: "RECEPTIONIST"
    }).then((createResponse) => {
      return cy.apiRequestAs("ADMIN", "DELETE", `/users/${createResponse.body.data.id}`);
    }).then((deleteResponse) => {
      expect(deleteResponse.status).to.eq(200);
      return cy.loginRequest({ email: "inativo@clinica.local", password: "Senha@123" });
    }).then((response) => cy.apiExpectError(response, 403, "USER_INACTIVE"));
  });

  it("US02 CT03: rejeita autenticacao com credenciais invalidas", () => {
    cy.loginRequest({ email: "admin@clinica.local", password: "SenhaErrada@123" })
      .then((response) => cy.apiExpectError(response, 401, "INVALID_CREDENTIALS"));
  });
});
