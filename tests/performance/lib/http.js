import http from "k6/http";
import { sleep } from "k6";
import { BASE_URL, THINK_TIME_MS } from "./config.js";

function buildHeaders(token) {
  const headers = {
    "Content-Type": "application/json"
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  return headers;
}

function postJson(path, payload, token, name) {
  return http.post(`${BASE_URL}${path}`, JSON.stringify(payload), {
    headers: buildHeaders(token),
    tags: { name }
  });
}

function maybeSleep(multiplier = 1) {
  if (THINK_TIME_MS > 0) {
    sleep((THINK_TIME_MS * multiplier) / 1000);
  }
}

export { maybeSleep, postJson };
