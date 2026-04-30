# Assistente de Triagem Medica

> API REST para apoiar o fluxo inicial de triagem de uma clinica, organizando cadastro, triagem e encaminhamento com mais consistencia operacional.

## Visao Geral

O Assistente de Triagem Medica foi concebido para apoiar o atendimento inicial de uma clinica sem substituir avaliacao medica. O foco do produto e registrar pacientes, consolidar sintomas, sugerir a especialidade mais adequada e permitir o agendamento da consulta com rastreabilidade do processo.

## Jornada Principal

1. Um usuario autenticado acessa o sistema.
2. O paciente e localizado ou cadastrado.
3. Os sintomas informados sao registrados.
4. O sistema calcula a especialidade sugerida e a prioridade da triagem.
5. A consulta e agendada com um medico compativel.

## Portfolio do Produto

| Frente | Objetivo | Valor entregue |
|---|---|---|
| Acesso e seguranca | Controlar autenticacao e permissao por perfil | Garante uso seguro e coerente do sistema |
| Cadastro operacional | Manter usuarios, pacientes, medicos e sintomas | Sustenta o fluxo da triagem com dados confiaveis |
| Triagem assistida | Sugerir especialidade e prioridade com base nos sintomas | Apoia o encaminhamento inicial |
| Agendamento | Conectar triagem e disponibilidade medica | Da continuidade ao atendimento |

## Mapa da Wiki

- [Requisitos](Requisitos)
  - [Requisitos Funcionais](Requisitos-Funcionais)
  - [Requisitos Nao Funcionais](Requisitos-Nao-Funcionais)
- [Epicos e User Stories](Epicos-e-User-Stories)
- [Casos de Teste](Casos-de-Teste)
  - [Epico 1: Gerenciamento de Usuarios da Clinica](Casos-de-Teste#epico-1---gerenciamento-de-usuarios-da-clinica)
    - [US01 - Cadastrar um usuario da clinica](Casos-de-Teste#us01---cadastrar-um-usuario-da-clinica)
    - [US02 - Fazer login no sistema](Casos-de-Teste#us02---fazer-login-no-sistema)
    - [US03 - Editar um usuario da clinica](Casos-de-Teste#us03---editar-um-usuario-da-clinica)
    - [US04 - Excluir ou inativar um usuario da clinica](Casos-de-Teste#us04---excluir-ou-inativar-um-usuario-da-clinica)
  - [Epico 2: Gerenciamento de Pacientes](Casos-de-Teste#epico-2---gerenciamento-de-pacientes)
    - [US05 - Cadastrar um paciente](Casos-de-Teste#us05---cadastrar-um-paciente)
    - [US06 - Listar e consultar pacientes cadastrados](Casos-de-Teste#us06---listar-e-consultar-pacientes-cadastrados)
    - [US07 - Editar um paciente](Casos-de-Teste#us07---editar-um-paciente)
    - [US08 - Excluir ou inativar um paciente](Casos-de-Teste#us08---excluir-ou-inativar-um-paciente)
  - [Epico 3: Gerenciamento de Sintomas](Casos-de-Teste#epico-3---gerenciamento-de-sintomas)
    - [US09 - Cadastrar sintomas](Casos-de-Teste#us09---cadastrar-sintomas)
    - [US10 - Listar e consultar sintomas cadastrados](Casos-de-Teste#us10---listar-e-consultar-sintomas-cadastrados)
    - [US11 - Editar um sintoma](Casos-de-Teste#us11---editar-um-sintoma)
    - [US12 - Excluir ou inativar um sintoma](Casos-de-Teste#us12---excluir-ou-inativar-um-sintoma)
  - [Epico 4: Gerenciamento de Medicos](Casos-de-Teste#epico-4---gerenciamento-de-medicos)
    - [US13 - Cadastrar um medico](Casos-de-Teste#us13---cadastrar-um-medico)
    - [US14 - Listar e consultar medicos cadastrados](Casos-de-Teste#us14---listar-e-consultar-medicos-cadastrados)
    - [US15 - Editar um medico](Casos-de-Teste#us15---editar-um-medico)
    - [US16 - Excluir ou inativar um medico](Casos-de-Teste#us16---excluir-ou-inativar-um-medico)
  - [Epico 5: Triagem e Sugestao de Especialidade](Casos-de-Teste#epico-5---triagem-e-sugestao-de-especialidade)
    - [US17 - Registrar os sintomas informados por um paciente](Casos-de-Teste#us17---registrar-os-sintomas-informados-por-um-paciente)
    - [US18 - Consultar a especialidade sugerida](Casos-de-Teste#us18---consultar-a-especialidade-sugerida)
    - [US19 - Visualizar a prioridade calculada da triagem](Casos-de-Teste#us19---visualizar-a-prioridade-calculada-da-triagem)
    - [US20 - Registrar o resultado consolidado da triagem](Casos-de-Teste#us20---registrar-o-resultado-consolidado-da-triagem)
  - [Epico 6: Agendamento de Consulta Medica](Casos-de-Teste#epico-6---agendamento-de-consulta-medica)
    - [US21 - Agendar uma consulta para o paciente](Casos-de-Teste#us21---agendar-uma-consulta-para-o-paciente)
    - [US22 - Selecionar um medico compativel com a especialidade sugerida](Casos-de-Teste#us22---selecionar-um-medico-compativel-com-a-especialidade-sugerida)
    - [US23 - Validar conflito de horarios no agendamento](Casos-de-Teste#us23---validar-conflito-de-horarios-no-agendamento)
    - [US24 - Consultar os agendamentos realizados](Casos-de-Teste#us24---consultar-os-agendamentos-realizados)
## Objetivo da Wiki

Organizar a visao do produto, o fluxo principal e o backlog priorizado para a construcao evolutiva do MVP.
