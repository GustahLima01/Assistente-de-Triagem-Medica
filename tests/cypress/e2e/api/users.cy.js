const { user } = require("../../support/apiFactories");

describe("API - Users", () => {
  beforeEach(() => cy.resetApiData());

  it("US01 CT01: cria usuario com email normalizado e senha em hash", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user({ email: "Novo.Usuario@Clinica.Local" }))
      .then((response) => {
        expect(response.status).to.eq(201);
        expect(response.body.data.email).to.eq("novo.usuario@clinica.local");
        expect(response.body.data.passwordHash).to.be.undefined;
      });
  });

  it("US01 CT02: rejeita criacao de usuario por perfil nao admin", () => {
    cy.apiRequestAs("RECEPTIONIST", "POST", "/users", user())
      .then((response) => cy.apiExpectError(response, 403, "FORBIDDEN"));
  });

  it("US01 CT03: rejeita criacao com campos obrigatorios ausentes", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", { email: "sem.nome@clinica.local", password: "Senha@123", role: "RECEPTIONIST" })
      .then((response) => cy.apiExpectError(response, 400, "VALIDATION_ERROR"));
  });

  it("US01 CT04: rejeita criacao com role fora do dominio permitido", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user({ role: "NURSE" }))
      .then((response) => cy.apiExpectError(response, 400, "VALIDATION_ERROR"));
  });

  it("US01 CT05: rejeita criacao com email duplicado", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user({ email: "duplicado@clinica.local" }))
      .then(() => cy.apiRequestAs("ADMIN", "POST", "/users", user({ email: "duplicado@clinica.local" })))
      .then((response) => cy.apiExpectError(response, 409, "USER_EMAIL_ALREADY_EXISTS"));
  });

  it("US03 CT01: atualiza usuario com email normalizado e nova senha em hash", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user())
      .then((createResponse) => cy.apiRequestAs("ADMIN", "PUT", `/users/${createResponse.body.data.id}`, {
        name: "Recepcao Atualizada", email: "Atualizado@Clinica.Local", password: "NovaSenha@123", role: "DOCTOR"
      }))
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.email).to.eq("atualizado@clinica.local");
        expect(response.body.data.role).to.eq("DOCTOR");
      });
  });

  it("US03 CT02: rejeita atualizacao por perfil nao admin", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user())
      .then((createResponse) => cy.apiRequestAs("DOCTOR", "PUT", `/users/${createResponse.body.data.id}`, { name: "Bloqueado" }))
      .then((response) => cy.apiExpectError(response, 403, "FORBIDDEN"));
  });

  it("US03 CT03: rejeita atualizacao com role invalido", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user())
      .then((createResponse) => cy.apiRequestAs("ADMIN", "PUT", `/users/${createResponse.body.data.id}`, { role: "INVALID_ROLE" }))
      .then((response) => cy.apiExpectError(response, 400, "VALIDATION_ERROR"));
  });

  it("US03 CT04: rejeita atualizacao com email duplicado", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user({ email: "primeiro@clinica.local" }))
      .then((first) => cy.apiRequestAs("ADMIN", "POST", "/users", user({ email: "segundo@clinica.local" })).then(() => first))
      .then((first) => cy.apiRequestAs("ADMIN", "PUT", `/users/${first.body.data.id}`, { email: "segundo@clinica.local" }))
      .then((response) => cy.apiExpectError(response, 409, "USER_EMAIL_ALREADY_EXISTS"));
  });

  it("US04 CT01: inativa usuario sem remocao fisica", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user())
      .then((createResponse) => cy.apiRequestAs("ADMIN", "DELETE", `/users/${createResponse.body.data.id}`))
      .then((response) => {
        expect(response.status).to.eq(200);
        expect(response.body.data.active).to.eq(false);
      });
  });

  it("US04 CT02: rejeita inativacao por perfil nao admin", () => {
    cy.apiRequestAs("ADMIN", "POST", "/users", user())
      .then((createResponse) => cy.apiRequestAs("DOCTOR", "DELETE", `/users/${createResponse.body.data.id}`))
      .then((response) => cy.apiExpectError(response, 403, "FORBIDDEN"));
  });
});
