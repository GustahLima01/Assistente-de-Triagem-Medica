const DEFAULT_ADMIN_CREDENTIALS = {
  email: "admin@clinica.local",
  password: "Admin@123"
};

function apiRequest(method, path, { token, body } = {}) {
  const headers = {
    Accept: "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  if (body !== undefined) {
    headers["Content-Type"] = "application/json";
  }

  return cy
    .request({
      method,
      url: path,
      headers,
      body,
      failOnStatusCode: false,
      log: false
    })
    .then((response) => ({
      status: response.status,
      body: response.body
    }));
}

function login(credentials = DEFAULT_ADMIN_CREDENTIALS) {
  return apiRequest("POST", "/api/auth/login", {
    body: credentials
  });
}

function getAccessToken(credentials = DEFAULT_ADMIN_CREDENTIALS) {
  return login(credentials).then((response) => {
    expect(response.status).to.equal(200);
    return response.body.data.token;
  });
}

function expectApiError(response, status, code) {
  expect(response.status).to.equal(status);
  expect(response.body.success).to.equal(false);
  expect(response.body.error.code).to.equal(code);
}

module.exports = {
  apiRequest,
  DEFAULT_ADMIN_CREDENTIALS,
  expectApiError,
  getAccessToken,
  login
};
