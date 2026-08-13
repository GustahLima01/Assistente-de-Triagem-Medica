const assert = require("node:assert/strict");
const express = require("express");
const proxyquire = require("proxyquire").noCallThru();
const request = require("supertest");
const sinon = require("sinon");

describe("frontend webApiRoutes", () => {
  afterEach(() => {
    sinon.restore();
  });

  function createApp(proxyToApi) {
    const router = proxyquire("../../frontend/routes/webApiRoutes", {
      "../services/apiProxyService": { proxyToApi }
    });
    const app = express();

    app.use(express.json());
    app.use("/web-api", router);

    return app;
  }

  it("deve repassar respostas JSON com o status original", async () => {
    const proxyToApi = sinon.stub().resolves({
      ok: false,
      status: 403,
      isJson: true,
      body: {
        success: false,
        error: {
          code: "USER_INACTIVE"
        }
      }
    });

    const app = createApp(proxyToApi);

    const response = await request(app)
      .delete("/web-api/users/123")
      .set("Authorization", "Bearer token");

    assert.equal(proxyToApi.callCount, 1);
    assert.equal(response.status, 403);
    assert.deepStrictEqual(response.body, {
      success: false,
      error: {
        code: "USER_INACTIVE"
      }
    });
  });

  it("deve repassar respostas textuais quando a API nao retornar JSON", async () => {
    const proxyToApi = sinon.stub().resolves({
      ok: true,
      status: 200,
      isJson: false,
      body: "pong"
    });

    const app = createApp(proxyToApi);

    const response = await request(app).get("/web-api/health");

    assert.equal(proxyToApi.callCount, 1);
    assert.equal(response.status, 200);
    assert.equal(response.text, "pong");
  });
});
