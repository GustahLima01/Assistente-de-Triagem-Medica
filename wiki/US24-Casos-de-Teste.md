# US24 - Consultar os agendamentos realizados

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epicos-e-User-Stories#epico-6---agendamento-de-consulta-medica)

## Visao geral

Esta user story valida consultar os agendamentos realizados com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir consulta de agendamentos

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US24.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST

**Resultado esperado**

Permitir consulta de agendamentos.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando solicita a listagem ou consulta de agendamentos
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US24.

**Cenario resumido**

- Perfil solicitante: Outro

**Resultado esperado**

Rejeitar consulta.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando solicita a listagem ou consulta de agendamentos
- Entao o sistema deve rejeitar a operacao

### CT03 - Aplicar filtros na consulta de agendamentos

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US24.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST

**Resultado esperado**

Retornar somente os agendamentos que atendem ao filtro aplicado.

**Leitura de negocio**

Este caso assegura visibilidade operacional da agenda conforme a necessidade de consulta do atendimento.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando consulta agendamentos com filtro valido
- Entao o sistema deve retornar apenas os agendamentos compativeis com o filtro aplicado

### CT04 - Retornar nao encontrado ao consultar agendamento inexistente por identificador

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US24.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST

**Resultado esperado**

Retornar nao encontrado para o identificador consultado.

**Leitura de negocio**

Este caso evita leitura incorreta da agenda e melhora a confiabilidade da consulta de atendimento.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
- Quando consulta um agendamento por identificador inexistente
- Entao o sistema deve retornar nao encontrado

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como consultar os agendamentos realizados deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
