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

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US11.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Severidade: Valida
- Especialidade: Informada

**Resultado esperado**

Atualizar sintoma.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando atualiza o sintoma com severidade valida e especialidade informada
- Entao o sistema deve salvar a alteracao

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US11.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN
- Severidade: Valida
- Especialidade: Informada

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta editar um sintoma
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por severidade invalida

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US11.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Severidade: Invalida
- Especialidade: Informada

**Resultado esperado**

Rejeitar por severidade invalida.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa severidade invalida na edicao
- Entao o sistema deve rejeitar a atualizacao

### CT04 - Rejeitar por falta de especialidade

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US11.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Severidade: Valida
- Especialidade: Ausente

**Resultado esperado**

Rejeitar por falta de especialidade.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando remove a especialidade associada ao sintoma
- Entao o sistema deve rejeitar a atualizacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como editar um sintoma deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
