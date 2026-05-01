# US21 - Agendar uma consulta para o paciente

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epico-6-Agendamento-de-Consulta-Medica)

## Visao geral

Esta user story valida agendar uma consulta para o paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Criar agendamento com scheduledAt normalizado, status SCHEDULED e usuario responsavel

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para agendamentos
- Quando informa patientId, doctorId e scheduledAt valido para paciente ativo e medico ativo
- Entao o sistema deve criar o agendamento com data normalizada em ISO, status SCHEDULED e usuario responsavel

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta criar um agendamento
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por obrigatoriedade

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando nao informa todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar por data invalida

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa scheduledAt invalido
- Entao o sistema deve rejeitar a criacao

### CT05 - Rejeitar por paciente inativo

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando tenta agendar consulta para paciente inativo
- Entao o sistema deve rejeitar a criacao

### CT06 - Rejeitar por medico inativo

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando tenta agendar consulta com medico inativo
- Entao o sistema deve rejeitar a criacao
