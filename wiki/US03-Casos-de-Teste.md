# US03 - Editar um usuario da clinica

## Referencias

- [Epico 1 - Gerenciamento de Usuarios da Clinica](Epico-1-Gerenciamento-de-Usuarios-da-Clinica)

## Visao geral

Esta user story valida editar um usuario da clinica com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar dados com email normalizado e senha em hash se alterada

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US03.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Role informado: Permitido
- Email: Unico

**Resultado esperado**

Atualizar dados com email normalizado e senha em hash se alterada.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando atualiza um usuario com role permitido e email unico
- Entao o sistema deve salvar os dados com email normalizado e senha em hash se houver alteracao

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US03.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN
- Role informado: Permitido
- Email: Unico

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta editar um usuario
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por role invalido

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US03.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Role informado: Nao permitido
- Email: Unico

**Resultado esperado**

Rejeitar por role invalido.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa um role nao permitido na edicao
- Entao o sistema deve rejeitar a atualizacao

### CT04 - Rejeitar por email duplicado

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US03.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Role informado: Permitido
- Email: Duplicado

**Resultado esperado**

Rejeitar por email duplicado.

**Leitura de negocio**

Este caso protege a integridade da base e evita conflitos de identificacao ou cadastro duplicado.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa um email ja utilizado por outro usuario
- Entao o sistema deve rejeitar a atualizacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como editar um usuario da clinica deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
