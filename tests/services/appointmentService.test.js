const assert = require("node:assert/strict");
const proxyquire = require("proxyquire").noCallThru();
const sinon = require("sinon");

const { assertHttpError } = require("../helpers/assertHttpError");

describe("appointmentService", () => {
  let appointmentService;
  let clock;
  let db;
  let nextIdStub;
  let getPatientEntityByIdStub;
  let getDoctorEntityByIdStub;
  let getTriageEntityByIdStub;

  beforeEach(() => {
    // Arrange
    clock = sinon.useFakeTimers(new Date("2026-04-22T12:00:00.000Z"));
    db = { appointments: [] };
    nextIdStub = sinon.stub();
    getPatientEntityByIdStub = sinon.stub();
    getDoctorEntityByIdStub = sinon.stub();
    getTriageEntityByIdStub = sinon.stub();

    appointmentService = proxyquire("../../src/services/appointmentService", {
      "../data/memoryDb": { db, nextId: nextIdStub },
      "./patientService": { getPatientEntityById: getPatientEntityByIdStub },
      "./doctorService": { getDoctorEntityById: getDoctorEntityByIdStub },
      "./triageService": { getTriageEntityById: getTriageEntityByIdStub }
    });
  });

  afterEach(() => {
    clock.restore();
    sinon.restore();
  });

  it("deve criar um agendamento quando paciente, medico e triagem sao compativeis", () => {
    // Arrange
    nextIdStub.returns("42");
    getPatientEntityByIdStub.returns({ id: "p1", active: true });
    getDoctorEntityByIdStub.returns({ id: "d1", active: true, specialty: "CARDIOLOGY" });
    getTriageEntityByIdStub.returns({ id: "t1", patientId: "p1", suggestedSpecialty: "CARDIOLOGY" });

    const payload = {
      patientId: "p1",
      doctorId: "d1",
      triageId: "t1",
      scheduledAt: "2026-05-01T09:30:00-03:00",
      notes: "  retorno prioritario  "
    };
    const currentUser = { id: "u1" };

    // Act
    const result = appointmentService.createAppointment(payload, currentUser);

    // Assert
    sinon.assert.calledOnceWithExactly(nextIdStub, "appointments");
    assert.deepStrictEqual(result, {
      id: "42",
      patientId: "p1",
      doctorId: "d1",
      triageId: "t1",
      scheduledAt: "2026-05-01T12:30:00.000Z",
      status: "SCHEDULED",
      notes: "retorno prioritario",
      createdByUserId: "u1",
      createdAt: "2026-04-22T12:00:00.000Z",
      updatedAt: "2026-04-22T12:00:00.000Z"
    });
    assert.deepStrictEqual(db.appointments, [result]);
  });

  it("deve lancar erro de validacao quando scheduledAt for invalido", () => {
    // Arrange
    const payload = {
      patientId: "p1",
      doctorId: "d1",
      scheduledAt: "not-a-date"
    };
    const currentUser = { id: "u1" };

    // Act
    const execute = () => appointmentService.createAppointment(payload, currentUser);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "scheduledAt" }
    });
  });

  it("deve lancar erro de conflito quando o paciente estiver inativo", () => {
    // Arrange
    getPatientEntityByIdStub.returns({ id: "p1", active: false });
    getDoctorEntityByIdStub.returns({ id: "d1", active: true, specialty: "CARDIOLOGY" });

    const payload = {
      patientId: "p1",
      doctorId: "d1",
      scheduledAt: "2026-05-01T09:30:00-03:00"
    };
    const currentUser = { id: "u1" };

    // Act
    const execute = () => appointmentService.createAppointment(payload, currentUser);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "PATIENT_INACTIVE"
    });
  });

  it("deve lancar erro de conflito quando a triagem pertencer a outro paciente", () => {
    // Arrange
    getPatientEntityByIdStub.returns({ id: "p1", active: true });
    getDoctorEntityByIdStub.returns({ id: "d1", active: true, specialty: "CARDIOLOGY" });
    getTriageEntityByIdStub.returns({ id: "t1", patientId: "p2", suggestedSpecialty: "CARDIOLOGY" });

    const payload = {
      patientId: "p1",
      doctorId: "d1",
      triageId: "t1",
      scheduledAt: "2026-05-01T09:30:00-03:00"
    };
    const currentUser = { id: "u1" };

    // Act
    const execute = () => appointmentService.createAppointment(payload, currentUser);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "TRIAGE_PATIENT_MISMATCH"
    });
  });

  it("deve lancar erro de conflito quando a especialidade do medico nao corresponder a da triagem", () => {
    // Arrange
    getPatientEntityByIdStub.returns({ id: "p1", active: true });
    getDoctorEntityByIdStub.returns({ id: "d1", active: true, specialty: "CARDIOLOGY" });
    getTriageEntityByIdStub.returns({ id: "t1", patientId: "p1", suggestedSpecialty: "NEUROLOGY" });

    const payload = {
      patientId: "p1",
      doctorId: "d1",
      triageId: "t1",
      scheduledAt: "2026-05-01T09:30:00-03:00"
    };
    const currentUser = { id: "u1" };

    // Act
    const execute = () => appointmentService.createAppointment(payload, currentUser);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "DOCTOR_SPECIALTY_MISMATCH"
    });
  });

  it("deve lancar erro de conflito quando o medico ja possuir outro agendamento no mesmo horario", () => {
    // Arrange
    db.appointments.push({
      id: "existing",
      doctorId: "d1",
      scheduledAt: "2026-05-01T12:30:00.000Z",
      status: "SCHEDULED"
    });
    getPatientEntityByIdStub.returns({ id: "p1", active: true });
    getDoctorEntityByIdStub.returns({ id: "d1", active: true, specialty: "CARDIOLOGY" });

    const payload = {
      patientId: "p1",
      doctorId: "d1",
      scheduledAt: "2026-05-01T09:30:00-03:00"
    };
    const currentUser = { id: "u1" };

    // Act
    const execute = () => appointmentService.createAppointment(payload, currentUser);

    // Assert
    assertHttpError(execute, {
      status: 409,
      code: "APPOINTMENT_CONFLICT"
    });
  });

  it("deve aplicar filtros por paciente, medico, status e intervalo de datas ao listar agendamentos", () => {
    // Arrange
    db.appointments.push(
      {
        id: "a1",
        patientId: "p1",
        doctorId: "d1",
        triageId: "t1",
        scheduledAt: "2026-05-01T12:30:00.000Z",
        status: "SCHEDULED"
      },
      {
        id: "a2",
        patientId: "p2",
        doctorId: "d1",
        triageId: "t2",
        scheduledAt: "2026-05-02T12:30:00.000Z",
        status: "CANCELLED"
      },
      {
        id: "a3",
        patientId: "p1",
        doctorId: "d2",
        triageId: "t3",
        scheduledAt: "2026-05-03T12:30:00.000Z",
        status: "SCHEDULED"
      }
    );

    const filters = {
      patientId: "p1",
      status: "SCHEDULED",
      scheduledFrom: "2026-05-01T00:00:00.000Z",
      scheduledTo: "2026-05-02T23:59:59.999Z"
    };

    // Act
    const result = appointmentService.listAppointments(filters);

    // Assert
    assert.deepStrictEqual(result, [
      {
        id: "a1",
        patientId: "p1",
        doctorId: "d1",
        triageId: "t1",
        scheduledAt: "2026-05-01T12:30:00.000Z",
        status: "SCHEDULED"
      }
    ]);
  });

  it("deve rejeitar filtro scheduledFrom invalido ao listar agendamentos", () => {
    // Arrange
    const filters = {
      scheduledFrom: "amanha cedo"
    };

    // Act
    const execute = () => appointmentService.listAppointments(filters);

    // Assert
    assertHttpError(execute, {
      status: 400,
      code: "VALIDATION_ERROR",
      details: { field: "scheduledFrom" }
    });
  });
});
