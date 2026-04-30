# US07 - Editar um paciente

## Referencias

- [Epico 2 - Gerenciamento de Pacientes](Epico-2-Gerenciamento-de-Pacientes)

## Visao geral

Esta user story valida editar um paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Atualizar paciente convertendo opcionais vazios para null

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US07.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- BirthDate: Valida
- Documento: Unico
- Opcionais email e notes: Vazios

**Resultado esperado**

Atualizar paciente convertendo opcionais vazios para null.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para pacientes
- Quando atualiza o paciente com birthDate valida, documento unico e opcionais vazios
- Entao o sistema deve salvar a alteracao convertendo opcionais vazios para null

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US07.

**Cenario resumido**

- Perfil solicitante: Outro
- BirthDate: Valida
- Documento: Unico
- Opcionais email e notes: Ausentes

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta editar um paciente
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por data invalida

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US07.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- BirthDate: Invalida
- Documento: Unico
- Opcionais email e notes: Ausentes

**Resultado esperado**

Rejeitar por data invalida.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa birthDate invalida na edicao
- Entao o sistema deve rejeitar a atualizacao

### CT04 - Rejeitar por documento duplicado

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US07.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- BirthDate: Valida
- Documento: Duplicado
- Opcionais email e notes: Ausentes

**Resultado esperado**

Rejeitar por documento duplicado.

**Leitura de negocio**

Este caso protege a integridade da base e evita conflitos de identificacao ou cadastro duplicado.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa documento que ja pertence a outro paciente
- Entao o sistema deve rejeitar a atualizacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como editar um paciente deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
