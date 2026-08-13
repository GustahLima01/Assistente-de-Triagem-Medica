const fs = require("fs");
const path = require("path");

const workspaceRoot = process.cwd();
const openApiFile = path.join(workspaceRoot, "resources", "swagger.json");
const outputFile = path.join(
  workspaceRoot,
  "casos_teste_vader_assistente-de-triagem-medica-api.csv",
);

const spec = JSON.parse(fs.readFileSync(openApiFile, "utf8"));
const httpMethods = ["get", "post", "put", "patch", "delete"];
const allVerbChecks = ["GET", "POST", "PUT", "PATCH", "DELETE"];
const headers = [
  "Identificador",
  "Categoria VADER",
  "Endpoint",
  "Metodo",
  "Titulo",
  "Descricao",
  "Acao",
  "Dados",
  "Resultado Esperado",
];

function pickMethod(operations, index) {
  return operations[index % operations.length];
}

function resolveRef(ref) {
  if (!ref || !ref.startsWith("#/")) {
    return null;
  }

  return ref
    .slice(2)
    .split("/")
    .reduce((acc, key) => (acc ? acc[key] : null), spec);
}

function resolveResponse(response) {
  if (!response) {
    return null;
  }

  return response.$ref ? resolveRef(response.$ref) : response;
}

function resolveSchema(schema) {
  if (!schema) {
    return null;
  }

  return schema.$ref ? resolveRef(schema.$ref) : schema;
}

function getOperations(pathItem) {
  return httpMethods
    .filter((method) => pathItem[method])
    .map((method) => ({ method, operation: pathItem[method] }));
}

function getSuccessCodes(operation) {
  return Object.keys(operation.responses || {}).filter((code) => code.startsWith("2"));
}

function getResponseCodes(operation) {
  return Object.keys(operation.responses || {});
}

function getCombinedParameters(pathItem, operation) {
  return [...(pathItem.parameters || []), ...(operation.parameters || [])];
}

function getRequestSchema(operation) {
  const content = operation.requestBody?.content || {};
  const firstMediaType = Object.keys(content)[0];
  if (!firstMediaType) {
    return null;
  }

  return resolveSchema(content[firstMediaType].schema);
}

function summarizeSchemaFields(schema) {
  if (!schema) {
    return [];
  }

  const resolved = resolveSchema(schema);
  const properties = resolved?.properties || {};
  const required = new Set(resolved?.required || []);

  return Object.keys(properties).map((name) => {
    const property = resolveSchema(properties[name]) || properties[name];
    const traits = [];
    if (required.has(name)) {
      traits.push("obrigatorio");
    }
    if (property.type) {
      traits.push(`tipo ${property.type}`);
    }
    if (property.format) {
      traits.push(`formato ${property.format}`);
    }
    if (property.enum) {
      traits.push(`enum ${property.enum.join(", ")}`);
    }
    return `${name}${traits.length ? ` (${traits.join(", ")})` : ""}`;
  });
}

function escapeCsv(value) {
  const text = value == null ? "" : String(value);
  if (/[;"\r\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function addRow(rows, counts, row) {
  rows.push(row);
  counts[row["Categoria VADER"]] = (counts[row["Categoria VADER"]] || 0) + 1;
}

function expectedAuthResult(responseCodes) {
  if (responseCodes.includes("401") && responseCodes.includes("403")) {
    return "Rejeitar sem token com 401 e token sem permissao com 403, usando ErrorBody.";
  }
  if (responseCodes.includes("401")) {
    return "Rejeitar sem token ou token invalido com 401, usando ErrorBody.";
  }
  if (responseCodes.includes("403")) {
    return "Rejeitar token sem permissao com 403, usando ErrorBody.";
  }
  return "Lacuna: seguranca aplicada, mas 401/403 nao estao documentados para este endpoint.";
}

function expectedValidationResult(responseCodes) {
  if (responseCodes.includes("400")) {
    return "Rejeitar payload ou parametro invalido com 400 e corpo ErrorBody.";
  }
  return "Lacuna: payload ou parametro invalido deveria ser rejeitado preferencialmente com 400, mas 400 nao esta documentado.";
}

function expectedErrorResult(responseCodes) {
  if (responseCodes.includes("409")) {
    return "Rejeitar conflito de negocio com 409 e corpo ErrorBody.";
  }
  if (responseCodes.includes("404")) {
    return "Rejeitar recurso inexistente com 404 e corpo ErrorBody.";
  }
  if (responseCodes.includes("400")) {
    return "Rejeitar excecao de entrada ou estado com 400 e corpo ErrorBody.";
  }
  return "Lacuna: falta documentacao de resposta de erro consistente para excecoes relevantes deste endpoint.";
}

const rows = [];
const counts = {};
let sequence = 1;

for (const [endpoint, pathItem] of Object.entries(spec.paths || {})) {
  const operations = getOperations(pathItem);
  if (!operations.length) {
    continue;
  }

  const methodList = operations.map(({ method }) => method.toUpperCase());
  const unsupportedMethod = allVerbChecks.find((method) => !methodList.includes(method)) || "OPTIONS";
  const hasSecurity =
    operations.some(({ operation }) => Array.isArray(operation.security) && operation.security.length > 0) ||
    (Array.isArray(spec.security) && spec.security.length > 0);

  const opV = pickMethod(operations, 0);
  const opA = pickMethod(operations, 1);
  const opD = pickMethod(operations, 2);
  const opE = pickMethod(operations, 3);
  const opR = pickMethod(operations, 4);

  const paramsD = getCombinedParameters(pathItem, opD.operation);
  const requestSchemaD = getRequestSchema(opD.operation);
  const requestFields = summarizeSchemaFields(requestSchemaD);
  const paramSummary = paramsD.map((param) => {
    const schema = resolveSchema(param.schema) || {};
    const parts = [`${param.in}:${param.name}`];
    if (param.required) {
      parts.push("obrigatorio");
    }
    if (schema.type) {
      parts.push(`tipo ${schema.type}`);
    }
    if (schema.format) {
      parts.push(`formato ${schema.format}`);
    }
    if (schema.enum) {
      parts.push(`enum ${schema.enum.join(", ")}`);
    }
    return parts.join(" ");
  });
  const dataSummary = [...paramSummary, ...requestFields].slice(0, 8).join(" | ") || "Sem payload; validar contrato de parametros documentados.";
  const responseCodesA = getResponseCodes(opA.operation);
  const responseCodesD = getResponseCodes(opD.operation);
  const responseCodesE = getResponseCodes(opE.operation);
  const responseCodesR = getResponseCodes(opR.operation);
  const successCode = getSuccessCodes(opR.operation)[0] || "200";
  const successResponse = resolveResponse(opR.operation.responses?.[successCode]) || {};
  const responseMediaTypes = Object.keys(successResponse.content || {});
  const responseSchema = resolveSchema(successResponse.content?.[responseMediaTypes[0]]?.schema);
  const responseFields = summarizeSchemaFields(responseSchema).slice(0, 6).join(" | ") || "Schema de sucesso documentado sem detalhamento adicional.";

  addRow(rows, counts, {
    Identificador: `VADER-${String(sequence++).padStart(3, "0")}`,
    "Categoria VADER": "V",
    Endpoint: endpoint,
    Metodo: unsupportedMethod,
    Titulo: `Validar verbos suportados em ${endpoint}`,
    Descricao: `Confirmar que ${endpoint} aceita ${methodList.join(", ")} e rejeita ${unsupportedMethod}, cobrindo os metodos documentados deste recurso.`,
    Acao: `Executar ${methodList.join(", ")} conforme documentacao e repetir com ${unsupportedMethod} nao documentado.`,
    Dados: "Usar payloads e parametros validos conforme cada operacao documentada.",
    "Resultado Esperado": `Metodos documentados respondem conforme contrato. Metodo ${unsupportedMethod} deve ser rejeitado; lacuna se 405 nao estiver documentado.`,
  });

  addRow(rows, counts, {
    Identificador: `VADER-${String(sequence++).padStart(3, "0")}`,
    "Categoria VADER": "A",
    Endpoint: endpoint,
    Metodo: opA.method.toUpperCase(),
    Titulo: hasSecurity ? `Validar autenticacao/autorizacao em ${endpoint}` : `Validar acesso publico em ${endpoint}`,
    Descricao: hasSecurity
      ? "Garantir comportamento para ausencia de token, token invalido/expirado e token sem permissao, usando somente a seguranca documentada."
      : "Confirmar que o endpoint permanece publico e nao exige Authorization para a chamada documentada.",
    Acao: hasSecurity
      ? `Chamar ${opA.method.toUpperCase()} ${endpoint} sem token e com token invalido; repetir com token sem permissao quando aplicavel.`
      : `Chamar ${opA.method.toUpperCase()} ${endpoint} sem cabecalho Authorization.`,
    Dados: hasSecurity ? "Cabecalho Authorization ausente, bearer malformado e token de perfil inadequado." : "Sem token JWT.",
    "Resultado Esperado": hasSecurity
      ? expectedAuthResult(responseCodesA)
      : "Responder sucesso sem autenticacao, preservando o contrato publico documentado.",
  });

  addRow(rows, counts, {
    Identificador: `VADER-${String(sequence++).padStart(3, "0")}`,
    "Categoria VADER": "D",
    Endpoint: endpoint,
    Metodo: opD.method.toUpperCase(),
    Titulo: `Validar dados de entrada em ${endpoint}`,
    Descricao: "Cobrir campos obrigatorios, tipos, formatos, enums e parametros relevantes do contrato documentado.",
    Acao: `Executar ${opD.method.toUpperCase()} ${endpoint} com um campo obrigatorio ausente, valor fora de enum, formato invalido ou parametro inconsistente.`,
    Dados: dataSummary,
    "Resultado Esperado": expectedValidationResult(responseCodesD),
  });

  addRow(rows, counts, {
    Identificador: `VADER-${String(sequence++).padStart(3, "0")}`,
    "Categoria VADER": "E",
    Endpoint: endpoint,
    Metodo: opE.method.toUpperCase(),
    Titulo: `Validar erros e excecoes em ${endpoint}`,
    Descricao: "Exercitar falha operacional ou de negocio coerente com os codigos de erro documentados para o recurso.",
    Acao: `Executar ${opE.method.toUpperCase()} ${endpoint} com referencia inexistente, dependencia invalida ou estado conflitante apropriado ao recurso.`,
    Dados: "IDs inexistentes, referencias nao cadastradas ou combinacao de dados que viole o fluxo documentado.",
    "Resultado Esperado": expectedErrorResult(responseCodesE),
  });

  addRow(rows, counts, {
    Identificador: `VADER-${String(sequence++).padStart(3, "0")}`,
    "Categoria VADER": "R",
    Endpoint: endpoint,
    Metodo: opR.method.toUpperCase(),
    Titulo: `Validar resposta contratual de ${endpoint}`,
    Descricao: `Confirmar status ${successCode}, content type e estrutura do payload de sucesso do metodo ${opR.method.toUpperCase()}.`,
    Acao: `Executar ${opR.method.toUpperCase()} ${endpoint} com dados validos e inspecionar status, cabecalhos e schema retornado.`,
    Dados: responseFields,
    "Resultado Esperado": `Retornar ${successCode} com content type ${responseMediaTypes[0] || "application/json"} e payload aderente ao schema documentado.`,
  });
}

const csvLines = [
  headers.map(escapeCsv).join(";"),
  ...rows.map((row) => headers.map((header) => escapeCsv(row[header])).join(";")),
];

fs.writeFileSync(outputFile, `\uFEFF${csvLines.join("\r\n")}\r\n`, "utf8");

const reopened = fs.readFileSync(outputFile, "utf8");
const lineCount = reopened.split(/\r?\n/).filter(Boolean).length;
const summary = {
  openapi_file: openApiFile,
  output_file: outputFile,
  endpoint_count: Object.keys(spec.paths || {}).length,
  total_rows: rows.length,
  line_count: lineCount,
  headers,
  counts,
};

console.log(JSON.stringify(summary, null, 2));
