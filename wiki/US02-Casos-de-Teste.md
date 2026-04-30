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

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US02.

**Cenario resumido**

- Usuario: Ativo
- Credenciais: Validas

**Resultado esperado**

Autenticar e conceder acesso.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que existe um usuario ativo
- Quando ele informa email e password validos
- Entao o sistema deve autenticar o usuario

### CT02 - Rejeitar autenticacao (inativo)

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US02.

**Cenario resumido**

- Usuario: Inativo
- Credenciais: Validas

**Resultado esperado**

Rejeitar autenticacao.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que existe um usuario inativo
- Quando ele informa credenciais validas
- Entao o sistema deve rejeitar a autenticacao

### CT03 - Rejeitar autenticacao (ativo)

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US02.

**Cenario resumido**

- Usuario: Ativo
- Credenciais: Invalidas

**Resultado esperado**

Rejeitar autenticacao.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que existe um usuario ativo
- Quando ele informa email ou password invalidos
- Entao o sistema deve rejeitar a autenticacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como fazer login no sistema deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
