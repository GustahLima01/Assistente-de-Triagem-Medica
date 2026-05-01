import { REPORT_DIR } from "./config.js";

function formatMetricValue(value) {
  if (typeof value !== "number" || Number.isNaN(value)) {
    return "-";
  }

  return value.toFixed(2);
}

function buildTextSummary(scriptName, data) {
  const interestingMetrics = [
    "http_reqs",
    "http_req_failed",
    "http_req_duration",
    "checks",
    "business_failure_rate"
  ];

  const lines = [
    `Script: ${scriptName}`,
    `Duration: ${data.state?.testRunDurationMs || 0} ms`
  ];

  interestingMetrics.forEach((metricName) => {
    const metric = data.metrics[metricName];
    if (!metric) {
      return;
    }

    if (metric.type === "rate") {
      lines.push(`${metricName}: rate=${formatMetricValue(metric.values.rate)}`);
      return;
    }

    if (metric.type === "counter") {
      lines.push(`${metricName}: count=${formatMetricValue(metric.values.count)}`);
      return;
    }

    if (metric.type === "trend") {
      lines.push(
        `${metricName}: avg=${formatMetricValue(metric.values.avg)} p(95)=${formatMetricValue(metric.values["p(95)"])} max=${formatMetricValue(metric.values.max)}`
      );
      return;
    }

    lines.push(`${metricName}: ${JSON.stringify(metric.values)}`);
  });

  return `${lines.join("\n")}\n`;
}

function buildHtmlSummary(scriptName, data) {
  const rows = Object.entries(data.metrics)
    .map(([metricName, metric]) => {
      const values = Object.entries(metric.values || {})
        .map(([key, value]) => `<div><strong>${key}</strong>: ${typeof value === "number" ? formatMetricValue(value) : value}</div>`)
        .join("");

      return `<tr><td>${metricName}</td><td>${metric.type}</td><td>${values}</td></tr>`;
    })
    .join("");

  return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <title>Relatorio K6 - ${scriptName}</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 24px; color: #1f2937; }
    h1 { margin-bottom: 8px; }
    p { color: #4b5563; }
    table { border-collapse: collapse; width: 100%; margin-top: 16px; }
    th, td { border: 1px solid #d1d5db; padding: 12px; vertical-align: top; text-align: left; }
    th { background: #f3f4f6; }
    tr:nth-child(even) { background: #f9fafb; }
  </style>
</head>
<body>
  <h1>Relatorio K6 - ${scriptName}</h1>
  <p>Duracao total: ${data.state?.testRunDurationMs || 0} ms</p>
  <table>
    <thead>
      <tr>
        <th>Metrica</th>
        <th>Tipo</th>
        <th>Valores</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
</body>
</html>`;
}

function createSummaryReport(scriptName, data) {
  const textSummary = buildTextSummary(scriptName, data);

  return {
    stdout: textSummary,
    [`${REPORT_DIR}/${scriptName}.txt`]: textSummary,
    [`${REPORT_DIR}/${scriptName}.json`]: JSON.stringify(data, null, 2),
    [`${REPORT_DIR}/${scriptName}.html`]: buildHtmlSummary(scriptName, data)
  };
}

export { createSummaryReport };
