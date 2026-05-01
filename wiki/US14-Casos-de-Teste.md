# US14 - Listar e consultar medicos cadastrados

## Referencias

- [Epico 4 - Gerenciamento de Medicos](Epico-4-Gerenciamento-de-Medicos)

## Visao geral

Esta user story valida listar e consultar medicos cadastrados com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir consulta de medicos

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem ou consulta de medicos
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando solicita a listagem ou consulta de medicos
- Entao o sistema deve rejeitar a operacao

### CT03 - Retornar apenas medicos disponiveis para encaminhamento e agenda

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem de medicos
- Entao o sistema deve retornar apenas medicos disponiveis para encaminhamento e agenda

### CT04 - Retornar nao encontrado ao consultar medico inexistente por identificador

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando consulta um medico por identificador inexistente
- Entao o sistema deve retornar nao encontrado
