# US14 - Listar e consultar medicos cadastrados

## Referencias

- [Epico 4 - Gerenciamento de Medicos](Epico-4-Gerenciamento-de-Medicos)

## Visao geral

Esta user story valida listar e consultar medicos cadastrados com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Permitir consulta de medicos

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US14.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Permitir consulta de medicos.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem ou consulta de medicos
- Entao o sistema deve permitir a operacao

### CT02 - Rejeitar consulta

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US14.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN

**Resultado esperado**

Rejeitar consulta.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando solicita a listagem ou consulta de medicos
- Entao o sistema deve rejeitar a operacao

### CT03 - Retornar apenas medicos disponiveis para encaminhamento e agenda

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US14.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Retornar apenas medicos ativos e disponiveis.

**Leitura de negocio**

Este caso assegura que a base consultada para encaminhamento e agendamento nao inclua profissionais indisponiveis.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando solicita a listagem de medicos
- Entao o sistema deve retornar apenas medicos disponiveis para encaminhamento e agenda

### CT04 - Retornar nao encontrado ao consultar medico inexistente por identificador

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US14.

**Cenario resumido**

- Perfil solicitante: ADMIN

**Resultado esperado**

Retornar nao encontrado para o identificador consultado.

**Leitura de negocio**

Este caso reduz risco de interpretacao incorreta da disponibilidade medica cadastrada.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando consulta um medico por identificador inexistente
- Entao o sistema deve retornar nao encontrado

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como listar e consultar medicos cadastrados deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
