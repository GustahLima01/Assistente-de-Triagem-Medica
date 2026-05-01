const request = require("supertest");
const { expect } = require("chai");
const app = require("../../src/app");
const { createUser } = require("../../src/services/userService");

const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@clinica.local",
  password: "Admin@123"
};

async function login(credentials = DEFAULT_ADMIN_CREDENTIALS) {
  return request(app).post("/api/auth/login").send(credentials);
}

async function getAccessToken(credentials = DEFAULT_ADMIN_CREDENTIALS) {
  const response = await login(credentials);
  expect(response.status).to.equal(200);
  return response.body.data.token;
}

async function authenticateAs(role = "ADMIN") {
  if (role === "ADMIN") {
    return getAccessToken();
  }

  const email = `${role.toLowerCase()}@clinica.local`;
  const password = "Senha@123";

  createUser({
    name: `${role} Fixture`,
    email,
    password,
    role
  });

  return getAccessToken({ email, password });
}

function authorizedRequest(method, path, token) {
  return request(app)[method](path).set("Authorization", `Bearer ${token}`);
}

function expectApiError(response, status, code) {
  expect(response.status).to.equal(status);
  expect(response.body.success).to.equal(false);
  expect(response.body.error.code).to.equal(code);
}

module.exports = {
  app,
  authenticateAs,
  authorizedRequest,
  expect,
  expectApiError,
  getAccessToken,
  login
};
