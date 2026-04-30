const assert = require("node:assert/strict");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

const { assertHttpError } = require("../helpers/assertHttpError");

describe("triageService", () => {
  let triageService;
  let clock;
  let db;
  let nextIdStub;
  let getPatientEntityByIdStub;
  let getSymptomEntityByIdStub;

  beforeEach(() => {
    // Arrange
    clock = sinon.useFakeTimers(new Date("2026-04-22T12:00:00.000Z"));
    db = { triages: [] };
    nextIdStub = sinon.stub();
    getPatientEntityByIdStub = sinon.stub();
    getSymptomEntityByIdStub = sinon.stub();

    triageService = proxyquire("../../src/services/triageService", {
      "../data/memoryDb": { db, nextId: nextIdStub },
      "./patientService": { getPatientEntityById: getPatientEntityByIdStub },
      "./symptomService": { getSymptomEntityById: getSymptomEntityByIdStub }
    });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it("deve retornar a especialidade com maior peso e a prioridade para sintomas ativos", () => {
    // Arrange
    getSymptomEntityByIdStub.callsFake((id) => {
      const symptomsById = {
        s1: { id: "s1", active: true, severity: "HIGH", specialty: "CARDIOLOGY" },
        s2: { id: "s2", active: true, severity: "MEDIUM", specialty: "CARDIOLOGY" },
        s3: { id: "s3", active: true, severity: "CRITICAL", specialty: "NEUROLOGY" }
      };

      return symptomsById[id];
    });

    const payload = { symptomIds: ["s1", "s2", "s3"] };

    // Act
    const result = triageService.consultSpecialty(payload);

    // Assert
    assert.deepStrictEqual(result, {
      suggestedSpecialty: "CARDIOLOGY",
      priority: "CRITICAL",
      symptomsConsidered: [
        { id: "s1", active: true, severity: "HIGH", specialty: "CARDIOLOGY" },
        { id: "s2", active: true, severity: "MEDIUM", specialty: "CARDIOLOGY" },
        { id: "s3", active: true, severity: "CRITICAL", specialty: "NEUROLOGY" }
      ]
    });
  });

  it("deve ignorar ids de sintomas duplicados e usar ordem alfabetica como desempate", () => {
    // Arrange
    getSymptomEntityByIdStub.callsFake((id) => {
      const symptomsById = {
        s1: { id: "s1", active: true, severity: "HIGH", specialty: "CARDIOLOGY" },
        s2: { id: "s2", active: true, severity: "HIGH", specialty: "DERMATOLOGY" }
      };

      return symptomsById[id];
    });

    const payload = { symptomIds: ["s1", "s1", "s2"] };

    // Act
    const result = triageService.consultSpecialty(payload);

    // Assert
    sinon.assert.calledTwice(getSymptomEntityByIdStub);
    assert.strictEqual(result.suggestedSpecialty, "CARDIOLOGY");
    assert.strictEqual(result.priority, "HIGH");
    assert.strictEqual(result.symptomsConsidered.length, 2);
  });

  it("deve lancar erro de validacao quando symptomIds for um array vazio", () => {
    // Arrange
    const payload = { symptomIds: [] };

    // Act
    const execute = () => triageService.consultSpecialty(payload);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "symptomIds" }
    });
  });

  it("deve lancar erro de conflito quando um sintoma estiver inativo", () => {
    // Arrange
    getSymptomEntityByIdStub.returns({
      id: "s1",
      active: false,
      severity: "LOW",
      specialty: "CARDIOLOGY"
    });

    const payload = { symptomIds: ["s1"] };

    // Act
    const execute = () => triageService.consultSpecialty(payload);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "SYMPTOM_INACTIVE",
      details: { symptomId: "s1" }
    });
  });

  it("deve persistir uma triagem normalizada para um paciente ativo", () => {
    // Arrange
    nextIdStub.returns("99");
    getPatientEntityByIdStub.returns({ id: "p1", active: true });
    getSymptomEntityByIdStub.callsFake((id) => {
      const symptomsById = {
        s1: { id: "s1", active: true, severity: "MEDIUM", specialty: "CARDIOLOGY" },
        s2: { id: "s2", active: true, severity: "HIGH", specialty: "CARDIOLOGY" }
      };

      return symptomsById[id];
    });

    const payload = {
      patientId: "p1",
      symptomIds: ["s1", "s2"],
      notes: "  precisa de observacao  "
    };
    const currentUser = { id: "u1" };

    // Act
    const result = triageService.createTriage(payload, currentUser);

    // Assert
    sinon.assert.calledOnceWithExactly(nextIdStub, "triages");
    assert.deepStrictEqual(result, {
      id: "99",
      patientId: "p1",
      symptomIds: ["s1", "s2"],
      symptomsSnapshot: [
        { id: "s1", active: true, severity: "MEDIUM", specialty: "CARDIOLOGY" },
        { id: "s2", active: true, severity: "HIGH", specialty: "CARDIOLOGY" }
      ],
      suggestedSpecialty: "CARDIOLOGY",
      priority: "HIGH",
      notes: "precisa de observacao",
      createdByUserId: "u1",
      createdAt: "2026-04-22T12:00:00.000Z"
    });
    assert.deepStrictEqual(db.triages, [result]);
  });

  it("deve lancar erro de conflito quando o paciente estiver inativo", () => {
    // Arrange
    getPatientEntityByIdStub.returns({ id: "p1", active: false });

    const payload = {
      patientId: "p1",
      symptomIds: ["s1"]
    };
    const currentUser = { id: "u1" };

    // Act
    const execute = () => triageService.createTriage(payload, currentUser);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "PATIENT_INACTIVE"
    });
    assert.strictEqual(db.triages.length, 0);
  });
});
