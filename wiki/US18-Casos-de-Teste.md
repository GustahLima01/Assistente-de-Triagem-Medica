# US18 - Consultar a especialidade sugerida

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida consultar a especialidade sugerida com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Retornar especialidade com maior soma de pesos

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando informa symptomIds validos cuja soma de pesos aponta uma especialidade unica
- Entao o sistema deve retornar a especialidade com maior pontuacao

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando consulta a especialidade sugerida
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por symptomIds invalido

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando nao envia symptomIds em array nao vazio
- Entao o sistema deve rejeitar a consulta

### CT04 - Retornar especialidade vencedora pelo desempate alfabetico

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando duas ou mais especialidades empatam na pontuacao total
- Entao o sistema deve retornar a especialidade vencedora em ordem alfabetica
