const { db, seedUser } = require("../helpers/seeds");
const { buildUserFixture } = require("../fixtures");
const { authenticateAs, authorizedRequest, expect, expectApiError } = require("../helpers/api");

describe("Users API", () => {
  it("US01 CT01: cria usuario com email normalizado e senha em hash", async () => {
    const token = await authenticateAs("ADMIN");
    const payload = buildUserFixture({
      email: "Novo.Usuario@Clinica.Local"
    });

    const response = await authorizedRequest("post", "/api/users", token).send(payload);

    expect(response.status).to.equal(201);
    expect(response.body.data.email).to.equal("novo.usuario@clinica.local");
    const persisted = db.users.find((user) => user.id === response.body.data.id);
    expect(persisted.passwordHash).to.not.equal(payload.password);
  });

  it("US01 CT02: rejeita criacao de usuario por perfil nao admin", async () => {
    const token = await authenticateAs("RECEPTIONIST");

    const response = await authorizedRequest("post", "/api/users", token).send(buildUserFixture());

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US01 CT03: rejeita criacao com campos obrigatorios ausentes", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/users", token).send({
      email: "sem.nome@clinica.local",
      password: "Senha@123",
      role: "RECEPTIONIST"
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US01 CT04: rejeita criacao com role fora do dominio permitido", async () => {
    const token = await authenticateAs("ADMIN");

    const response = await authorizedRequest("post", "/api/users", token).send(
      buildUserFixture({ role: "NURSE" })
    );

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US01 CT05: rejeita criacao com email duplicado", async () => {
    const token = await authenticateAs("ADMIN");
    const existingUser = seedUser({ email: "duplicado@clinica.local" });

    const response = await authorizedRequest("post", "/api/users", token).send(
      buildUserFixture({ email: existingUser.email })
    );

    expectApiError(response, 409, "USER_EMAIL_ALREADY_EXISTS");
  });

  it("US03 CT01: atualiza usuario com email normalizado e nova senha em hash", async () => {
    const token = await authenticateAs("ADMIN");
    const user = seedUser();
    const previousHash = db.users.find((item) => item.id === user.id).passwordHash;

    const response = await authorizedRequest("put", `/api/users/${user.id}`, token).send({
      name: "Recepcao Atualizada",
      email: "Atualizado@Clinica.Local",
      password: "NovaSenha@123",
      role: "DOCTOR"
    });

    expect(response.status).to.equal(200);
    expect(response.body.data.email).to.equal("atualizado@clinica.local");
    const persisted = db.users.find((item) => item.id === user.id);
    expect(persisted.passwordHash).to.not.equal(previousHash);
    expect(persisted.role).to.equal("DOCTOR");
  });

  it("US03 CT02: rejeita atualizacao por perfil nao admin", async () => {
    const token = await authenticateAs("DOCTOR");
    const user = seedUser();

    const response = await authorizedRequest("put", `/api/users/${user.id}`, token).send({
      name: "Bloqueado"
    });

    expectApiError(response, 403, "FORBIDDEN");
  });

  it("US03 CT03: rejeita atualizacao com role invalido", async () => {
    const token = await authenticateAs("ADMIN");
    const user = seedUser();

    const response = await authorizedRequest("put", `/api/users/${user.id}`, token).send({
      role: "INVALID_ROLE"
    });

    expectApiError(response, 400, "VALIDATION_ERROR");
  });

  it("US03 CT04: rejeita atualizacao com email duplicado", async () => {
    const token = await authenticateAs("ADMIN");
    const firstUser = seedUser({ email: "primeiro@clinica.local" });
    seedUser({ email: "segundo@clinica.local" });

    const response = await authorizedRequest("put", `/api/users/${firstUser.id}`, token).send({
      email: "segundo@clinica.local"
    });

    expectApiError(response, 409, "USER_EMAIL_ALREADY_EXISTS");
  });

  it("US04 CT01: inativa usuario sem remocao fisica", async () => {
    const token = await authenticateAs("ADMIN");
    const user = seedUser();

    const response = await authorizedRequest("delete", `/api/users/${user.id}`, token);

    expect(response.status).to.equal(200);
    expect(response.body.data.active).to.equal(false);
    expect(db.users).to.have.lengthOf(2);
  });

  it("US04 CT02: rejeita inativacao por perfil nao admin", async () => {
    const token = await authenticateAs("DOCTOR");
    const user = seedUser();

    const response = await authorizedRequest("delete", `/api/users/${user.id}`, token);

    expectApiError(response, 403, "FORBIDDEN");
  });
});
