const express = require("express");

const { proxyToApi } = require("../services/apiProxyService");

const router = express.Router();

router.all("/*", async (req, res) => {
  const proxiedResponse = await proxyToApi(req);

  if (!proxiedResponse.ok) {
    res.status(proxiedResponse.status).json(proxiedResponse.body);
    return;
  }

  if (proxiedResponse.isJson) {
    res.status(proxiedResponse.status).json(proxiedResponse.body);
    return;
  }

  res.status(proxiedResponse.status).send(proxiedResponse.body);
});

module.exports = router;
