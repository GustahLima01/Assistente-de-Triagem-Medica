# Assistente de Triagem Medica

API REST para apoiar o fluxo inicial de triagem de uma clinica. O projeto foi construido com Express, autenticacao JWT, persistencia em memoria e documentacao OpenAPI/Swagger.

## Objetivo

Permitir que usuarios autenticados da clinica realizem:

- gestao de usuarios da clinica
- gestao de pacientes
- gestao de medicos
- gestao de sintomas
- consulta de especialidade medica com base nos sintomas
- registro de triagem
- agendamento de consultas

## Tecnologias

- Node.js
- Express
- JWT com `jsonwebtoken`
- Swagger UI com `swagger-ui-express`
- Mocha
- Supertest
- Chai
- Mochawesome
- banco de dados em memoria

## Estrutura

```text
src/
  controllers/
  data/
  middlewares/
  models/
  routes/
  services/
  utils/
resources/
  swagger.json
tests/
  appointments/
  auth/
  doctors/
  fixtures/
  helpers/
  patients/
  services/
  symptoms/
  triages/
  users/
  utils/
wiki/
  documentacao funcional e casos de teste
```

## Fluxo da Wiki

A documentacao da wiki foi simplificada para trabalhar com uma unica fonte de verdade:

- `wiki/`: fonte oficial versionada no repositorio principal
- `.wiki-publish/`: clone auxiliar local usado apenas no momento da publicacao na GitHub Wiki

Fluxo recomendado:

1. editar os arquivos em `wiki/`
2. revisar e versionar normalmente no repositorio principal
3. publicar na GitHub Wiki somente quando necessario, usando o clone local `.wiki-publish/`

Com isso, evitamos manter duas estruturas editoriais concorrentes dentro do projeto.

## Como executar

```bash
npm install
npm start
```

## Como testar

```bash
npm test
```

Comandos disponiveis:

```bash
npm run test:unit
npm run test:functional
npm run test:functional:report
```

Base inicial para performance com K6:

```bash
npm run test:performance
```

A suite atual cobre testes unitarios para:

- `src/services/appointmentService.js`
- `src/services/doctorService.js`
- `src/services/patientService.js`
- `src/services/symptomService.js`
- `src/services/triageService.js`
- `src/utils/password.js`
- `src/utils/validators.js`

A suite funcional cobre os endpoints:

- `POST /api/auth/login`
- `GET|POST|PUT|DELETE /api/users`
- `GET|POST|PUT|DELETE /api/patients`
- `GET|POST|PUT|DELETE /api/doctors`
- `GET|POST|PUT|DELETE /api/symptoms`
- `POST /api/triages/specialty-consult`
- `GET|POST /api/triages`
- `GET|POST /api/appointments`

Os testes usam `Mocha` como framework principal, `Supertest` para as chamadas HTTP, `Chai` para as assercoes e `Mochawesome` para o relatorio HTML/JSON. A base em memoria e reiniciada a cada teste funcional para garantir isolamento.

Relatorio funcional:

- HTML: `reports/api-tests/index.html`
- JSON: `reports/api-tests/index.json`

Estrutura de performance:

- `tests/performance/auth-login.k6.js`
- `tests/performance/triage-specialty-consult.k6.js`
- `tests/performance/appointments-create.k6.js`
- `tests/performance/reception-journey.k6.js`
- `tests/performance/lib/`

## Testes de Performance com K6

Os roteiros de performance ficam em:

- `tests/performance/auth-login.k6.js`
- `tests/performance/triage-specialty-consult.k6.js`
- `tests/performance/appointments-create.k6.js`
- `tests/performance/reception-journey.k6.js`

Escopo inicial implementado:

- `auth-login.k6.js`: mede autenticacao isolada.
- `triage-specialty-consult.k6.js`: mede a decisao de especialidade com massa preparada no setup.
- `appointments-create.k6.js`: mede a criacao de agendamento com dependencias preparadas no setup.
- `reception-journey.k6.js`: mede a jornada da recepcao com login, cadastro de paciente, consulta de especialidade, triagem e agendamento.

Os scripts compartilham utilitarios em `tests/performance/lib/` para configuracao, payloads, chamadas HTTP e relatorios.

Relatorios gerados por execucao:

- `reports/performance/*.txt`
- `reports/performance/*.json`
- `reports/performance/*.html`

Cada script gera seus artefatos automaticamente via `handleSummary`.

Variaveis de ambiente suportadas pelo script:

- `BASE_URL`: URL base da API. Padrao `http://localhost:3000`
- `ADMIN_EMAIL`: usuario admin para bootstrap. Padrao `admin@clinica.local`
- `ADMIN_PASSWORD`: senha admin para bootstrap. Padrao `Admin@123`
- `THINK_TIME_MS`: pausa entre iteracoes para simular ritmo de uso. Padrao `0`
- `TARGET_VUS`: sobrescreve a carga padrao do script executado
- `RAMP_UP_DURATION`: padrao `10s`
- `STEADY_DURATION`: padrao `20s`
- `RAMP_DOWN_DURATION`: padrao `10s`

Exemplos de execucao:

```bash
npm run test:performance
npm run test:performance:auth-login
npm run test:performance:triage-specialty-consult
npm run test:performance:appointments-create
npm run test:performance:reception-journey
```

Exemplo com parametrizacao:

```bash
k6 run tests/performance/reception-journey.k6.js -e BASE_URL=http://localhost:3000 -e TARGET_VUS=5 -e THINK_TIME_MS=250
```

Observacoes da automacao:

- existe 1 caso funcional marcado como pendente por lacuna de especificacao na wiki: `US19 CT03`
- existe 1 bug conhecido exposto pela automacao: a edicao de sintoma aceita remover `specialty`, contrariando `US11 CT04`

Servidor padrao:

```text
http://localhost:3000
```

## Documentacao Swagger

- UI: `GET /api/docs`

O arquivo de especificacao fica em:

```text
resources/swagger.json
```

## Autenticacao

A autenticacao usa token JWT no middleware. Envie o token no cabecalho:

```text
Authorization: Bearer <token>
```

Usuario inicial para bootstrap:

- email: `admin@clinica.local`
- senha: `Admin@123`

## Perfis e permissoes

- `ADMIN`: gerencia usuarios, medicos, sintomas, pacientes, triagens e agendamentos
- `RECEPTIONIST`: gerencia pacientes, triagens e agendamentos
- `DOCTOR`: reservado para evolucoes futuras; nao possui rotas protegidas expostas neste MVP

## Regras implementadas

- usuarios inativos nao autenticam
- operacoes de exclusao sao tratadas como inativacao logica
- consulta de especialidade considera os sintomas informados e o peso da gravidade
- agendamento valida conflito de horario por medico
- agendamento com `triageId` valida compatibilidade entre especialidade sugerida e especialidade do medico
- dados sao reiniciados quando a aplicacao e reiniciada

## Endpoints principais

### Publico

- `POST /api/auth/login`
- `GET /api/health`
- `GET /api/docs`

### Protegidos

- `GET|POST|PUT|DELETE /api/users`
- `GET|POST|PUT|DELETE /api/patients`
- `GET|POST|PUT|DELETE /api/doctors`
- `GET|POST|PUT|DELETE /api/symptoms`
- `POST /api/triages/specialty-consult`
- `GET|POST /api/triages`
- `GET /api/triages/:id`
- `GET|POST /api/appointments`
- `GET /api/appointments/:id`

## Formato de resposta

Sucesso:

```json
{
  "success": true,
  "message": "Operacao realizada com sucesso.",
  "data": {}
}
```

Erro:

```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Campos obrigatorios ausentes.",
    "details": {
      "missing": ["email"]
    }
  }
}
```

## Observacoes

- Este projeto nao realiza diagnostico medico.
- O banco em memoria atende apenas ao MVP.
- Para ambiente produtivo, a proxima etapa natural e substituir a camada `data` por persistencia real e reforcar auditoria/logs.
