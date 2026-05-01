# US19 - Visualizar a prioridade calculada da triagem

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida visualizar a prioridade calculada da triagem com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Retornar a maior severidade entre os sintomas informados

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US19.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Sintomas informados: Com severidades validas

**Resultado esperado**

Retornar a maior severidade entre os sintomas informados.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando consulta a prioridade calculada a partir de sintomas validos
- Entao o sistema deve retornar a maior severidade entre os sintomas informados

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US19.

**Cenario resumido**

- Perfil solicitante: Outro
- Sintomas informados: Com severidades validas

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando consulta a prioridade da triagem
- Entao o sistema deve rejeitar a operacao

### CT03 - Especificacao em aberto para comportamento

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US19.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Sintomas informados: Nao disponiveis para consulta

**Resultado esperado**

Rejeitar por sintoma inativo.

**Leitura de negocio**

Este caso deixa visivel uma lacuna de especificacao e ajuda a orientar um refinamento futuro do requisito.

**Cenario em Gherkin**

- Dado que nao ha sintomas disponiveis para calcular prioridade
- Quando a consulta e realizada
- Entao o sistema deve rejeitar a operacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como visualizar a prioridade calculada da triagem deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
