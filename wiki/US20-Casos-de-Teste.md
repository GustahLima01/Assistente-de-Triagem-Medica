# US20 - Registrar o resultado consolidado da triagem

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida registrar o resultado consolidado da triagem com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Persistir resultado consolidado da triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US20.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Resultado consolidado: Completo com especialidade prioridade sintomas e usuario

**Resultado esperado**

Persistir resultado consolidado da triagem.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando conclui o registro de triagem com especialidade sugerida, prioridade, sintomas considerados e usuario responsavel
- Entao o sistema deve persistir o resultado consolidado

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US20.

**Cenario resumido**

- Perfil solicitante: Outro
- Resultado consolidado: Completo com especialidade prioridade sintomas e usuario

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta registrar o resultado consolidado da triagem
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar gravacao do resultado consolidado sem dados essenciais da triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US20.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Resultado consolidado: Incompleto

**Resultado esperado**

Rejeitar a gravacao quando faltarem dados essenciais da triagem.

**Leitura de negocio**

Este caso protege o historico clinico contra registros incompletos que comprometam rastreabilidade e encaminhamento.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando tenta registrar o resultado consolidado sem especialidade sugerida, prioridade, sintomas considerados ou usuario responsavel
- Entao o sistema deve rejeitar a gravacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como registrar o resultado consolidado da triagem deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
