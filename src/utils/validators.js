const HttpError = require("./httpError");

function ensureObject(payload, fieldName = "payload") {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw new HttpError(400, "VALIDATION_ERROR", `O campo ${fieldName} deve ser um objeto valido.`, {
      field: fieldName
    });
  }
}

function ensureRequiredFields(payload, fields) {
  ensureObject(payload);

  const missing = fields.filter((field) => {
    const value = payload[field];
    return value === undefined || value === null || value === "";
  });

  if (missing.length > 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "Campos obrigatorios ausentes.", {
      missing
    });
  }
}

function ensureAllowedFields(payload, allowedFields) {
  ensureObject(payload);

  const invalidFields = Object.keys(payload).filter((field) => !allowedFields.includes(field));
  if (invalidFields.length > 0) {
    throw new HttpError(400, "VALIDATION_ERROR", "A requisicao contem campos nao permitidos.", {
      invalidFields,
      allowedFields
    });
  }
}

function ensureEnum(value, field, allowedValues) {
  if (!allowedValues.includes(value)) {
    throw new HttpError(400, "VALIDATION_ERROR", `Valor invalido para ${field}.`, {
      field,
      allowedValues
    });
  }
}

function ensureArray(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new HttpError(400, "VALIDATION_ERROR", `O campo ${field} deve ser um array nao vazio.`, {
      field
    });
  }
}

function ensureDateString(value, field) {
  if (Number.isNaN(Date.parse(value))) {
    throw new HttpError(400, "VALIDATION_ERROR", `O campo ${field} deve ser uma data valida.`, {
      field
    });
  }
}

module.exports = {
  ensureAllowedFields,
  ensureArray,
  ensureDateString,
  ensureEnum,
  ensureObject,
  ensureRequiredFields
};
