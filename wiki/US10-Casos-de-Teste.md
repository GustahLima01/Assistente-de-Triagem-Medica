# US10 - Listar e consultar sintomas cadastrados

## Referencias

- [Epico 3 - Gerenciamento de Sintomas](Epico-3-Gerenciamento-de-Sintomas)

## Visao geral

Esta user story valida listar e consultar sintomas cadastrados com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir consulta de sintomas

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem ou consulta de sintomas
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando solicita a listagem ou consulta de sintomas
- Entao o sistema deve rejeitar a operacao

### CT03 - Retornar apenas a base de sintomas disponivel para triagem

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem de sintomas
- Entao o sistema deve retornar apenas sintomas disponiveis para triagem

### CT04 - Retornar nao encontrado ao consultar sintoma inexistente por identificador

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando consulta um sintoma por identificador inexistente
- Entao o sistema deve retornar nao encontrado
