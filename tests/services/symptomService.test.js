const assert = require("node:assert/strict");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

const { assertHttpError } = require("../helpers/assertHttpError");

describe("symptomService", () => {
  let symptomService;
  let db;
  let nextIdStub;

  beforeEach(() => {
    // Arrange
    db = { symptoms: [] };
    nextIdStub = sinon.stub();

    symptomService = proxyquire("../../src/services/symptomService", {
      "../data/memoryDb": { db, nextId: nextIdStub }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("deve retornar apenas sintomas ativos por padrao", () => {
    // Arrange
    db.symptoms.push(
      { id: "1", name: "Dor no peito", severity: "HIGH", specialty: "Cardiologia", active: true },
      { id: "2", name: "Febre", severity: "MEDIUM", specialty: "Clinica Geral", active: false }
    );

    // Act
    const result = symptomService.listSymptoms();

    // Assert
    assert.deepStrictEqual(result, [
      { id: "1", name: "Dor no peito", severity: "HIGH", specialty: "Cardiologia", active: true }
    ]);
  });

  it("deve permitir filtrar por severidade e incluir sintomas inativos quando solicitado", () => {
    // Arrange
    db.symptoms.push(
      { id: "1", name: "Dor no peito", severity: "HIGH", specialty: "Cardiologia", active: true },
      { id: "2", name: "Febre", severity: "MEDIUM", specialty: "Clinica Geral", active: false },
      { id: "3", name: "Enjoo", severity: "MEDIUM", specialty: "Clinica Geral", active: true }
    );

    const filters = { severity: "MEDIUM", includeInactive: "true" };

    // Act
    const result = symptomService.listSymptoms(filters);

    // Assert
    assert.deepStrictEqual(result, [
      { id: "2", name: "Febre", severity: "MEDIUM", specialty: "Clinica Geral", active: false },
      { id: "3", name: "Enjoo", severity: "MEDIUM", specialty: "Clinica Geral", active: true }
    ]);
  });

  it("deve rejeitar severidades invalidas nos filtros", () => {
    // Arrange
    const filters = {
      severity: "URGENT"
    };

    // Act
    const execute = () => symptomService.listSymptoms(filters);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        field: "severity",
        allowedValues: ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
      }
    });
  });
});
