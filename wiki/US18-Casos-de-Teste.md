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

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US18.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- symptomIds: Array nao vazio
- Pontuacao por especialidade: Vencedor unico

**Resultado esperado**

Retornar especialidade com maior soma de pesos.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando informa symptomIds validos cuja soma de pesos aponta uma especialidade unica
- Entao o sistema deve retornar a especialidade com maior pontuacao

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US18.

**Cenario resumido**

- Perfil solicitante: Outro
- symptomIds: Array nao vazio
- Pontuacao por especialidade: Vencedor unico

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando consulta a especialidade sugerida
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por symptomIds invalido

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US18.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- symptomIds: Ausente vazio ou nao array

**Resultado esperado**

Rejeitar por symptomIds invalido.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando nao envia symptomIds em array nao vazio
- Entao o sistema deve rejeitar a consulta

### CT04 - Retornar especialidade vencedora pelo desempate alfabetico

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US18.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- symptomIds: Array nao vazio
- Pontuacao por especialidade: Empate

**Resultado esperado**

Retornar especialidade vencedora pelo desempate alfabetico.

**Leitura de negocio**

Este caso mostra que o sistema possui criterio objetivo de desempate, o que melhora previsibilidade e transparencia.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando duas ou mais especialidades empatam na pontuacao total
- Entao o sistema deve retornar a especialidade vencedora em ordem alfabetica

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como consultar a especialidade sugerida deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
