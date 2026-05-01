# US17 - Registrar os sintomas informados por um paciente

## Referencias

- [Epico 5 - Triagem e Sugestao de Especialidade](Epico-5-Triagem-e-Sugestao-de-Especialidade)

## Visao geral

Esta user story valida registrar os sintomas informados por um paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Registrar triagem desconsiderando IDs duplicados antes do calculo

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US17.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- patientId: Paciente ativo
- symptomIds: Array nao vazio sem inativos
- Duplicidade de sintomas: Com duplicidade

**Resultado esperado**

Registrar triagem desconsiderando IDs duplicados antes do calculo.

**Leitura de negocio**

Este caso protege a integridade da base e evita conflitos de identificacao ou cadastro duplicado.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para triagens
- Quando registra uma triagem para paciente ativo com symptomIds validos contendo duplicidades
- Entao o sistema deve desconsiderar IDs duplicados antes do calculo e registrar a triagem

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US17.

**Cenario resumido**

- Perfil solicitante: Outro
- patientId: Paciente ativo
- symptomIds: Array nao vazio sem inativos
- Duplicidade de sintomas: Sem duplicidade

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN nem RECEPTIONIST
- Quando tenta registrar uma triagem
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por paciente inativo

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US17.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- patientId: Paciente inativo
- symptomIds: Array nao vazio sem inativos
- Duplicidade de sintomas: Sem duplicidade

**Resultado esperado**

Rejeitar por paciente inativo.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando tenta registrar triagem para paciente inativo
- Entao o sistema deve rejeitar a operacao

### CT04 - Rejeitar por uso de sintoma inativo

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US17.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- patientId: Paciente ativo
- symptomIds: Array com sintoma inativo
- Duplicidade de sintomas: Sem duplicidade

**Resultado esperado**

Rejeitar por uso de sintoma inativo.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa ao menos um sintoma inativo na triagem
- Entao o sistema deve rejeitar a operacao

### CT05 - Rejeitar por falta de dados obrigatorios

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct05 para a US17.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- patientId: Paciente ativo
- symptomIds: Ausente ou vazio
- Duplicidade de sintomas: Sem duplicidade

**Resultado esperado**

Rejeitar por falta de dados obrigatorios.

**Leitura de negocio**

Este caso preserva a qualidade cadastral e reduz falhas operacionais causadas por dados incompletos.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando nao informa patientId ou symptomIds em array nao vazio
- Entao o sistema deve rejeitar o registro

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como registrar os sintomas informados por um paciente deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
