# US04 - Excluir ou inativar um usuario da clinica

## Referencias

- [Epico 1 - Gerenciamento de Usuarios da Clinica](Epico-1-Gerenciamento-de-Usuarios-da-Clinica)

## Visao geral

Esta user story valida excluir ou inativar um usuario da clinica com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Marcar usuario como inativo sem remocao fisica

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US04.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Marcar usuario como inativo sem remocao fisica.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a exclusao de um usuario
- Entao o sistema deve realizar exclusao logica marcando o usuario como inativo

### CT02 - Rejeitar operacao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US04.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN

**Resultado esperado**

Rejeitar operacao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta excluir um usuario
- Entao o sistema deve rejeitar a operacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como excluir ou inativar um usuario da clinica deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
