const { appointment, doctor, patient, symptom } = require("../../support/apiFactories");

describe("API - Patients", () => {
  beforeEach(() => cy.resetApiData());

  it("US05 CT01: cria paciente convertendo opcionais vazios para null", () => {
    cy.apiRequestAs("RECEPTIONIST", "POST", "/patients", patient({ email: "", notes: "" })).then((r) => {
      expect(r.status).to.eq(201); expect(r.body.data.email).to.be.null; expect(r.body.data.notes).to.be.null;
    });
  });
  it("US05 CT02: rejeita criacao de paciente por falta de permissao", () => cy.apiRequestAs("DOCTOR", "POST", "/patients", patient()).then((r) => cy.apiExpectError(r, 403, "FORBIDDEN")));
  it("US05 CT03: rejeita criacao sem campos obrigatorios", () => cy.apiRequestAs("ADMIN", "POST", "/patients", { name: "Incompleto" }).then((r) => cy.apiExpectError(r, 400, "VALIDATION_ERROR")));
  it("US05 CT04: rejeita criacao com data invalida", () => cy.apiRequestAs("ADMIN", "POST", "/patients", patient({ birthDate: "2026-99-99" })).then((r) => cy.apiExpectError(r, 400, "VALIDATION_ERROR")));
  it("US05 CT05: rejeita criacao com documento duplicado", () => {
    const data = patient({ document: "11111111111" });
    cy.apiRequestAs("ADMIN", "POST", "/patients", data).then(() => cy.apiRequestAs("ADMIN", "POST", "/patients", patient({ document: data.document }))).then((r) => cy.apiExpectError(r, 409, "PATIENT_DOCUMENT_ALREADY_EXISTS"));
  });
  it("US06 CT01: permite listar e consultar pacientes por perfil autorizado", () => {
    cy.apiRequestAs("RECEPTIONIST", "POST", "/patients", patient()).then((created) => cy.apiRequestAs("RECEPTIONIST", "GET", "/patients").then((list) => ({ created, list }))).then(({ created, list }) => {
      expect(list.status).to.eq(200); expect(list.body.data).to.have.length(1);
      return cy.apiRequestAs("RECEPTIONIST", "GET", `/patients/${created.body.data.id}`);
    }).then((r) => { expect(r.status).to.eq(200); });
  });
  it("US06 CT02: rejeita consulta de pacientes por perfil nao autorizado", () => cy.apiRequestAs("DOCTOR", "GET", "/patients").then((r) => cy.apiExpectError(r, 403, "FORBIDDEN")));
  it("US06 CT03: aplica filtros na consulta de pacientes", () => {
    cy.apiRequestAs("ADMIN", "POST", "/patients", patient({ document: "11111111111", name: "Joao da Costa" })).then(() => cy.apiRequestAs("ADMIN", "POST", "/patients", patient({ document: "22222222222" }))).then(() => cy.apiRequestAs("ADMIN", "GET", "/patients?document=11111111111")).then((r) => { expect(r.status).to.eq(200); expect(r.body.data).to.have.length(1); expect(r.body.data[0].name).to.eq("Joao da Costa"); });
  });
  it("US06 CT04: retorna nao encontrado ao consultar paciente inexistente", () => cy.apiRequestAs("ADMIN", "GET", "/patients/999").then((r) => cy.apiExpectError(r, 404, "PATIENT_NOT_FOUND")));
  it("US07 CT01: atualiza paciente convertendo opcionais vazios para null", () => {
    cy.apiRequestAs("RECEPTIONIST", "POST", "/patients", patient()).then((c) => cy.apiRequestAs("RECEPTIONIST", "PUT", `/patients/${c.body.data.id}`, { birthDate: "1991-06-11", document: "33333333333", email: "", notes: "" })).then((r) => { expect(r.status).to.eq(200); expect(r.body.data.email).to.be.null; expect(r.body.data.notes).to.be.null; });
  });
  it("US07 CT02: rejeita atualizacao por falta de permissao", () => cy.apiRequestAs("ADMIN", "POST", "/patients", patient()).then((c) => cy.apiRequestAs("DOCTOR", "PUT", `/patients/${c.body.data.id}`, { name: "Bloqueado" })).then((r) => cy.apiExpectError(r, 403, "FORBIDDEN")));
  it("US07 CT03: rejeita atualizacao com data invalida", () => cy.apiRequestAs("ADMIN", "POST", "/patients", patient()).then((c) => cy.apiRequestAs("ADMIN", "PUT", `/patients/${c.body.data.id}`, { birthDate: "invalida" })).then((r) => cy.apiExpectError(r, 400, "VALIDATION_ERROR")));
  it("US07 CT04: rejeita atualizacao com documento duplicado", () => {
    cy.apiRequestAs("ADMIN", "POST", "/patients", patient({ document: "11111111111" })).then((first) => cy.apiRequestAs("ADMIN", "POST", "/patients", patient({ document: "22222222222" })).then(() => first)).then((first) => cy.apiRequestAs("ADMIN", "PUT", `/patients/${first.body.data.id}`, { document: "22222222222" })).then((r) => cy.apiExpectError(r, 409, "PATIENT_DOCUMENT_ALREADY_EXISTS"));
  });
  it("US08 CT01: inativa paciente e impede novo uso em triagem e agendamento", () => {
    cy.apiRequestAs("ADMIN", "POST", "/patients", patient()).then((p) => cy.apiRequestAs("ADMIN", "DELETE", `/patients/${p.body.data.id}`).then(() => p)).then((p) => cy.apiRequestAs("ADMIN", "POST", "/symptoms", symptom()).then((s) => ({ p, s }))).then(({ p, s }) => cy.apiRequestAs("ADMIN", "POST", "/triages", { patientId: p.body.data.id, symptomIds: [s.body.data.id] }).then((triage) => ({ p, triage }))).then(({ p }) => cy.apiRequestAs("ADMIN", "POST", "/doctors", doctor()).then((d) => ({ p, d }))).then(({ p, d }) => cy.apiRequestAs("ADMIN", "POST", "/appointments", appointment({ patientId: p.body.data.id, doctorId: d.body.data.id }))).then((r) => cy.apiExpectError(r, 409, "PATIENT_INACTIVE"));
  });
  it("US08 CT02: rejeita inativacao por perfil nao autorizado", () => cy.apiRequestAs("ADMIN", "POST", "/patients", patient()).then((p) => cy.apiRequestAs("DOCTOR", "DELETE", `/patients/${p.body.data.id}`)).then((r) => cy.apiExpectError(r, 403, "FORBIDDEN")));
});
