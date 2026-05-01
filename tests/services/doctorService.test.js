const assert = require("node:assert/strict");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

const { assertHttpError } = require("../helpers/assertHttpError");

describe("doctorService", () => {
  let doctorService;
  let db;
  let nextIdStub;

  beforeEach(() => {
    // Arrange
    db = { doctors: [] };
    nextIdStub = sinon.stub();

    doctorService = proxyquire("../../src/services/doctorService", {
      "../data/memoryDb": { db, nextId: nextIdStub }
    });
  });

  afterEach(() => {
    sinon.restore();
  });

  it("deve rejeitar CRM duplicado ao criar um medico", () => {
    // Arrange
    db.doctors.push({
      id: "1",
      name: "Dra. Ana",
      crm: "CRM-123",
      specialty: "Cardiologia",
      active: true
    });

    const payload = {
      name: "Dr. Bruno",
      crm: "CRM-123",
      specialty: "Neurologia"
    };

    // Act
    const execute = () => doctorService.createDoctor(payload);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "DOCTOR_CRM_ALREADY_EXISTS"
    });
  });

  it("deve retornar apenas medicos ativos por padrao", () => {
    // Arrange
    db.doctors.push(
      { id: "1", name: "Dra. Ana", crm: "CRM-1", specialty: "Cardiologia", active: true },
      { id: "2", name: "Dr. Bruno", crm: "CRM-2", specialty: "Cardiologia", active: false }
    );

    // Act
    const result = doctorService.listDoctors();

    // Assert
    assert.deepStrictEqual(result, [{ id: "1", name: "Dra. Ana", crm: "CRM-1", specialty: "Cardiologia", active: true }]);
  });

  it("deve incluir medicos inativos quando solicitado explicitamente e filtrado por especialidade", () => {
    // Arrange
    db.doctors.push(
      { id: "1", name: "Dra. Ana", crm: "CRM-1", specialty: "Cardiologia", active: true },
      { id: "2", name: "Dr. Bruno", crm: "CRM-2", specialty: "Neurologia", active: false }
    );

    const filters = { includeInactive: "true", specialty: "Neurologia" };

    // Act
    const result = doctorService.listDoctors(filters);

    // Assert
    assert.deepStrictEqual(result, [{ id: "2", name: "Dr. Bruno", crm: "CRM-2", specialty: "Neurologia", active: false }]);
  });
});
