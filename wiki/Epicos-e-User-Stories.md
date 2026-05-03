# Epicos e User Stories

## Contexto

Com base nos requisitos funcionais identificados para o Assistente de Triagem Medica, os epicos abaixo foram reorganizados em um fluxo recomendado de desenvolvimento. A sequencia considera dependencia funcional, reducao de risco e entrega incremental de valor para o MVP.

## Sequencia recomendada de desenvolvimento

1. Gerenciamento de usuarios da clinica e autenticacao
2. Gerenciamento de pacientes
3. Gerenciamento de sintomas
4. Gerenciamento de medicos
5. Triagem e sugestao de especialidade
6. Agendamento de consulta medica

## Requisitos funcionais considerados

- RF01 - Gerenciamento de usuarios da clinica
- RF02 - Gerenciamento de pacientes
- RF03 - Gerenciamento de sintomas
- RF04 - Gerenciamento de medicos
- RF05 - Triagem e sugestao de especialidade
- RF06 - Agendamento de consulta medica

---

## Epico 1 - Gerenciamento de Usuarios da Clinica

**Relacionado ao:** RF01  
**Objetivo:** controlar acesso ao sistema e garantir que cada perfil utilize apenas as funcionalidades permitidas.  
**Dependencias para iniciar:** nenhuma.

## User Stories

| ID | User Story | Prioridade |
|:--:|---|:--:|
| US01 | Como administrador da clinica, eu quero cadastrar um usuario da clinica para conceder acesso ao sistema. | Alta |
| US02 | Como usuario da clinica, eu quero fazer login no sistema para acessar as funcionalidades permitidas ao meu perfil. | Alta |
| US03 | Como administrador da clinica, eu quero editar um usuario da clinica para manter seus dados e perfil atualizados. | Media |
| US04 | Como administrador da clinica, eu quero excluir ou inativar um usuario da clinica para remover acessos indevidos. | Media |

## User story - US01

- Regras de negocio
  - RN12. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de usuarios.
  - RN13. Os perfis permitidos para usuario da clinica sao apenas `ADMIN`, `RECEPTIONIST` e `DOCTOR`.
  - RN14. Para criar usuario, os campos `name`, `email`, `password` e `role` sao obrigatorios.
  - RN15. O e-mail do usuario deve ser unico no sistema.
  - RN16. O e-mail deve ser normalizado para minusculas antes da validacao e persistencia.
  - RN17. A senha nao e armazenada em texto puro e deve ser persistida com hash.
- Criterios de aceite
  - Dado usuario autenticado sem perfil `ADMIN`, quando tentar cadastrar usuario, entao a API deve negar acesso.
  - Dado email ja existente, quando tentar cadastrar novo usuario, entao a API deve rejeitar por duplicidade.

## User story - US02

- Regras de negocio
  - RN18. Usuario inativo nao pode autenticar no sistema.
  - RN19. Login exige `email` e `password` validos.
- Criterios de aceite
  - Dado credenciais validas e usuario ativo, quando realizar login, entao um token JWT valido deve ser retornado.
  - Dado usuario inativo, quando realizar login, entao a autenticacao deve ser negada.

## User story - US03

- Regras de negocio
  - RN12. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de usuarios.
  - RN13. Os perfis permitidos para usuario da clinica sao apenas `ADMIN`, `RECEPTIONIST` e `DOCTOR`.
  - RN15. O e-mail do usuario deve ser unico no sistema.
  - RN16. O e-mail deve ser normalizado para minusculas antes da validacao e persistencia.
  - RN17. A senha nao e armazenada em texto puro e deve ser persistida com hash.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando atualizar dados validos de um usuario existente, entao a alteracao deve ser persistida.
  - Dado tentativa de atualizar email para um email ja cadastrado, entao a API deve rejeitar.

## User story - US04

- Regras de negocio
  - RN12. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de usuarios.
  - RN20. A exclusao de usuario e logica: o usuario e marcado como inativo, sem remocao fisica do registro.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando excluir usuario existente, entao o registro deve ser marcado como inativo.
  - Dado usuario inativado, quando tentar autenticar, entao o acesso deve ser negado.

---

## Epico 2 - Gerenciamento de Pacientes

**Relacionado ao:** RF02  
**Objetivo:** garantir o cadastro e a consulta de pacientes necessarios para iniciar a triagem e o agendamento.  
**Dependencias para iniciar:** Epico 1.

## User Stories

| ID | User Story | Prioridade |
|:--:|---|:--:|
| US05 | Como atendente da clinica, eu quero cadastrar um paciente para registrar seus dados no sistema. | Alta |
| US06 | Como atendente da clinica, eu quero listar e consultar pacientes cadastrados para localizar rapidamente um paciente no momento da triagem. | Alta |
| US07 | Como atendente da clinica, eu quero editar um paciente para corrigir ou atualizar informacoes cadastrais. | Media |
| US08 | Como atendente da clinica, eu quero excluir ou inativar um paciente para manter a base organizada. | Baixa |

## User story - US05

- Regras de negocio
  - RN21. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar o gerenciamento de pacientes.
  - RN22. Para criar paciente, os campos `name`, `document`, `birthDate` e `phone` sao obrigatorios.
  - RN23. O campo `birthDate` deve conter uma data valida.
  - RN24. O documento do paciente deve ser unico no sistema.
  - RN25. Os campos `email` e `notes` sao opcionais.
  - RN26. Strings vazias em campos opcionais devem ser tratadas como `null`.
- Criterios de aceite
  - Dado usuario autorizado, quando cadastrar paciente com campos obrigatorios validos, entao o registro deve ser criado.
  - Dado documento ja cadastrado, quando tentar novo cadastro, entao a API deve rejeitar por duplicidade.

## User story - US06

- Regras de negocio
  - RN21. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar o gerenciamento de pacientes.
- Criterios de aceite
  - Dado usuario autorizado, quando consultar pacientes, entao a lista deve retornar os registros conforme filtro aplicado.
  - Dado paciente inexistente, quando consultar por identificador, entao a API deve retornar nao encontrado.

## User story - US07

- Regras de negocio
  - RN21. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar o gerenciamento de pacientes.
  - RN23. O campo `birthDate` deve conter uma data valida.
  - RN24. O documento do paciente deve ser unico no sistema.
  - RN25. Os campos `email` e `notes` sao opcionais.
  - RN26. Strings vazias em campos opcionais devem ser tratadas como `null`.
- Criterios de aceite
  - Dado usuario autorizado, quando atualizar paciente com dados validos, entao as alteracoes devem ser persistidas.
  - Dado data de nascimento invalida, quando atualizar, entao a API deve retornar erro de validacao.

## User story - US08

- Regras de negocio
  - RN21. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar o gerenciamento de pacientes.
  - RN27. A exclusao de paciente e logica: o paciente e marcado como inativo.
  - RN28. Paciente inativo nao pode ser usado para registrar nova triagem.
  - RN29. Paciente inativo nao pode receber novo agendamento.
- Criterios de aceite
  - Dado usuario autorizado, quando excluir paciente, entao o registro deve ser inativado.
  - Dado paciente inativo, quando tentar usar em triagem ou agendamento, entao a API deve rejeitar.

---

## Epico 3 - Gerenciamento de Sintomas

**Relacionado ao:** RF03  
**Objetivo:** manter a base de sintomas necessaria para o calculo de prioridade e sugestao de especialidade.  
**Dependencias para iniciar:** Epico 1.

## User Stories

| ID | User Story | Prioridade |
|:--:|---|:--:|
| US09 | Como administrador da clinica, eu quero cadastrar sintomas para alimentar a base de triagem do sistema. | Alta |
| US10 | Como administrador da clinica, eu quero listar e consultar sintomas cadastrados para manter a base de triagem utilizavel e confiavel. | Alta |
| US11 | Como administrador da clinica, eu quero editar um sintoma para ajustar descricao, gravidade ou especialidade associada. | Media |
| US12 | Como administrador da clinica, eu quero excluir ou inativar um sintoma para manter a base consistente. | Baixa |

## User story - US09

- Regras de negocio
  - RN30. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de sintomas.
  - RN31. Para criar sintoma, os campos `name`, `severity` e `specialty` sao obrigatorios.
  - RN32. As severidades permitidas para sintoma sao `LOW`, `MEDIUM`, `HIGH` e `CRITICAL`.
  - RN33. Cada sintoma deve estar associado a uma especialidade medica.
  - RN34. A descricao do sintoma e opcional.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando cadastrar sintoma com severidade valida e especialidade definida, entao o registro deve ser criado.
  - Dado severidade fora do dominio permitido, quando cadastrar, entao a API deve rejeitar.

## User story - US10

- Regras de negocio
  - RN30. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de sintomas.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando listar sintomas, entao a API deve retornar a base disponivel para triagem.
  - Dado sintoma inexistente, quando consultar por ID, entao a API deve retornar nao encontrado.

## User story - US11

- Regras de negocio
  - RN30. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de sintomas.
  - RN32. As severidades permitidas para sintoma sao `LOW`, `MEDIUM`, `HIGH` e `CRITICAL`.
  - RN33. Cada sintoma deve estar associado a uma especialidade medica.
  - RN34. A descricao do sintoma e opcional.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando editar sintoma com dados validos, entao alteracoes devem ser persistidas.
  - Dado tentativa de editar com severidade invalida, quando enviar requisicao, entao deve retornar erro de validacao.

## User story - US12

- Regras de negocio
  - RN30. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de sintomas.
  - RN35. A exclusao de sintoma e logica: o sintoma e marcado como inativo.
  - RN36. Sintoma inativo nao pode ser utilizado em consulta de especialidade nem no registro de triagem.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando excluir sintoma, entao o sintoma deve ser inativado.
  - Dado sintoma inativo, quando tentar usar em triagem/consulta de especialidade, entao a API deve rejeitar.

---

## Epico 4 - Gerenciamento de Medicos

**Relacionado ao:** RF04  
**Objetivo:** disponibilizar medicos aptos para receber encaminhamentos e agendamentos conforme a especialidade necessaria.  
**Dependencias para iniciar:** Epico 1.

## User Stories

| ID | User Story | Prioridade |
|:--:|---|:--:|
| US13 | Como administrador da clinica, eu quero cadastrar um medico para disponibiliza-lo para triagem e agendamento. | Alta |
| US14 | Como administrador da clinica, eu quero listar e consultar medicos cadastrados para manter a base de profissionais disponivel para encaminhamento e agenda. | Alta |
| US15 | Como administrador da clinica, eu quero editar um medico para atualizar seus dados e especialidade. | Media |
| US16 | Como administrador da clinica, eu quero excluir ou inativar um medico para retira-lo da disponibilidade da clinica. | Baixa |

## User story - US13

- Regras de negocio
  - RN37. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de medicos.
  - RN38. Para criar medico, os campos `name`, `crm` e `specialty` sao obrigatorios.
  - RN39. O CRM do medico deve ser unico no sistema.
  - RN40. Os campos `phone` e `email` sao opcionais.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando cadastrar medico com `crm` unico, entao o registro deve ser criado.
  - Dado `crm` ja existente, quando cadastrar, entao a API deve rejeitar.

## User story - US14

- Regras de negocio
  - RN37. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de medicos.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando listar medicos, entao a API deve retornar profissionais disponiveis.
  - Dado medico inexistente, quando consultar por ID, entao deve retornar nao encontrado.

## User story - US15

- Regras de negocio
  - RN37. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de medicos.
  - RN39. O CRM do medico deve ser unico no sistema.
  - RN40. Os campos `phone` e `email` sao opcionais.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando editar medico com dados validos, entao as alteracoes devem ser persistidas.
  - Dado tentativa de alterar `crm` para um ja utilizado, quando atualizar, entao deve retornar erro.

## User story - US16

- Regras de negocio
  - RN37. Apenas usuarios com perfil `ADMIN` podem acessar o gerenciamento de medicos.
  - RN41. A exclusao de medico e logica: o medico e marcado como inativo.
  - RN42. Medico inativo nao pode receber novo agendamento.
  - RN43. A especialidade do medico e usada para validar aderencia ao encaminhamento da triagem quando houver `triageId` no agendamento.
- Criterios de aceite
  - Dado usuario `ADMIN`, quando excluir medico, entao o registro deve ser inativado.
  - Dado medico inativo, quando tentar novo agendamento, entao a API deve rejeitar.

---

## Epico 5 - Triagem e Sugestao de Especialidade

**Relacionado ao:** RF05  
**Objetivo:** registrar a triagem do paciente e gerar um encaminhamento inicial orientado por sintomas e nivel de prioridade.  
**Dependencias para iniciar:** Epicos 1, 2 e 3.

## User Stories

| ID | User Story | Prioridade |
|:--:|---|:--:|
| US17 | Como atendente da clinica, eu quero registrar os sintomas informados por um paciente para iniciar a triagem. | Alta |
| US18 | Como atendente da clinica, eu quero consultar a especialidade sugerida com base nos sintomas registrados para orientar o encaminhamento inicial. | Alta |
| US19 | Como atendente da clinica, eu quero visualizar a prioridade calculada da triagem para identificar o nivel de urgencia do atendimento. | Alta |
| US20 | Como atendente da clinica, eu quero registrar o resultado consolidado da triagem para manter historico do encaminhamento realizado. | Media |

## User story - US17

- Regras de negocio
  - RN44. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar triagens.
  - RN45. O registro de triagem exige `patientId` e `symptomIds`.
  - RN46. IDs de sintomas duplicados devem ser desconsiderados antes do calculo da triagem.
  - RN47. Nao e permitido registrar triagem para paciente inativo.
  - RN48. Nao e permitido usar sintoma inativo em triagem.
- Criterios de aceite
  - Dado usuario autorizado, quando registrar triagem com `patientId` valido e `symptomIds` ativos, entao a triagem deve ser criada.
  - Dado paciente inativo ou sintoma inativo, quando tentar registrar triagem, entao a API deve rejeitar.

## User story - US18

- Regras de negocio
  - RN44. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar triagens.
  - RN49. A consulta de especialidade exige o envio de `symptomIds` em array nao vazio.
  - RN50. A especialidade sugerida e calculada pela soma dos pesos de severidade por especialidade.
  - RN51. Os pesos de severidade usados no calculo sao: `LOW=1`, `MEDIUM=2`, `HIGH=3` e `CRITICAL=4`.
  - RN52. Em empate entre especialidades com a mesma pontuacao, o desempate deve ser feito em ordem alfabetica pelo nome da especialidade.
- Criterios de aceite
  - Dado lista valida de sintomas, quando consultar especialidade, entao a API deve retornar especialidade sugerida calculada.
  - Dado empate de pontuacao entre especialidades, quando calcular, entao o desempate deve seguir ordem alfabetica.

## User story - US19

- Regras de negocio
  - RN44. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar triagens.
  - RN53. A prioridade da triagem corresponde a maior severidade entre os sintomas informados.
  - RN51. Os pesos de severidade usados no calculo sao: `LOW=1`, `MEDIUM=2`, `HIGH=3` e `CRITICAL=4`.
- Criterios de aceite
  - Dado triagem com sintomas validos, quando calcular prioridade, entao a prioridade deve corresponder a maior severidade encontrada.
  - Dado sintomas com severidades distintas, quando calcular, entao os pesos definidos devem ser respeitados.

## User story - US20

- Regras de negocio
  - RN44. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar triagens.
  - RN54. O resultado da triagem deve armazenar a especialidade sugerida, a prioridade, os sintomas considerados e o usuario responsavel pelo registro.
- Criterios de aceite
  - Dado triagem concluida, quando registrar resultado consolidado, entao especialidade, prioridade, sintomas e usuario responsavel devem ser persistidos.
  - Dado tentativa de gravacao sem dados essenciais da triagem, quando processar requisicao, entao a API deve rejeitar.

---

## Epico 6 - Agendamento de Consulta Medica

**Relacionado ao:** RF06  
**Objetivo:** dar continuidade ao atendimento por meio de um agendamento aderente ao resultado da triagem e a disponibilidade medica.  
**Dependencias para iniciar:** Epicos 1, 2, 4 e 5.

## User Stories

| ID | User Story | Prioridade |
|:--:|---|:--:|
| US21 | Como atendente da clinica, eu quero agendar uma consulta para o paciente para dar continuidade ao atendimento apos a triagem. | Alta |
| US22 | Como atendente da clinica, eu quero selecionar um medico compativel com a especialidade sugerida para garantir aderencia ao encaminhamento. | Alta |
| US23 | Como atendente da clinica, eu quero validar conflito de horarios no agendamento para evitar consultas duplicadas ou sobrepostas. | Alta |
| US24 | Como atendente da clinica, eu quero consultar os agendamentos realizados para acompanhar a agenda de atendimento. | Media |
| US25 | Como atendente da clinica, eu quero editar ou reagendar uma consulta para corrigir dados ou ajustar o atendimento sem perder a rastreabilidade. | Alta |
| US26 | Como atendente da clinica, eu quero cancelar uma consulta para liberar a agenda e manter o historico do atendimento. | Alta |

## User story - US21

- Regras de negocio
  - RN55. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar agendamentos.
  - RN56. Para criar agendamento, os campos `patientId`, `doctorId` e `scheduledAt` sao obrigatorios.
  - RN57. O campo `scheduledAt` deve conter uma data valida.
  - RN58. A data e hora do agendamento devem ser normalizadas para formato ISO antes da comparacao de conflito.
  - RN59. Nao e permitido agendar consulta para paciente inativo.
  - RN60. Nao e permitido agendar consulta com medico inativo.
  - RN61. O campo `triageId` e opcional no agendamento.
  - RN62. Todo novo agendamento deve ser criado com status inicial `SCHEDULED`.
  - RN63. O agendamento deve registrar o usuario responsavel pela criacao.
- Criterios de aceite
  - Dado usuario autorizado, quando criar agendamento com paciente e medico ativos, entao o status inicial deve ser `SCHEDULED`.
  - Dado paciente ou medico inativo, quando tentar agendar, entao a API deve rejeitar.

## User story - US22

- Regras de negocio
  - RN61. O campo `triageId` e opcional no agendamento.
  - RN64. Quando informado, o `triageId` deve pertencer ao mesmo paciente do agendamento.
  - RN65. Quando informado, o `triageId` exige que a especialidade sugerida na triagem seja igual a especialidade do medico.
- Criterios de aceite
  - Dado `triageId` informado, quando criar agendamento, entao a triagem deve pertencer ao mesmo paciente informado.
  - Dado `triageId` informado e especialidade divergente, quando validar agendamento, entao a API deve rejeitar.

## User story - US23

- Regras de negocio
  - RN58. A data e hora do agendamento devem ser normalizadas para formato ISO antes da comparacao de conflito.
  - RN66. Nao e permitido criar dois agendamentos com status `SCHEDULED` para o mesmo medico no mesmo horario.
- Criterios de aceite
  - Dado medico com agendamento `SCHEDULED` no mesmo horario, quando tentar novo agendamento, entao a API deve rejeitar por conflito.
  - Dado novo horario sem conflito, quando validar, entao o agendamento deve ser permitido.

## User story - US24

- Regras de negocio
  - RN55. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem acessar agendamentos.
  - RN82. Os status de agendamento devem ser apresentados ao usuario em PT-BR nas consultas e listagens.
  - RN83. A persistencia pode manter valores internos padronizados, desde que a camada de apresentacao traduza os status exibidos.
- Criterios de aceite
  - Dado usuario autorizado, quando consultar agenda, entao a API deve listar agendamentos conforme os filtros aplicados.
  - Dado agendamento inexistente, quando consultar por ID, entao a API deve retornar nao encontrado.

## User story - US25

- Regras de negocio
  - RN67. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem editar agendamentos.
  - RN68. Somente agendamentos com status `SCHEDULED` podem ser editados.
  - RN69. A edicao pode alterar `doctorId`, `scheduledAt` e `notes`.
  - RN70. O campo `scheduledAt`, quando alterado, deve conter uma data valida e ser normalizado para formato ISO.
  - RN71. Ao alterar medico ou horario, a regra de conflito da agenda deve ser revalidada.
  - RN72. Quando houver `triageId`, a edicao deve preservar a consistencia entre paciente, triagem e especialidade do medico.
  - RN73. A edicao deve registrar `updatedAt` e o usuario responsavel pela alteracao.
  - RN74. Nao e permitido editar agendamento com status `CANCELLED`.
- Criterios de aceite
  - Dado usuario autorizado, quando editar um agendamento `SCHEDULED` com dados validos, entao a alteracao deve ser persistida.
  - Dado novo medico ou horario em conflito ou incompativel com a triagem, quando tentar editar, entao a API deve rejeitar.

## User story - US26

- Regras de negocio
  - RN75. Apenas usuarios com perfil `ADMIN` ou `RECEPTIONIST` podem cancelar agendamentos.
  - RN76. O cancelamento deve ser logico, alterando o status do agendamento para `CANCELLED`.
  - RN77. Apenas agendamentos com status `SCHEDULED` podem ser cancelados.
  - RN78. Agendamentos cancelados devem permanecer disponiveis para consulta e rastreabilidade.
  - RN79. Apos o cancelamento, o horario do medico deixa de bloquear novo agendamento por conflito.
  - RN80. O cancelamento deve registrar `updatedAt` e o usuario responsavel pela acao.
  - RN81. Nao e permitido cancelar um agendamento ja cancelado.
- Criterios de aceite
  - Dado usuario autorizado, quando cancelar um agendamento `SCHEDULED`, entao o status deve ser alterado para `CANCELLED`.
  - Dado agendamento ja cancelado ou inexistente, quando tentar cancelar, entao a API deve rejeitar.
