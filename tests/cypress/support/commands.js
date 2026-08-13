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

const credentialsByRole = {
  ADMIN: {
    email: "admin@clinica.local",
    password: "Admin@123"
  },
  RECEPTIONIST: {
    email: "recepcao@clinica.local",
    password: "Recepcao@123"
  },
  DOCTOR: {
    email: "doctor@clinica.local",
    password: "Senha@123"
  }
};

function formatDateDisplay(isoDate) {
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year}`;
}

function formatDateTimeDisplay(isoDateTime) {
  const [datePart, timePart] = isoDateTime.split("T");
  const [hours, minutes] = timePart.split(":");
  return `${formatDateDisplay(datePart)} ${hours}:${minutes}`;
}

function buildAuthHeaders(token) {
  return {
    Authorization: `Bearer ${token}`
  };
}

Cypress.Commands.add("apiLogin", (role = "ADMIN") => {
  const credentials = credentialsByRole[role];

  return cy
    .request("POST", `${Cypress.env("apiUrl")}/auth/login`, credentials)
    .its("body.data");
});

Cypress.Commands.add("loginRequest", (credentials) =>
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/auth/login`,
    body: credentials,
    failOnStatusCode: false
  })
);

Cypress.Commands.add("loginAs", (role = "ADMIN") => {
  cy.apiLogin(role).then((authData) => {
    cy.visit("/", {
      onBeforeLoad(win) {
        win.localStorage.setItem("triage.token", authData.token);
        win.localStorage.setItem("triage.user", JSON.stringify(authData.user));
      }
    });
  });

  cy.get("#shell-view").should("be.visible");
  cy.get("#route-dashboard").should("be.visible");
});

Cypress.Commands.add("navigateToRoute", (route) => {
  cy.get(`[data-route="${route}"]`).click();
  cy.get(`#route-${route}`).should("be.visible");
  cy.get(`#route-${route}`).should("not.have.class", "is-hidden");
});

Cypress.Commands.add("setCustomPicker", (selector, isoValue) => {
  const displayValue = isoValue.includes("T") ? formatDateTimeDisplay(isoValue) : formatDateDisplay(isoValue);

  cy.get(selector).then(($input) => {
    const input = $input[0];
    input.dataset.isoValue = isoValue;
    input.value = displayValue;
    input.dispatchEvent(new Event("input", { bubbles: true }));
    input.dispatchEvent(new Event("change", { bubbles: true }));
  });
});

Cypress.Commands.add("apiRequestAs", (role, method, path, body) => {
  return cy.apiLogin(role).then((authData) =>
    cy.request({
      method,
      url: `${Cypress.env("apiUrl")}${path}`,
      headers: buildAuthHeaders(authData.token),
      body,
      failOnStatusCode: false
    })
  );
});

Cypress.Commands.add("resetApiData", () =>
  cy.request({
    method: "POST",
    url: `${Cypress.env("apiUrl")}/test/reset`,
    failOnStatusCode: false
  }).its("status").should("eq", 204)
);

Cypress.Commands.add("apiExpectError", (response, status, code) => {
  expect(response.status).to.equal(status);
  expect(response.body.success).to.equal(false);
  expect(response.body.error.code).to.equal(code);
});

Cypress.Commands.add("createTriageByApi", (triage, role = "ADMIN") =>
  cy.apiRequestAs(role, "POST", "/triages", triage).its("body.data")
);

Cypress.Commands.add("createAppointmentByApi", (appointment, role = "ADMIN") =>
  cy.apiRequestAs(role, "POST", "/appointments", appointment).its("body.data")
);

Cypress.Commands.add("createPatientByApi", (patient, role = "ADMIN") =>
  cy.apiRequestAs(role, "POST", "/patients", patient).its("body.data")
);

Cypress.Commands.add("createDoctorByApi", (doctor, role = "ADMIN") =>
  cy.apiRequestAs(role, "POST", "/doctors", doctor).its("body.data")
);

Cypress.Commands.add("createSymptomByApi", (symptom, role = "ADMIN") =>
  cy.apiRequestAs(role, "POST", "/symptoms", symptom).its("body.data")
);

Cypress.Commands.add("createUserByApi", (user, role = "ADMIN") =>
  cy.apiRequestAs(role, "POST", "/users", user).its("body.data")
);
