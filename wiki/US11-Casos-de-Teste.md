# US11 - Editar um sintoma

## Referencias

- [Epico 3 - Gerenciamento de Sintomas](Epico-3-Gerenciamento-de-Sintomas)

## Visao geral

Esta user story valida editar um sintoma com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar sintoma

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando atualiza o sintoma com severidade valida e especialidade informada
- Entao o sistema deve salvar a alteracao

### CT02 - Rejeitar por falta de permissao

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta editar um sintoma
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por severidade invalida

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa severidade invalida na edicao
- Entao o sistema deve rejeitar a atualizacao

### CT04 - Rejeitar por falta de especialidade

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando remove a especialidade associada ao sintoma
- Entao o sistema deve rejeitar a atualizacao
