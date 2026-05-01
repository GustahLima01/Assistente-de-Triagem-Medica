# US21 - Agendar uma consulta para o paciente

## Referencias

- [Epico 6 - Agendamento de Consulta Medica](Epico-6-Agendamento-de-Consulta-Medica)

## Visao geral

Esta user story valida agendar uma consulta para o paciente com foco em comportamento esperado, protecoes de regra de negocio e consistencia operacional.
O objetivo dos testes e garantir que:

- o fluxo principal funcione conforme o esperado
- cenarios de bloqueio ou rejeicao sejam tratados corretamente quando aplicavel
- a regra de negocio fique clara para leitura funcional e tecnica

## Casos de teste

### CT01 - Criar agendamento com scheduledAt normalizado, status SCHEDULED e usuario responsavel

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct01 para a US21.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Campos obrigatorios: Completos
- scheduledAt: Data valida
- Paciente: Ativo
- Medico: Ativo
- triageId: Ausente

**Resultado esperado**

Criar agendamento com scheduledAt normalizado, status SCHEDULED e usuario responsavel.

**Leitura de negocio**

Este caso representa o comportamento esperado do produto quando as regras definidas para a user story sao atendidas.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado para agendamentos
- Quando informa patientId, doctorId e scheduledAt valido para paciente ativo e medico ativo
- Entao o sistema deve criar o agendamento com data normalizada em ISO, status SCHEDULED e usuario responsavel

### CT02 - Rejeitar por falta de permissao

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct02 para a US21.

**Cenario resumido**

- Perfil solicitante: Outro
- Campos obrigatorios: Completos
- scheduledAt: Data valida
- Paciente: Ativo
- Medico: Ativo
- triageId: Ausente

**Resultado esperado**

Rejeitar por falta de permissao.

**Leitura de negocio**

Este caso reforca o controle de acesso e evidencia que apenas os perfis corretos podem executar a operacao.

**Cenario em Gherkin**

- Dado que o solicitante nao possui perfil autorizado
- Quando tenta criar um agendamento
- Entao o sistema deve rejeitar a operacao

### CT03 - Rejeitar por obrigatoriedade

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct03 para a US21.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Campos obrigatorios: Incompletos
- scheduledAt: Data valida
- Paciente: Ativo
- Medico: Ativo
- triageId: Ausente

**Resultado esperado**

Rejeitar por obrigatoriedade.

**Leitura de negocio**

Este caso preserva a qualidade cadastral e reduz falhas operacionais causadas por dados incompletos.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando nao informa todos os campos obrigatorios
- Entao o sistema deve rejeitar a criacao

### CT04 - Rejeitar por data invalida

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct04 para a US21.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Campos obrigatorios: Completos
- scheduledAt: Data invalida
- Paciente: Ativo
- Medico: Ativo
- triageId: Ausente

**Resultado esperado**

Rejeitar por data invalida.

**Leitura de negocio**

Este caso reduz inconsistencias de entrada e ajuda a garantir previsibilidade no comportamento da API.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando informa scheduledAt invalido
- Entao o sistema deve rejeitar a criacao

### CT05 - Rejeitar por paciente inativo

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct05 para a US21.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Campos obrigatorios: Completos
- scheduledAt: Data valida
- Paciente: Inativo
- Medico: Ativo
- triageId: Ausente

**Resultado esperado**

Rejeitar por paciente inativo.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando tenta agendar consulta para paciente inativo
- Entao o sistema deve rejeitar a criacao

### CT06 - Rejeitar por medico inativo

**Objetivo**

Validar que o sistema executa corretamente o cenario previsto em ct06 para a US21.

**Cenario resumido**

- Perfil solicitante: ADMIN ou RECEPTIONIST
- Campos obrigatorios: Completos
- scheduledAt: Data valida
- Paciente: Ativo
- Medico: Inativo
- triageId: Ausente

**Resultado esperado**

Rejeitar por medico inativo.

**Leitura de negocio**

Este caso assegura que o sistema respeite o estado atual dos registros e impe?a uso indevido em fluxos posteriores.

**Cenario em Gherkin**

- Dado que o solicitante possui perfil autorizado
- Quando tenta agendar consulta com medico inativo
- Entao o sistema deve rejeitar a criacao

## Resumo executivo

Os casos desta user story demonstram, de forma objetiva, como agendar uma consulta para o paciente deve se comportar em cenarios de sucesso e de excecao.

- cobertura do fluxo principal da funcionalidade
- validacao das principais regras de negocio
- previsibilidade de comportamento para consumidores da API e avaliadores funcionais

Esse formato facilita a leitura por recrutadores, analistas e liderancas, sem perder a rastreabilidade com o backlog do produto.
