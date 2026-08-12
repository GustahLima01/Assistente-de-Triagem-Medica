const API_BASE_URL = process.env.API_BASE_URL || "http://localhost:3000/api";

async function proxyToApi(req) {
  const apiBaseUrl = API_BASE_URL.endsWith("/") ? API_BASE_URL : `${API_BASE_URL}/`;
  const requestPath = req.originalUrl.replace(/^\/web-api\/?/, "");
  const targetUrl = new URL(requestPath, apiBaseUrl);

  const headers = buildHeaders(req.headers);
  const requestInit = {
    method: req.method,
    headers
  };

  if (!["GET", "HEAD"].includes(req.method)) {
    requestInit.body = JSON.stringify(req.body || {});
  }

  try {
    const response = await fetch(targetUrl, requestInit);
    const contentType = response.headers.get("content-type") || "";
    const isJson = contentType.includes("application/json");
    const body = isJson ? await response.json() : await response.text();

    return {
      ok: response.ok,
      status: response.status,
      body,
      isJson
    };
  } catch (error) {
    return {
      ok: false,
      status: 502,
      isJson: true,
      body: {
        success: false,
        error: {
          code: "API_UNAVAILABLE",
          message: "Nao foi possivel conectar com a API de triagem.",
          details: {
            apiBaseUrl: API_BASE_URL,
            reason: error.message
          }
        }
      }
    };
  }
}

function buildHeaders(incomingHeaders) {
  const headers = {
    Accept: "application/json"
  };

  if (incomingHeaders.authorization) {
    headers.Authorization = incomingHeaders.authorization;
  }

  if (incomingHeaders["content-type"]) {
    headers["Content-Type"] = incomingHeaders["content-type"];
  } else {
    headers["Content-Type"] = "application/json";
  }

  return headers;
}

module.exports = {
  proxyToApi
};
