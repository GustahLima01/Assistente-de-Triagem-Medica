const assert = require("node:assert/strict");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

const { assertHttpError } = require("../helpers/assertHttpError");

describe("patientService", () => {
  let patientService;
  let clock;
  let db;
  let nextIdStub;

  beforeEach(() => {
    // Arrange
    clock = sinon.useFakeTimers(new Date("2026-04-22T12:00:00.000Z"));
    db = { patients: [] };
    nextIdStub = sinon.stub();

    patientService = proxyquire("../../src/services/patientService", {
      "../data/memoryDb": { db, nextId: nextIdStub }
    });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it("deve rejeitar documento duplicado ao criar um paciente", () => {
    // Arrange
    db.patients.push({
      id: "1",
      name: "Paciente Base",
      document: "12345678900",
      birthDate: "1990-01-01",
      phone: "+5511999999999",
      email: null,
      notes: null,
      active: true
    });

    const payload = {
      name: "Novo Paciente",
      document: "12345678900",
      birthDate: "1995-01-01",
      phone: "+5511888888888"
    };

    // Act
    const execute = () => patientService.createPatient(payload);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "PATIENT_DOCUMENT_ALREADY_EXISTS"
    });
  });

  it("deve aplicar filtros por nome, documento e ativo ao listar pacientes", () => {
    // Arrange
    db.patients.push(
      {
        id: "1",
        name: "Maria Clara",
        document: "111",
        birthDate: "1990-01-01",
        phone: "1",
        active: true
      },
      {
        id: "2",
        name: "Joao Pedro",
        document: "222",
        birthDate: "1991-01-01",
        phone: "2",
        active: false
      },
      {
        id: "3",
        name: "Maria Eduarda",
        document: "333",
        birthDate: "1992-01-01",
        phone: "3",
        active: true
      }
    );

    const filters = {
      name: "maria",
      active: "true"
    };

    // Act
    const result = patientService.listPatients(filters);

    // Assert
    assert.deepStrictEqual(result, [
      {
        id: "1",
        name: "Maria Clara",
        document: "111",
        birthDate: "1990-01-01",
        phone: "1",
        active: true
      },
      {
        id: "3",
        name: "Maria Eduarda",
        document: "333",
        birthDate: "1992-01-01",
        phone: "3",
        active: true
      }
    ]);
  });

  it("deve rejeitar valores invalidos no filtro active ao listar pacientes", () => {
    // Arrange
    const filters = {
      active: "yes"
    };

    // Act
    const execute = () => patientService.listPatients(filters);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: {
        field: "active",
        allowedValues: [true, false]
      }
    });
  });
});
