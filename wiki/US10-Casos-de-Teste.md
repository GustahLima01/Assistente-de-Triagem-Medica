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

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US10.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Permitir consulta de sintomas.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem ou consulta de sintomas
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US10.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN

**Resultado esperado**

Rejeitar consulta.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando solicita a listagem ou consulta de sintomas
- Entao o sistema deve rejeitar a operacao

### CT03 - Retornar apenas a base de sintomas disponivel para triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US10.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Retornar apenas sintomas ativos e disponiveis para triagem.

**Leitura de negocio**

Este caso assegura que a base consultada pelo usuario administrativo permaneca confiavel para os fluxos clinicos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem de sintomas
- Entao o sistema deve retornar apenas sintomas disponiveis para triagem

### CT04 - Retornar nao encontrado ao consultar sintoma inexistente por identificador

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US10.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Retornar nao encontrado para o identificador consultado.

**Leitura de negocio**

Este caso evita que consultas invalidas sejam interpretadas como base clinica vazia ou inconsistente.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando consulta um sintoma por identificador inexistente
- Entao o sistema deve retornar nao encontrado

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como listar e consultar sintomas cadastrados deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
