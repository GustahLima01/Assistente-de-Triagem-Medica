# US02 - Fazer login no sistema

## Referencias

- [Epico 1 - Gerenciamento de Usuarios da Clinica](Epico-1-Gerenciamento-de-Usuarios-da-Clinica)

## Visao geral

Esta user story valida fazer login no sistema com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Autenticar e conceder acesso

**Cenario em Gherkin**

- Dado que existe um usuario ativo
- Quando ele informa email e password validos
- Entao o sistema deve autenticar o usuario

### CT02 - Rejeitar autenticacao (inativo)

**Cenario em Gherkin**

- Dado que existe um usuario inativo
- Quando ele informa credenciais validas
- Entao o sistema deve rejeitar a autenticacao

### CT03 - Rejeitar autenticacao (ativo)

**Cenario em Gherkin**

- Dado que existe um usuario ativo
- Quando ele informa email ou password invalidos
- Entao o sistema deve rejeitar a autenticacao
