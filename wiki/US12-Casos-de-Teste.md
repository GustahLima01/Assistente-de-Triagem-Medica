# US12 - Excluir ou inativar um sintoma

## Referencias

- [Epico 3 - Gerenciamento de Sintomas](Epico-3-Gerenciamento-de-Sintomas)

## Visao geral

Esta user story valida excluir ou inativar um sintoma com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Marcar sintoma como inativo e impedir uso em consulta de especialidade e triagem

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US12.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Marcar sintoma como inativo e impedir uso em consulta de especialidade e triagem.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a exclusao de um sintoma
- Entao o sistema deve inativar o sintoma e impedir seu uso em consulta de especialidade e triagem

### CT02 - Rejeitar operacao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US12.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN

**Resultado esperado**

Rejeitar operacao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta excluir um sintoma
- Entao o sistema deve rejeitar a operacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como excluir ou inativar um sintoma deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
