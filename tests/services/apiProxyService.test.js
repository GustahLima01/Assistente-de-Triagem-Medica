const assert = require("node:assert/strict");
const sinon = require("sinon");

describe("frontend apiProxyService", () => {
  let originalApiBaseUrl;

  beforeEach(() => {
    originalApiBaseUrl = process.env.API_BASE_URL;
  });

  afterEach(() => {
    sinon.restore();
    delete require.cache[require.resolve("../../frontend/services/apiProxyService")];

    if (originalApiBaseUrl === undefined) {
      delete process.env.API_BASE_URL;
    } else {
      process.env.API_BASE_URL = originalApiBaseUrl;
    }
  });

  function loadService() {
    delete require.cache[require.resolve("../../frontend/services/apiProxyService")];
    return require("../../frontend/services/apiProxyService");
  }

  it("deve encaminhar metodo, cabecalhos e body para a API", async () => {
    process.env.API_BASE_URL = "http://localhost:3000/api";

    const fetchStub = sinon.stub(global, "fetch").resolves({
      ok: true,
      status: 200,
      headers: {
        get: sinon.stub().withArgs("content-type").returns("application/json")
      },
      json: sinon.stub().resolves({
        success: true,
        data: {
          token: "jwt-token"
        }
      })
    });

    const { proxyToApi } = loadService();

    const response = await proxyToApi({
      method: "POST",
      originalUrl: "/web-api/auth/login",
      headers: {
        authorization: "Bearer token",
        "content-type": "application/json"
      },
      body: {
        email: "admin@clinica.local",
        password: "Admin@123"
      }
    });

    assert.equal(fetchStub.callCount, 1);
    assert.equal(fetchStub.firstCall.args[0].toString(), "http://localhost:3000/api/auth/login");
    assert.deepStrictEqual(fetchStub.firstCall.args[1], {
      method: "POST",
      headers: {
        Accept: "application/json",
        Authorization: "Bearer token",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        email: "admin@clinica.local",
        password: "Admin@123"
      })
    });
    assert.deepStrictEqual(response, {
      ok: true,
      status: 200,
      isJson: true,
      body: {
        success: true,
        data: {
          token: "jwt-token"
        }
      }
    });
  });

  it("deve retornar erro padronizado quando a API estiver indisponivel", async () => {
    process.env.API_BASE_URL = "http://localhost:3999/api";

    sinon.stub(global, "fetch").rejects(new Error("fetch failed"));

    const { proxyToApi } = loadService();

    const response = await proxyToApi({
      method: "GET",
      originalUrl: "/web-api/users",
      headers: {},
      body: undefined
    });

    assert.deepStrictEqual(response, {
      ok: false,
      status: 502,
      isJson: true,
      body: {
        success: false,
        error: {
          code: "API_UNAVAILABLE",
          message: "Nao foi possivel conectar com a API de triagem.",
          details: {
            apiBaseUrl: "http://localhost:3999/api",
            reason: "fetch failed"
          }
        }
      }
    });
  });
});
