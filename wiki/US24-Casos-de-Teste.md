# US24 - Consultar os agendamentos realizados

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epico-6-Agendamento-de-Consulta-Medica)

## Visao geral

Esta user story valida consultar os agendamentos realizados com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir consulta de agendamentos

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando solicita a listagem ou consulta de agendamentos
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando solicita a listagem ou consulta de agendamentos
- Entao o sistema deve rejeitar a operacao

### CT03 - Aplicar filtros na consulta de agendamentos

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando consulta agendamentos com filtro valido
- Entao o sistema deve retornar apenas os agendamentos compativeis com o filtro aplicado

### CT04 - Retornar nao encontrado ao consultar agendamento inexistente por identificador

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando consulta um agendamento por identificador inexistente
- Entao o sistema deve retornar nao encontrado
