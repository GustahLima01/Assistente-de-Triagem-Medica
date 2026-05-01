const { db } = require("./memoryDb");
const { createDoctor } = require("../services/doctorService");
const { createSymptom } = require("../services/symptomService");

const BOOTSTRAP_DOCTORS = [
  {
    name: "Dra. Helena Martins",
    crm: "CRM-PED-0001",
    specialty: "Pediatria",
    phone: "+551130010001",
    email: "helena.martins.pediatria@clinica.local"
  },
  {
    name: "Dr. Rafael Costa",
    crm: "CRM-PED-0002",
    specialty: "Pediatria",
    phone: "+551130010002",
    email: "rafael.costa.pediatria@clinica.local"
  },
  {
    name: "Dra. Camila Araujo",
    crm: "CRM-GOB-0001",
    specialty: "Ginecologia e Obstetricia",
    phone: "+551130010003",
    email: "camila.araujo.gineco@clinica.local"
  },
  {
    name: "Dra. Bruna Nascimento",
    crm: "CRM-GOB-0002",
    specialty: "Ginecologia e Obstetricia",
    phone: "+551130010004",
    email: "bruna.nascimento.gineco@clinica.local"
  },
  {
    name: "Dr. Thiago Almeida",
    crm: "CRM-CAR-0001",
    specialty: "Cardiologia",
    phone: "+551130010005",
    email: "thiago.almeida.cardio@clinica.local"
  },
  {
    name: "Dra. Marina Ribeiro",
    crm: "CRM-CAR-0002",
    specialty: "Cardiologia",
    phone: "+551130010006",
    email: "marina.ribeiro.cardio@clinica.local"
  },
  {
    name: "Dr. Andre Lopes",
    crm: "CRM-ORT-0001",
    specialty: "Ortopedia e Traumatologia",
    phone: "+551130010007",
    email: "andre.lopes.ortopedia@clinica.local"
  },
  {
    name: "Dra. Juliana Freitas",
    crm: "CRM-ORT-0002",
    specialty: "Ortopedia e Traumatologia",
    phone: "+551130010008",
    email: "juliana.freitas.ortopedia@clinica.local"
  },
  {
    name: "Dra. Patricia Moura",
    crm: "CRM-PSI-0001",
    specialty: "Psiquiatria",
    phone: "+551130010009",
    email: "patricia.moura.psiquiatria@clinica.local"
  },
  {
    name: "Dr. Felipe Santana",
    crm: "CRM-PSI-0002",
    specialty: "Psiquiatria",
    phone: "+551130010010",
    email: "felipe.santana.psiquiatria@clinica.local"
  },
  {
    name: "Dra. Larissa Gomes",
    crm: "CRM-DER-0001",
    specialty: "Dermatologia",
    phone: "+551130010011",
    email: "larissa.gomes.dermato@clinica.local"
  },
  {
    name: "Dr. Vinicius Rocha",
    crm: "CRM-DER-0002",
    specialty: "Dermatologia",
    phone: "+551130010012",
    email: "vinicius.rocha.dermato@clinica.local"
  },
  {
    name: "Dra. Renata Barbosa",
    crm: "CRM-OFT-0001",
    specialty: "Oftalmologia",
    phone: "+551130010013",
    email: "renata.barbosa.oftalmo@clinica.local"
  },
  {
    name: "Dr. Eduardo Pires",
    crm: "CRM-OFT-0002",
    specialty: "Oftalmologia",
    phone: "+551130010014",
    email: "eduardo.pires.oftalmo@clinica.local"
  },
  {
    name: "Dra. Natalia Fernandes",
    crm: "CRM-NEU-0001",
    specialty: "Neurologia",
    phone: "+551130010015",
    email: "natalia.fernandes.neuro@clinica.local"
  },
  {
    name: "Dr. Gustavo Teixeira",
    crm: "CRM-NEU-0002",
    specialty: "Neurologia",
    phone: "+551130010016",
    email: "gustavo.teixeira.neuro@clinica.local"
  },
  {
    name: "Dr. Marcelo Vieira",
    crm: "CRM-OTO-0001",
    specialty: "Otorrinolaringologista",
    phone: "+551130010017",
    email: "marcelo.vieira.otorrino@clinica.local"
  },
  {
    name: "Dra. Aline Duarte",
    crm: "CRM-OTO-0002",
    specialty: "Otorrinolaringologista",
    phone: "+551130010018",
    email: "aline.duarte.otorrino@clinica.local"
  }
];

const BOOTSTRAP_SYMPTOMS = [
  ["Pediatria", "Bronquiolite", "Tosse", "MEDIUM"],
  ["Pediatria", "Bronquiolite", "Chiado no peito", "HIGH"],
  ["Pediatria", "Bronquiolite", "Dificuldade para respirar", "CRITICAL"],
  ["Pediatria", "Bronquiolite", "Febre", "MEDIUM"],
  ["Pediatria", "Otite media", "Dor de ouvido", "MEDIUM"],
  ["Pediatria", "Otite media", "Febre", "MEDIUM"],
  ["Pediatria", "Otite media", "Irritabilidade", "LOW"],
  ["Pediatria", "Otite media", "Diminuicao da audicao", "MEDIUM"],
  ["Ginecologia e Obstetricia", "Endometriose", "Dor pelvica", "MEDIUM"],
  ["Ginecologia e Obstetricia", "Endometriose", "Colica intensa", "HIGH"],
  ["Ginecologia e Obstetricia", "Endometriose", "Dor durante relacao", "MEDIUM"],
  ["Ginecologia e Obstetricia", "Endometriose", "Infertilidade", "LOW"],
  ["Ginecologia e Obstetricia", "Sindrome dos ovarios policisticos", "Menstruacao irregular", "LOW"],
  ["Ginecologia e Obstetricia", "Sindrome dos ovarios policisticos", "Acne", "LOW"],
  ["Ginecologia e Obstetricia", "Sindrome dos ovarios policisticos", "Excesso de pelos", "LOW"],
  ["Ginecologia e Obstetricia", "Sindrome dos ovarios policisticos", "Dificuldade para engravidar", "LOW"],
  ["Cardiologia", "Infarto agudo do miocardio", "Dor no peito", "CRITICAL"],
  ["Cardiologia", "Infarto agudo do miocardio", "Falta de ar", "CRITICAL"],
  ["Cardiologia", "Infarto agudo do miocardio", "Sudorese", "HIGH"],
  ["Cardiologia", "Infarto agudo do miocardio", "Nausea", "MEDIUM"],
  ["Cardiologia", "Insuficiencia cardiaca", "Falta de ar", "HIGH"],
  ["Cardiologia", "Insuficiencia cardiaca", "Inchaco nas pernas", "MEDIUM"],
  ["Cardiologia", "Insuficiencia cardiaca", "Fadiga", "MEDIUM"],
  ["Cardiologia", "Insuficiencia cardiaca", "Tosse", "LOW"],
  ["Ortopedia e Traumatologia", "Fratura ossea", "Dor intensa", "HIGH"],
  ["Ortopedia e Traumatologia", "Fratura ossea", "Inchaco", "MEDIUM"],
  ["Ortopedia e Traumatologia", "Fratura ossea", "Deformidade", "HIGH"],
  ["Ortopedia e Traumatologia", "Fratura ossea", "Dificuldade de movimento", "HIGH"],
  ["Ortopedia e Traumatologia", "Tendinite", "Dor localizada", "MEDIUM"],
  ["Ortopedia e Traumatologia", "Tendinite", "Inchaco", "LOW"],
  ["Ortopedia e Traumatologia", "Tendinite", "Sensibilidade", "LOW"],
  ["Ortopedia e Traumatologia", "Tendinite", "Limitacao de movimento", "MEDIUM"],
  ["Psiquiatria", "Depressao", "Tristeza persistente", "MEDIUM"],
  ["Psiquiatria", "Depressao", "Perda de interesse", "MEDIUM"],
  ["Psiquiatria", "Depressao", "Fadiga", "LOW"],
  ["Psiquiatria", "Depressao", "Alteracao do sono", "MEDIUM"],
  ["Psiquiatria", "Transtorno de ansiedade generalizada", "Preocupacao excessiva", "MEDIUM"],
  ["Psiquiatria", "Transtorno de ansiedade generalizada", "Irritabilidade", "LOW"],
  ["Psiquiatria", "Transtorno de ansiedade generalizada", "Tensao muscular", "LOW"],
  ["Psiquiatria", "Transtorno de ansiedade generalizada", "Insonia", "MEDIUM"],
  ["Dermatologia", "Dermatite atopica", "Coceira", "LOW"],
  ["Dermatologia", "Dermatite atopica", "Vermelhidao", "LOW"],
  ["Dermatologia", "Dermatite atopica", "Pele seca", "LOW"],
  ["Dermatologia", "Dermatite atopica", "Descamacao", "LOW"],
  ["Dermatologia", "Psoriase", "Placas vermelhas", "MEDIUM"],
  ["Dermatologia", "Psoriase", "Descamacao", "LOW"],
  ["Dermatologia", "Psoriase", "Coceira", "LOW"],
  ["Dermatologia", "Psoriase", "Pele ressecada", "LOW"],
  ["Oftalmologia", "Conjuntivite", "Vermelhidao", "LOW"],
  ["Oftalmologia", "Conjuntivite", "Secrecao", "LOW"],
  ["Oftalmologia", "Conjuntivite", "Coceira", "LOW"],
  ["Oftalmologia", "Conjuntivite", "Lacrimejamento", "LOW"],
  ["Oftalmologia", "Glaucoma", "Dor ocular", "HIGH"],
  ["Oftalmologia", "Glaucoma", "Perda de visao periferica", "HIGH"],
  ["Oftalmologia", "Glaucoma", "Visao embacada", "MEDIUM"],
  ["Oftalmologia", "Glaucoma", "Halos", "MEDIUM"],
  ["Neurologia", "Epilepsia", "Convulsoes", "CRITICAL"],
  ["Neurologia", "Epilepsia", "Perda de consciencia", "CRITICAL"],
  ["Neurologia", "Epilepsia", "Movimentos involuntarios", "HIGH"],
  ["Neurologia", "Epilepsia", "Confusao", "HIGH"],
  ["Neurologia", "Doenca de Parkinson", "Tremor", "MEDIUM"],
  ["Neurologia", "Doenca de Parkinson", "Rigidez muscular", "MEDIUM"],
  ["Neurologia", "Doenca de Parkinson", "Lentidao", "MEDIUM"],
  ["Neurologia", "Doenca de Parkinson", "Instabilidade postural", "HIGH"],
  ["Otorrinolaringologista", "Sinusite", "Dor facial", "MEDIUM"],
  ["Otorrinolaringologista", "Sinusite", "Congestao nasal", "LOW"],
  ["Otorrinolaringologista", "Sinusite", "Secrecao nasal", "LOW"],
  ["Otorrinolaringologista", "Sinusite", "Dor de cabeca", "MEDIUM"],
  ["Otorrinolaringologista", "Amigdalite", "Dor de garganta", "MEDIUM"],
  ["Otorrinolaringologista", "Amigdalite", "Febre", "MEDIUM"],
  ["Otorrinolaringologista", "Amigdalite", "Dificuldade para engolir", "HIGH"],
  ["Otorrinolaringologista", "Amigdalite", "Placas na garganta", "MEDIUM"]
].map(([specialty, disease, name, severity]) => ({
  specialty,
  disease,
  name,
  severity
}));

function buildSymptomPayload(symptom) {
  return {
    name: symptom.name,
    severity: symptom.severity,
    specialty: symptom.specialty,
    description: `Doenca de referencia: ${symptom.disease}.`
  };
}

function seedBootstrapCatalog() {
  if (db.doctors.length > 0 || db.symptoms.length > 0) {
    return {
      doctorsCreated: 0,
      symptomsCreated: 0,
      skipped: true
    };
  }

  BOOTSTRAP_DOCTORS.forEach((doctor) => {
    createDoctor(doctor);
  });

  BOOTSTRAP_SYMPTOMS.forEach((symptom) => {
    createSymptom(buildSymptomPayload(symptom));
  });

  return {
    doctorsCreated: BOOTSTRAP_DOCTORS.length,
    symptomsCreated: BOOTSTRAP_SYMPTOMS.length,
    skipped: false
  };
}

module.exports = {
  BOOTSTRAP_DOCTORS,
  BOOTSTRAP_SYMPTOMS,
  seedBootstrapCatalog
};
