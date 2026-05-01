# US09 - Cadastrar sintomas

## Referencias

- [Epico 3 - Gerenciamento de Sintomas](Epico-3-Gerenciamento-de-Sintomas)

## Visao geral

Esta user story valida cadastrar sintomas com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Criar sintoma

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US09.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Campos obrigatorios: Completos
- Severidade: LOW MEDIUM HIGH CRITICAL
- Especialidade: Informada

**Resultado esperado**

Criar sintoma.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa name, severity valida e specialty preenchida
- Entao o sistema deve criar o sintoma

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US09.

**Cenario resumido**

- Perfil solicitante: Nao ADMIN
- Campos obrigatorios: Completos
- Severidade: LOW MEDIUM HIGH CRITICAL
- Especialidade: Informada

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil ADMIN
- Quando tenta cadastrar um sintoma
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por obrigatoriedade

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US09.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Campos obrigatorios: Incompletos
- Severidade: LOW MEDIUM HIGH CRITICAL
- Especialidade: Informada

**Resultado esperado**

Rejeitar por obrigatoriedade.

**Leitura de negocio**

Este caso preserva a qualidade cadastral e reduz falhas operacionais causadas por dados incompletos.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando envia o cadastro sem todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar por severidade invalida

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US09.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Campos obrigatorios: Completos
- Severidade: Fora do dominio
- Especialidade: Informada

**Resultado esperado**

Rejeitar por severidade invalida.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando informa severidade fora de LOW, MEDIUM, HIGH ou CRITICAL
- Entao o sistema deve rejeitar a criacao

### CT05 - Rejeitar por falta de especialidade

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct05 para a US09.

**Cenario resumido**

- Perfil solicitante: ADMIN
- Campos obrigatorios: Completos
- Severidade: LOW MEDIUM HIGH CRITICAL
- Especialidade: Ausente

**Resultado esperado**

Rejeitar por falta de especialidade.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil ADMIN
- Quando nao associa o sintoma a uma especialidade
- Entao o sistema deve rejeitar a criacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como cadastrar sintomas deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
