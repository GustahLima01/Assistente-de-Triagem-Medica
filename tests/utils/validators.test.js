const assert = require("node:assert/strict");

const {
  ensureAllowedFields,
  ensureArray,
  ensureDateString,
  ensureEnum,
  ensureObject,
  ensureRequiredFields
} = require("../../src/utils/validators");
const { assertHttpError } = require("../helpers/assertHttpError");

describe("validators utils", () => {
  it("nao deve lancar erro quando o payload for um objeto valido", () => {
    // Arrange
    const payload = { name: "Maria" };

    // Act
    const execute = () => ensureObject(payload);

    // Assert
    assert.doesNotThrow(execute);
  });

  it("deve lancar erro de validacao quando o payload for nulo", () => {
    // Arrange
    const payload = null;

    // Act
    const execute = () => ensureObject(payload, "body");

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "body" }
    });
  });

  it("nao deve lancar erro quando todos os campos obrigatorios estiverem presentes", () => {
    // Arrange
    const payload = { email: "teste@clinica.local", password: "123456" };

    // Act
    const execute = () => ensureRequiredFields(payload, ["email", "password"]);

    // Assert
    assert.doesNotThrow(execute);
  });

  it("deve lancar erro de validacao quando campos obrigatorios estiverem ausentes ou vazios", () => {
    // Arrange
    const payload = { email: "", password: null };

    // Act
    const execute = () => ensureRequiredFields(payload, ["email", "password", "role"]);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { missing: ["email", "password", "role"] }
    });
  });

  it("nao deve lancar erro quando o payload contiver apenas campos permitidos", () => {
    // Arrange
    const payload = { email: "teste@clinica.local", password: "123456" };

    // Act
    const execute = () => ensureAllowedFields(payload, ["email", "password"]);

    // Assert
    assert.doesNotThrow(execute);
  });

  it("deve lancar erro de validacao quando o payload contiver campos extras", () => {
    // Arrange
    const payload = { email: "teste@clinica.local", password: "123456", admin: true };

    // Act
    const execute = () => ensureAllowedFields(payload, ["email", "password"]);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        invalidFields: ["admin"],
        allowedFields: ["email", "password"]
      }
    });
  });

  it("nao deve lancar erro quando o valor pertencer aos valores permitidos", () => {
    // Arrange
    const value = "ADMIN";

    // Act
    const execute = () => ensureEnum(value, "role", ["ADMIN", "DOCTOR"]);

    // Assert
    assert.doesNotThrow(execute);
  });

  it("deve lancar erro de validacao quando o valor estiver fora dos valores permitidos", () => {
    // Arrange
    const value = "PATIENT";

    // Act
    const execute = () => ensureEnum(value, "role", ["ADMIN", "DOCTOR"]);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        field: "role",
        allowedValues: ["ADMIN", "DOCTOR"]
      }
    });
  });

  it("nao deve lancar erro quando o valor for um array nao vazio", () => {
    // Arrange
    const value = ["s1"];

    // Act
    const execute = () => ensureArray(value, "symptomIds");

    // Assert
    assert.doesNotThrow(execute);
  });

  it("deve lancar erro de validacao quando o valor estiver vazio ou nao for um array", () => {
    // Arrange
    const emptyValue = [];
    const nonArrayValue = "s1";

    // Act
    const executeWithEmptyArray = () => ensureArray(emptyValue, "symptomIds");
    const executeWithString = () => ensureArray(nonArrayValue, "symptomIds");

    // Assert
    assertHttpError(executeWithEmptyArray, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "symptomIds" }
    });
    assertHttpError(executeWithString, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "symptomIds" }
    });
  });

  it("nao deve lancar erro quando o valor for uma data valida", () => {
    // Arrange
    const value = "2026-05-01T09:30:00-03:00";

    // Act
    const execute = () => ensureDateString(value, "scheduledAt");

    // Assert
    assert.doesNotThrow(execute);
  });

  it("deve lancar erro de validacao quando o valor nao for uma data valida", () => {
    // Arrange
    const value = "data-invalida";

    // Act
    const execute = () => ensureDateString(value, "scheduledAt");

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "scheduledAt" }
    });
  });
});
