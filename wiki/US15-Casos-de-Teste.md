# US15 - Editar um medico

## Referencias

- [Epico 4 - Gerenciamento de Medicos](Epico-4-Gerenciamento-de-Medicos)

## Visao geral

Esta user story valida editar um medico com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar medico

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US15.

**Cenario resumido**

- Perfil solicitante: ADMIN
- CRM: Unico ou nao alterado

**Resultado esperado**

Atualizar medico.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando atualiza um medico mantendo CRM unico
- Entao o sistema deve salvar a alteracao

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US15.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN
- CRM: Unico ou nao alterado

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta editar um medico
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por CRM duplicado

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US15.

**Cenario resumido**

- Perfil solicitante: ADMIN
- CRM: Duplicado

**Resultado esperado**

Rejeitar por CRM duplicado.

**Leitura de negocio**

Este caso protege a integridade da base e evita conflitos de identificacao ou cadastro duplicado.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa CRM ja utilizado por outro medico
- Entao o sistema deve rejeitar a atualizacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como editar um medico deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
