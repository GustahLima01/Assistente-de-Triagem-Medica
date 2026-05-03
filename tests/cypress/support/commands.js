const { apiRequest, getAccessToken, login } = require("./api");

Cypress.Commands.add("resetDatabase", () => cy.task("resetDatabase"));

Cypress.Commands.add("seed", (type, payload = {}) => cy.task("seed", { type, payload }));

Cypress.Commands.add("seedMany", (definitions) => {
  const results = {};

  return Object.entries(definitions)
    .reduce(
      (chain, [key, definition]) =>
        chain.then(() =>
          cy.seed(definition.type, definition.payload).then((result) => {
            results[key] = result;
          })
        ),
      cy.wrap(null, { log: false })
    )
    .then(() => results);
});

Cypress.Commands.add("dbSnapshot", () => cy.task("getDbSnapshot"));

Cypress.Commands.add("login", (credentials) => login(credentials));

Cypress.Commands.add("authenticateAs", (role = "ADMIN") => {
  if (role === "ADMIN") {
    return getAccessToken();
  }

  const email = `${role.toLowerCase()}@clinica.local`;
  const password = "Senha@123";

  return cy.dbSnapshot().then((db) => {
    const existingUser = db.users.find((user) => user.email === email);

    if (existingUser) {
      return getAccessToken({ email, password });
    }

    return cy
      .seed("user", {
        name: `${role} Fixture`,
        email,
        password,
        role
      })
      .then(() => getAccessToken({ email, password }));
  });
});

Cypress.Commands.add("authorizedRequest", (method, path, token, body) =>
  apiRequest(method, path, {
    token,
    body
  })
);

Cypress.Commands.add("requestAs", (role, method, path, body) =>
  cy.authenticateAs(role).then((token) => cy.authorizedRequest(method, path, token, body))
);
