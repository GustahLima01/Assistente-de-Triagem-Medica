const { buildUserFixture } = require("../../../fixtures");
const { expectApiError } = require("../../support/api");

describe("Users API", () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it("US01 CT01: cria usuario com email normalizado e senha em hash", () => {
    const payload = buildUserFixture({
      email: "Novo.Usuario@Clinica.Local"
    });

    cy.requestAs("ADMIN", "POST", "/api/users", payload).then((response) => {
      expect(response.status).to.equal(201);
      expect(response.body.data.email).to.equal("novo.usuario@clinica.local");

      cy.dbSnapshot().then((db) => {
        const persisted = db.users.find((user) => user.id === response.body.data.id);
        expect(persisted.passwordHash).to.not.equal(payload.password);
      });
    });
  });

  it("US01 CT02: rejeita criacao de usuario por perfil nao admin", () => {
    cy.requestAs("RECEPTIONIST", "POST", "/api/users", buildUserFixture()).then((response) => {
      expectApiError(response, 403, "FORBIDDEN");
    });
  });

  it("US01 CT03: rejeita criacao com campos obrigatorios ausentes", () => {
    cy.requestAs("ADMIN", "POST", "/api/users", {
      email: "sem.nome@clinica.local",
      password: "Senha@123",
      role: "RECEPTIONIST"
    }).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US01 CT04: rejeita criacao com role fora do dominio permitido", () => {
    cy.requestAs("ADMIN", "POST", "/api/users", buildUserFixture({ role: "NURSE" })).then((response) => {
      expectApiError(response, 400, "VALIDATION_ERROR");
    });
  });

  it("US01 CT05: rejeita criacao com email duplicado", () => {
    cy.seed("user", { email: "duplicado@clinica.local" }).then((existingUser) => {
      cy.requestAs("ADMIN", "POST", "/api/users", buildUserFixture({ email: existingUser.email })).then((response) => {
        expectApiError(response, 409, "USER_EMAIL_ALREADY_EXISTS");
      });
    });
  });

  it("US03 CT01: atualiza usuario com email normalizado e nova senha em hash", () => {
    cy.seed("user").then((user) => {
      cy.dbSnapshot().then((db) => {
        const previousHash = db.users.find((item) => item.id === user.id).passwordHash;

        cy.requestAs("ADMIN", "PUT", `/api/users/${user.id}`, {
          name: "Recepcao Atualizada",
          email: "Atualizado@Clinica.Local",
          password: "NovaSenha@123",
          role: "DOCTOR"
        }).then((response) => {
          expect(response.status).to.equal(200);
          expect(response.body.data.email).to.equal("atualizado@clinica.local");

          cy.dbSnapshot().then((snapshot) => {
            const persisted = snapshot.users.find((item) => item.id === user.id);
            expect(persisted.passwordHash).to.not.equal(previousHash);
            expect(persisted.role).to.equal("DOCTOR");
          });
        });
      });
    });
  });

  it("US03 CT02: rejeita atualizacao por perfil nao admin", () => {
    cy.seed("user").then((user) => {
      cy.requestAs("DOCTOR", "PUT", `/api/users/${user.id}`, {
        name: "Bloqueado"
      }).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });

  it("US03 CT03: rejeita atualizacao com role invalido", () => {
    cy.seed("user").then((user) => {
      cy.requestAs("ADMIN", "PUT", `/api/users/${user.id}`, {
        role: "INVALID_ROLE"
      }).then((response) => {
        expectApiError(response, 400, "VALIDATION_ERROR");
      });
    });
  });

  it("US03 CT04: rejeita atualizacao com email duplicado", () => {
    cy.seedMany({
      firstUser: { type: "user", payload: { email: "primeiro@clinica.local" } },
      secondUser: { type: "user", payload: { email: "segundo@clinica.local" } }
    }).then(({ firstUser, secondUser }) => {
      cy.requestAs("ADMIN", "PUT", `/api/users/${firstUser.id}`, {
        email: secondUser.email
      }).then((response) => {
        expectApiError(response, 409, "USER_EMAIL_ALREADY_EXISTS");
      });
    });
  });

  it("US04 CT01: inativa usuario sem remocao fisica", () => {
    cy.seed("user").then((user) => {
      cy.requestAs("ADMIN", "DELETE", `/api/users/${user.id}`).then((response) => {
        expect(response.status).to.equal(200);
        expect(response.body.data.active).to.equal(false);

        cy.dbSnapshot().then((db) => {
      expect(db.users).to.have.length(3);
        });
      });
    });
  });

  it("US04 CT02: rejeita inativacao por perfil nao admin", () => {
    cy.seed("user").then((user) => {
      cy.requestAs("DOCTOR", "DELETE", `/api/users/${user.id}`).then((response) => {
        expectApiError(response, 403, "FORBIDDEN");
      });
    });
  });
});
