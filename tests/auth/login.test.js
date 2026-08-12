const { db, seedInactiveUser } = require("../helpers/seeds");
const { expect, expectApiError, login } = require("../helpers/api");

describe("POST /api/auth/login", () => {
  it("US02 CT01: autentica usuario ativo com credenciais validas", async () => {
    const response = await login({
      email: "admin@clinica.local",
      password: "Admin@123"
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.token).to.be.a("string");
    expect(response.body.data.user.email).to.equal("admin@clinica.local");
  });

  it("US02 CT01.1: autentica usuario receptionist semeado para o fluxo web", async () => {
    const response = await login({
      email: "recepcao@clinica.local",
      password: "Recepcao@123"
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.token).to.be.a("string");
    expect(response.body.data.user.email).to.equal("recepcao@clinica.local");
    expect(response.body.data.user.role).to.equal("RECEPTIONIST");
  });

  it("US02 CT02: rejeita autenticacao de usuario inativo", async () => {
    seedInactiveUser({
      email: "inativo@clinica.local",
      password: "Senha@123"
    });

    const response = await login({
      email: "inativo@clinica.local",
      password: "Senha@123"
    });

    expectApiError(response, 403, "USER_INACTIVE");
  });

  it("US02 CT03: rejeita autenticacao com credenciais invalidas", async () => {
    const response = await login({
      email: "admin@clinica.local",
      password: "SenhaErrada@123"
    });

    expectApiError(response, 401, "INVALID_CREDENTIALS");
    expect(db.users).to.have.lengthOf(3);
  });
});
