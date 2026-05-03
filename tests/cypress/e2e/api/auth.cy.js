const { expectApiError } = require("../../support/api");

describe("POST /api/auth/login", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US02 CT01: autentica usuario ativo com credenciais validas", () => {
    cy.login({
      email: "admin@clinica.local",
      password: "Admin@123"
    }).then((response) => {
      expect(response.status).to.equal(200);
      expect(response.body.data.token).to.be.a("string");
      expect(response.body.data.user.email).to.equal("admin@clinica.local");
    });
  });

  it("US02 CT02: rejeita autenticacao de usuario inativo", () => {
    cy.seed("inactiveUser", {
      email: "inativo@clinica.local",
      password: "Senha@123"
    }).then(() => {
      cy.login({
        email: "inativo@clinica.local",
        password: "Senha@123"
      }).then((response) => {
        expectApiError(response, 403, "USER_INACTIVE");
      });
    });
  });

  it("US02 CT03: rejeita autenticacao com credenciais invalidas", () => {
    cy.login({
      email: "admin@clinica.local",
      password: "SenhaErrada@123"
    }).then((response) => {
      expectApiError(response, 401, "INVALID_CREDENTIALS");

      cy.dbSnapshot().then((db) => {
        expect(db.users).to.have.length(1);
      });
    });
  });
});
