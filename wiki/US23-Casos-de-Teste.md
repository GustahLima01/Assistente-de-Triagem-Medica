# US23 - Validar conflito de horarios no agendamento

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epico-6-Agendamento-de-Consulta-Medica)

## Visao geral

Esta user story valida validar conflito de horarios no agendamento com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir criacao sem conflito

**Cenario em Gherkin**

- Dado que a data e hora informadas podem ser normalizadas para ISO
- Quando nao existe outro agendamento com status SCHEDULED para o mesmo medico no mesmo horario
- Entao o sistema deve permitir a criacao

### CT02 - Rejeitar por conflito de horario

**Cenario em Gherkin**

- Dado que a data e hora informadas podem ser normalizadas para ISO
- Quando ja existe agendamento SCHEDULED para o mesmo medico no mesmo horario
- Entao o sistema deve rejeitar a criacao por conflito

### CT03 - Rejeitar por data invalida

**Cenario em Gherkin**

- Dado que a data e hora informadas nao podem ser normalizadas para ISO
- Quando o agendamento e submetido
- Entao o sistema deve rejeitar a criacao
