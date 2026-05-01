# Tabela de Decisao das User Stories

## Premissas de modelagem

- Foi aplicada apenas a tecnica de tabela de decisao com base em particoes de equivalencia derivadas das regras de negocio.
- Foram consideradas apenas combinacoes relevantes para a decisao da regra; combinacoes redundantes ou sem impacto decisorio foram omitidas.
- Quando a regra descreve apenas controle de acesso, a tabela foi reduzida a particoes de perfil autorizado e nao autorizado.
- Quando a regra nao explicita comportamento de consulta sem resultado, esse caso nao foi inferido como regra adicional.

---

## US01 - Cadastrar um usuario da clinica

| Entrada | Particoes | US01-CT01 | US01-CT02 | US01-CT03 | US01-CT04 | US01-CT05 |
|---|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN | ADMIN |
| Campos obrigatorios | Completos / Incompletos | Completos | Completos | Incompletos | Completos | Completos |
| Role informado | Permitido / Nao permitido | Permitido | Permitido | Permitido | Nao permitido | Permitido |
| Email | Unico / Duplicado | Unico | Unico | Unico | Unico | Duplicado |
| Decisao |  | Criar usuario com email normalizado e senha em hash | Rejeitar por falta de permissao | Rejeitar por obrigatoriedade | Rejeitar por role invalido | Rejeitar por email duplicado |

**Gherkin**

- **US01-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa name, email, password e role permitido com email unico
  - Entao o sistema deve criar o usuario com email normalizado e senha persistida em hash
- **US01-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta cadastrar um usuario da clinica
  - Entao o sistema deve rejeitar a operacao por autorizacao
- **US01-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando envia o cadastro sem todos os campos obrigatorios
  - Entao o sistema deve rejeitar a criacao
- **US01-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa um role fora de ADMIN, RECEPTIONIST ou DOCTOR
  - Entao o sistema deve rejeitar a criacao
- **US01-CT05**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa email que ja existe no sistema
  - Entao o sistema deve rejeitar a criacao

## US02 - Fazer login no sistema

| Entrada | Particoes | US02-CT01 | US02-CT02 | US02-CT03 |
|---|---|---|---|---|
| Usuario | Ativo / Inativo | Ativo | Inativo | Ativo |
| Credenciais | Validas / Invalidas | Validas | Validas | Invalidas |
| Decisao |  | Autenticar e conceder acesso | Rejeitar autenticacao | Rejeitar autenticacao |

**Gherkin**

- **US02-CT01**
  - Dado que existe um usuario ativo
  - Quando ele informa email e password validos
  - Entao o sistema deve autenticar o usuario
- **US02-CT02**
  - Dado que existe um usuario inativo
  - Quando ele informa credenciais validas
  - Entao o sistema deve rejeitar a autenticacao
- **US02-CT03**
  - Dado que existe um usuario ativo
  - Quando ele informa email ou password invalidos
  - Entao o sistema deve rejeitar a autenticacao

## US03 - Editar um usuario da clinica

| Entrada | Particoes | US03-CT01 | US03-CT02 | US03-CT03 | US03-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN |
| Role informado | Permitido / Nao permitido / Nao alterado | Permitido | Permitido | Nao permitido | Permitido |
| Email | Unico / Duplicado / Nao alterado | Unico | Unico | Unico | Duplicado |
| Decisao |  | Atualizar dados com email normalizado e senha em hash se alterada | Rejeitar por falta de permissao | Rejeitar por role invalido | Rejeitar por email duplicado |

**Gherkin**

- **US03-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando atualiza um usuario com role permitido e email unico
  - Entao o sistema deve salvar os dados com email normalizado e senha em hash se houver alteracao
- **US03-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta editar um usuario
  - Entao o sistema deve rejeitar a operacao
- **US03-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa um role nao permitido na edicao
  - Entao o sistema deve rejeitar a atualizacao
- **US03-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa um email ja utilizado por outro usuario
  - Entao o sistema deve rejeitar a atualizacao

## US04 - Excluir ou inativar um usuario da clinica

| Entrada | Particoes | US04-CT01 | US04-CT02 |
|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN |
| Decisao |  | Marcar usuario como inativo sem remocao fisica | Rejeitar operacao |

**Gherkin**

- **US04-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a exclusao de um usuario
  - Entao o sistema deve realizar exclusao logica marcando o usuario como inativo
- **US04-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta excluir um usuario
  - Entao o sistema deve rejeitar a operacao

---

## US05 - Cadastrar um paciente

| Entrada | Particoes | US05-CT01 | US05-CT02 | US05-CT03 | US05-CT04 | US05-CT05 |
|---|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| Campos obrigatorios | Completos / Incompletos | Completos | Completos | Incompletos | Completos | Completos |
| BirthDate | Valida / Invalida | Valida | Valida | Valida | Invalida | Valida |
| Documento | Unico / Duplicado | Unico | Unico | Unico | Unico | Duplicado |
| Opcionais email e notes | Preenchidos / Vazios / Ausentes | Vazios | Ausentes | Ausentes | Ausentes | Ausentes |
| Decisao |  | Criar paciente convertendo opcionais vazios para null | Rejeitar por falta de permissao | Rejeitar por obrigatoriedade | Rejeitar por data invalida | Rejeitar por documento duplicado |

**Gherkin**

- **US05-CT01**
  - Dado que o solicitante possui perfil autorizado para pacientes
  - Quando informa campos obrigatorios completos, birthDate valida, documento unico e opcionais vazios
  - Entao o sistema deve criar o paciente convertendo campos opcionais vazios para null
- **US05-CT02**
  - Dado que o solicitante nao possui perfil ADMIN nem RECEPTIONIST
  - Quando tenta cadastrar um paciente
  - Entao o sistema deve rejeitar a operacao
- **US05-CT03**
  - Dado que o solicitante possui perfil autorizado
  - Quando envia cadastro sem todos os campos obrigatorios
  - Entao o sistema deve rejeitar a criacao
- **US05-CT04**
  - Dado que o solicitante possui perfil autorizado
  - Quando informa birthDate invalida
  - Entao o sistema deve rejeitar a criacao
- **US05-CT05**
  - Dado que o solicitante possui perfil autorizado
  - Quando informa documento ja existente no sistema
  - Entao o sistema deve rejeitar a criacao

## US06 - Listar e consultar pacientes cadastrados

| Entrada | Particoes | US06-CT01 | US06-CT02 | US06-CT03 | US06-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| Tipo de consulta | Listagem ou consulta autorizada / Consulta com filtro / Consulta por ID inexistente | Listagem ou consulta autorizada | Listagem ou consulta autorizada | Consulta com filtro | Consulta por ID inexistente |
| Decisao |  | Permitir consulta de pacientes | Rejeitar consulta | Retornar apenas registros compativeis com o filtro aplicado | Retornar nao encontrado |

**Gherkin**

- **US06-CT01**
  - Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
  - Quando solicita a listagem ou consulta de pacientes
  - Entao o sistema deve permitir a operacao
- **US06-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando solicita a listagem ou consulta de pacientes
  - Entao o sistema deve rejeitar a operacao
- **US06-CT03**
  - Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
  - Quando consulta pacientes com filtro valido
  - Entao o sistema deve retornar apenas os pacientes compativeis com o filtro aplicado
- **US06-CT04**
  - Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
  - Quando consulta um paciente por identificador inexistente
  - Entao o sistema deve retornar nao encontrado

## US07 - Editar um paciente

| Entrada | Particoes | US07-CT01 | US07-CT02 | US07-CT03 | US07-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| BirthDate | Valida / Invalida / Nao alterada | Valida | Valida | Invalida | Valida |
| Documento | Unico / Duplicado / Nao alterado | Unico | Unico | Unico | Duplicado |
| Opcionais email e notes | Preenchidos / Vazios / Ausentes | Vazios | Ausentes | Ausentes | Ausentes |
| Decisao |  | Atualizar paciente convertendo opcionais vazios para null | Rejeitar por falta de permissao | Rejeitar por data invalida | Rejeitar por documento duplicado |

**Gherkin**

- **US07-CT01**
  - Dado que o solicitante possui perfil autorizado para pacientes
  - Quando atualiza o paciente com birthDate valida, documento unico e opcionais vazios
  - Entao o sistema deve salvar a alteracao convertendo opcionais vazios para null
- **US07-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando tenta editar um paciente
  - Entao o sistema deve rejeitar a operacao
- **US07-CT03**
  - Dado que o solicitante possui perfil autorizado
  - Quando informa birthDate invalida na edicao
  - Entao o sistema deve rejeitar a atualizacao
- **US07-CT04**
  - Dado que o solicitante possui perfil autorizado
  - Quando informa documento que ja pertence a outro paciente
  - Entao o sistema deve rejeitar a atualizacao

## US08 - Excluir ou inativar um paciente

| Entrada | Particoes | US08-CT01 | US08-CT02 |
|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro |
| Decisao |  | Marcar paciente como inativo e impedir novo uso em triagem e agendamento | Rejeitar operacao |

**Gherkin**

- **US08-CT01**
  - Dado que o solicitante possui perfil autorizado para pacientes
  - Quando solicita a exclusao de um paciente
  - Entao o sistema deve inativar o paciente e impedir seu uso em novas triagens e novos agendamentos
- **US08-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando tenta excluir um paciente
  - Entao o sistema deve rejeitar a operacao

---

## US09 - Cadastrar sintomas

| Entrada | Particoes | US09-CT01 | US09-CT02 | US09-CT03 | US09-CT04 | US09-CT05 |
|---|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN | ADMIN |
| Campos obrigatorios | Completos / Incompletos | Completos | Completos | Incompletos | Completos | Completos |
| Severidade | LOW MEDIUM HIGH CRITICAL / Fora do dominio | LOW MEDIUM HIGH CRITICAL | LOW MEDIUM HIGH CRITICAL | LOW MEDIUM HIGH CRITICAL | Fora do dominio | LOW MEDIUM HIGH CRITICAL |
| Especialidade | Informada / Ausente | Informada | Informada | Informada | Informada | Ausente |
| Decisao |  | Criar sintoma | Rejeitar por falta de permissao | Rejeitar por obrigatoriedade | Rejeitar por severidade invalida | Rejeitar por falta de especialidade |

**Gherkin**

- **US09-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa name, severity valida e specialty preenchida
  - Entao o sistema deve criar o sintoma
- **US09-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta cadastrar um sintoma
  - Entao o sistema deve rejeitar a operacao
- **US09-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando envia o cadastro sem todos os campos obrigatorios
  - Entao o sistema deve rejeitar a criacao
- **US09-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa severidade fora de LOW, MEDIUM, HIGH ou CRITICAL
  - Entao o sistema deve rejeitar a criacao
- **US09-CT05**
  - Dado que o solicitante possui perfil ADMIN
  - Quando nao associa o sintoma a uma especialidade
  - Entao o sistema deve rejeitar a criacao

## US10 - Listar e consultar sintomas cadastrados

| Entrada | Particoes | US10-CT01 | US10-CT02 | US10-CT03 | US10-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN |
| Tipo de consulta | Listagem ou consulta autorizada / Listagem da base disponivel / Consulta por ID inexistente | Listagem ou consulta autorizada | Listagem ou consulta autorizada | Listagem da base disponivel | Consulta por ID inexistente |
| Decisao |  | Permitir consulta de sintomas | Rejeitar consulta | Retornar apenas sintomas disponiveis para triagem | Retornar nao encontrado |

**Gherkin**

- **US10-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a listagem ou consulta de sintomas
  - Entao o sistema deve permitir a operacao
- **US10-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando solicita a listagem ou consulta de sintomas
  - Entao o sistema deve rejeitar a operacao
- **US10-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a listagem de sintomas
  - Entao o sistema deve retornar apenas sintomas disponiveis para triagem
- **US10-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando consulta um sintoma por identificador inexistente
  - Entao o sistema deve retornar nao encontrado

## US11 - Editar um sintoma

| Entrada | Particoes | US11-CT01 | US11-CT02 | US11-CT03 | US11-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN |
| Severidade | Valida / Invalida / Nao alterada | Valida | Valida | Invalida | Valida |
| Especialidade | Informada / Ausente / Nao alterada | Informada | Informada | Informada | Ausente |
| Decisao |  | Atualizar sintoma | Rejeitar por falta de permissao | Rejeitar por severidade invalida | Rejeitar por falta de especialidade |

**Gherkin**

- **US11-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando atualiza o sintoma com severidade valida e especialidade informada
  - Entao o sistema deve salvar a alteracao
- **US11-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta editar um sintoma
  - Entao o sistema deve rejeitar a operacao
- **US11-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa severidade invalida na edicao
  - Entao o sistema deve rejeitar a atualizacao
- **US11-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando remove a especialidade associada ao sintoma
  - Entao o sistema deve rejeitar a atualizacao

## US12 - Excluir ou inativar um sintoma

| Entrada | Particoes | US12-CT01 | US12-CT02 |
|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN |
| Decisao |  | Marcar sintoma como inativo e impedir uso em consulta de especialidade e triagem | Rejeitar operacao |

**Gherkin**

- **US12-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a exclusao de um sintoma
  - Entao o sistema deve inativar o sintoma e impedir seu uso em consulta de especialidade e triagem
- **US12-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta excluir um sintoma
  - Entao o sistema deve rejeitar a operacao

---

## US13 - Cadastrar um medico

| Entrada | Particoes | US13-CT01 | US13-CT02 | US13-CT03 | US13-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN |
| Campos obrigatorios | Completos / Incompletos | Completos | Completos | Incompletos | Completos |
| CRM | Unico / Duplicado | Unico | Unico | Unico | Duplicado |
| Decisao |  | Criar medico | Rejeitar por falta de permissao | Rejeitar por obrigatoriedade | Rejeitar por CRM duplicado |

**Gherkin**

- **US13-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa name, crm e specialty com CRM unico
  - Entao o sistema deve criar o medico
- **US13-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta cadastrar um medico
  - Entao o sistema deve rejeitar a operacao
- **US13-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando envia cadastro sem todos os campos obrigatorios
  - Entao o sistema deve rejeitar a criacao
- **US13-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa CRM ja existente no sistema
  - Entao o sistema deve rejeitar a criacao

## US14 - Listar e consultar medicos cadastrados

| Entrada | Particoes | US14-CT01 | US14-CT02 | US14-CT03 | US14-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN | ADMIN |
| Tipo de consulta | Listagem ou consulta autorizada / Listagem da base disponivel / Consulta por ID inexistente | Listagem ou consulta autorizada | Listagem ou consulta autorizada | Listagem da base disponivel | Consulta por ID inexistente |
| Decisao |  | Permitir consulta de medicos | Rejeitar consulta | Retornar apenas medicos disponiveis | Retornar nao encontrado |

**Gherkin**

- **US14-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a listagem ou consulta de medicos
  - Entao o sistema deve permitir a operacao
- **US14-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando solicita a listagem ou consulta de medicos
  - Entao o sistema deve rejeitar a operacao
- **US14-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a listagem de medicos
  - Entao o sistema deve retornar apenas medicos disponiveis para encaminhamento e agenda
- **US14-CT04**
  - Dado que o solicitante possui perfil ADMIN
  - Quando consulta um medico por identificador inexistente
  - Entao o sistema deve retornar nao encontrado

## US15 - Editar um medico

| Entrada | Particoes | US15-CT01 | US15-CT02 | US15-CT03 |
|---|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN | ADMIN |
| CRM | Unico ou nao alterado / Duplicado | Unico ou nao alterado | Unico ou nao alterado | Duplicado |
| Decisao |  | Atualizar medico | Rejeitar por falta de permissao | Rejeitar por CRM duplicado |

**Gherkin**

- **US15-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando atualiza um medico mantendo CRM unico
  - Entao o sistema deve salvar a alteracao
- **US15-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta editar um medico
  - Entao o sistema deve rejeitar a operacao
- **US15-CT03**
  - Dado que o solicitante possui perfil ADMIN
  - Quando informa CRM ja utilizado por outro medico
  - Entao o sistema deve rejeitar a atualizacao

## US16 - Excluir ou inativar um medico

| Entrada | Particoes | US16-CT01 | US16-CT02 |
|---|---|---|---|
| Perfil solicitante | ADMIN / Nao ADMIN | ADMIN | Nao ADMIN |
| Decisao |  | Marcar medico como inativo e impedir novo agendamento | Rejeitar operacao |

**Gherkin**

- **US16-CT01**
  - Dado que o solicitante possui perfil ADMIN
  - Quando solicita a exclusao de um medico
  - Entao o sistema deve inativar o medico e impedir novos agendamentos para ele
- **US16-CT02**
  - Dado que o solicitante nao possui perfil ADMIN
  - Quando tenta excluir um medico
  - Entao o sistema deve rejeitar a operacao

---

## US17 - Registrar os sintomas informados por um paciente

| Entrada | Particoes | US17-CT01 | US17-CT02 | US17-CT03 | US17-CT04 | US17-CT05 |
|---|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| patientId | Paciente ativo / Paciente inativo | Paciente ativo | Paciente ativo | Paciente inativo | Paciente ativo | Paciente ativo |
| symptomIds | Array nao vazio sem inativos / Array nao vazio com duplicados / Array com sintoma inativo / Ausente ou vazio | Array nao vazio sem inativos | Array nao vazio sem inativos | Array nao vazio sem inativos | Array com sintoma inativo | Ausente ou vazio |
| Duplicidade de sintomas | Sem duplicidade / Com duplicidade | Com duplicidade | Sem duplicidade | Sem duplicidade | Sem duplicidade | Sem duplicidade |
| Decisao |  | Registrar triagem desconsiderando IDs duplicados antes do calculo | Rejeitar por falta de permissao | Rejeitar por paciente inativo | Rejeitar por uso de sintoma inativo | Rejeitar por falta de dados obrigatorios |

**Gherkin**

- **US17-CT01**
  - Dado que o solicitante possui perfil autorizado para triagens
  - Quando registra uma triagem para paciente ativo com symptomIds validos contendo duplicidades
  - Entao o sistema deve desconsiderar IDs duplicados antes do calculo e registrar a triagem
- **US17-CT02**
  - Dado que o solicitante nao possui perfil ADMIN nem RECEPTIONIST
  - Quando tenta registrar uma triagem
  - Entao o sistema deve rejeitar a operacao
- **US17-CT03**
  - Dado que o solicitante possui perfil autorizado
  - Quando tenta registrar triagem para paciente inativo
  - Entao o sistema deve rejeitar a operacao
- **US17-CT04**
  - Dado que o solicitante possui perfil autorizado
  - Quando informa ao menos um sintoma inativo na triagem
  - Entao o sistema deve rejeitar a operacao
- **US17-CT05**
  - Dado que o solicitante possui perfil autorizado
  - Quando nao informa patientId ou symptomIds em array nao vazio
  - Entao o sistema deve rejeitar o registro

## US18 - Consultar a especialidade sugerida

| Entrada | Particoes | US18-CT01 | US18-CT02 | US18-CT03 | US18-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| symptomIds | Array nao vazio / Ausente vazio ou nao array | Array nao vazio | Array nao vazio | Ausente vazio ou nao array | Array nao vazio |
| Pontuacao por especialidade | Vencedor unico / Empate | Vencedor unico | Vencedor unico | Nao aplicavel | Empate |
| Decisao |  | Retornar especialidade com maior soma de pesos | Rejeitar por falta de permissao | Rejeitar por symptomIds invalido | Retornar especialidade vencedora pelo desempate alfabetico |

**Gherkin**

- **US18-CT01**
  - Dado que o solicitante possui perfil autorizado para triagens
  - Quando informa symptomIds validos cuja soma de pesos aponta uma especialidade unica
  - Entao o sistema deve retornar a especialidade com maior pontuacao
- **US18-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando consulta a especialidade sugerida
  - Entao o sistema deve rejeitar a operacao
- **US18-CT03**
  - Dado que o solicitante possui perfil autorizado
  - Quando nao envia symptomIds em array nao vazio
  - Entao o sistema deve rejeitar a consulta
- **US18-CT04**
  - Dado que o solicitante possui perfil autorizado
  - Quando duas ou mais especialidades empatam na pontuacao total
  - Entao o sistema deve retornar a especialidade vencedora em ordem alfabetica

## US19 - Visualizar a prioridade calculada da triagem

| Entrada | Particoes | US19-CT01 | US19-CT02 | US19-CT03 |
|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST |
| Sintomas informados | Com severidades validas / Nao disponiveis para consulta | Com severidades validas | Com severidades validas | Nao disponiveis para consulta |
| Decisao |  | Retornar a maior severidade entre os sintomas informados | Rejeitar por falta de permissao | Nao ha regra suficiente no documento para decidir comportamento |

**Gherkin**

- **US19-CT01**
  - Dado que o solicitante possui perfil autorizado para triagens
  - Quando consulta a prioridade calculada a partir de sintomas validos
  - Entao o sistema deve retornar a maior severidade entre os sintomas informados
- **US19-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando consulta a prioridade da triagem
  - Entao o sistema deve rejeitar a operacao
- **US19-CT03**
  - Dado que nao ha sintomas disponiveis para calcular prioridade
  - Quando a consulta e realizada
  - Entao a especificacao precisa ser esclarecida antes de concluir a decisao esperada

## US20 - Registrar o resultado consolidado da triagem

| Entrada | Particoes | US20-CT01 | US20-CT02 | US20-CT03 |
|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST |
| Resultado consolidado | Completo com especialidade prioridade sintomas e usuario / Incompleto | Completo com especialidade prioridade sintomas e usuario | Completo com especialidade prioridade sintomas e usuario | Incompleto |
| Decisao |  | Persistir resultado consolidado da triagem | Rejeitar por falta de permissao | Rejeitar gravacao |

**Gherkin**

- **US20-CT01**
  - Dado que o solicitante possui perfil autorizado para triagens
  - Quando conclui o registro de triagem com especialidade sugerida, prioridade, sintomas considerados e usuario responsavel
  - Entao o sistema deve persistir o resultado consolidado
- **US20-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando tenta registrar o resultado consolidado da triagem
  - Entao o sistema deve rejeitar a operacao
- **US20-CT03**
  - Dado que o solicitante possui perfil autorizado para triagens
  - Quando tenta registrar o resultado consolidado sem especialidade sugerida, prioridade, sintomas considerados ou usuario responsavel
  - Entao o sistema deve rejeitar a gravacao

---

## US21 - Agendar uma consulta para o paciente

| Entrada | Particoes | US21-CT01 | US21-CT02 | US21-CT03 | US21-CT04 | US21-CT05 | US21-CT06 |
|---|---|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| Campos obrigatorios | Completos / Incompletos | Completos | Completos | Incompletos | Completos | Completos | Completos |
| scheduledAt | Data valida / Data invalida | Data valida | Data valida | Data valida | Data invalida | Data valida | Data valida |
| Paciente | Ativo / Inativo | Ativo | Ativo | Ativo | Ativo | Inativo | Ativo |
| Medico | Ativo / Inativo | Ativo | Ativo | Ativo | Ativo | Ativo | Inativo |
| triageId | Informado ou ausente | Ausente | Ausente | Ausente | Ausente | Ausente | Ausente |
| Decisao |  | Criar agendamento com scheduledAt normalizado, status SCHEDULED e usuario responsavel | Rejeitar por falta de permissao | Rejeitar por obrigatoriedade | Rejeitar por data invalida | Rejeitar por paciente inativo | Rejeitar por medico inativo |

**Gherkin**

- **US21-CT01**
  - Dado que o solicitante possui perfil autorizado para agendamentos
  - Quando informa patientId, doctorId e scheduledAt valido para paciente ativo e medico ativo
  - Entao o sistema deve criar o agendamento com data normalizada em ISO, status SCHEDULED e usuario responsavel
- **US21-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando tenta criar um agendamento
  - Entao o sistema deve rejeitar a operacao
- **US21-CT03**
  - Dado que o solicitante possui perfil autorizado
  - Quando nao informa todos os campos obrigatorios
  - Entao o sistema deve rejeitar a criacao
- **US21-CT04**
  - Dado que o solicitante possui perfil autorizado
  - Quando informa scheduledAt invalido
  - Entao o sistema deve rejeitar a criacao
- **US21-CT05**
  - Dado que o solicitante possui perfil autorizado
  - Quando tenta agendar consulta para paciente inativo
  - Entao o sistema deve rejeitar a criacao
- **US21-CT06**
  - Dado que o solicitante possui perfil autorizado
  - Quando tenta agendar consulta com medico inativo
  - Entao o sistema deve rejeitar a criacao

## US22 - Selecionar um medico compativel com a especialidade sugerida

| Entrada | Particoes | US22-CT01 | US22-CT02 | US22-CT03 | US22-CT04 |
|---|---|---|---|---|---|
| triageId | Ausente / Informado do mesmo paciente / Informado de outro paciente | Ausente | Informado do mesmo paciente | Informado de outro paciente | Informado do mesmo paciente |
| Especialidade do medico x triagem | Nao aplicavel / Igual / Diferente | Nao aplicavel | Igual | Igual | Diferente |
| Decisao |  | Permitir selecao sem validar aderencia por triagem | Permitir selecao do medico | Rejeitar por triagem pertencer a outro paciente | Rejeitar por especialidade divergente da triagem |

**Gherkin**

- **US22-CT01**
  - Dado que o agendamento nao informa triageId
  - Quando um medico e selecionado
  - Entao o sistema deve permitir a selecao sem validar aderencia pela triagem
- **US22-CT02**
  - Dado que o agendamento informa triageId do mesmo paciente
  - Quando a especialidade sugerida na triagem coincide com a do medico
  - Entao o sistema deve permitir a selecao
- **US22-CT03**
  - Dado que o agendamento informa triageId de outro paciente
  - Quando o medico e selecionado
  - Entao o sistema deve rejeitar a operacao
- **US22-CT04**
  - Dado que o agendamento informa triageId do mesmo paciente
  - Quando a especialidade do medico diverge da especialidade sugerida na triagem
  - Entao o sistema deve rejeitar a operacao

## US23 - Validar conflito de horarios no agendamento

| Entrada | Particoes | US23-CT01 | US23-CT02 | US23-CT03 |
|---|---|---|---|---|
| scheduledAt | Normalizavel para ISO / Nao normalizavel | Normalizavel para ISO | Normalizavel para ISO | Nao normalizavel |
| Agendamento existente para mesmo medico e horario | Nenhum SCHEDULED / Existe SCHEDULED | Nenhum SCHEDULED | Existe SCHEDULED | Nao aplicavel |
| Decisao |  | Permitir criacao sem conflito | Rejeitar por conflito de horario | Rejeitar por data invalida |

**Gherkin**

- **US23-CT01**
  - Dado que a data e hora informadas podem ser normalizadas para ISO
  - Quando nao existe outro agendamento com status SCHEDULED para o mesmo medico no mesmo horario
  - Entao o sistema deve permitir a criacao
- **US23-CT02**
  - Dado que a data e hora informadas podem ser normalizadas para ISO
  - Quando ja existe agendamento SCHEDULED para o mesmo medico no mesmo horario
  - Entao o sistema deve rejeitar a criacao por conflito
- **US23-CT03**
  - Dado que a data e hora informadas nao podem ser normalizadas para ISO
  - Quando o agendamento e submetido
  - Entao o sistema deve rejeitar a criacao

## US24 - Consultar os agendamentos realizados

| Entrada | Particoes | US24-CT01 | US24-CT02 | US24-CT03 | US24-CT04 |
|---|---|---|---|---|---|
| Perfil solicitante | ADMIN ou RECEPTIONIST / Outro | ADMIN ou RECEPTIONIST | Outro | ADMIN ou RECEPTIONIST | ADMIN ou RECEPTIONIST |
| Tipo de consulta | Listagem ou consulta autorizada / Consulta com filtro / Consulta por ID inexistente | Listagem ou consulta autorizada | Listagem ou consulta autorizada | Consulta com filtro | Consulta por ID inexistente |
| Decisao |  | Permitir consulta de agendamentos | Rejeitar consulta | Retornar apenas agendamentos compativeis com o filtro aplicado | Retornar nao encontrado |

**Gherkin**

- **US24-CT01**
  - Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
  - Quando solicita a listagem ou consulta de agendamentos
  - Entao o sistema deve permitir a operacao
- **US24-CT02**
  - Dado que o solicitante nao possui perfil autorizado
  - Quando solicita a listagem ou consulta de agendamentos
  - Entao o sistema deve rejeitar a operacao
- **US24-CT03**
  - Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
  - Quando consulta agendamentos com filtro valido
  - Entao o sistema deve retornar apenas os agendamentos compativeis com o filtro aplicado
- **US24-CT04**
  - Dado que o solicitante possui perfil ADMIN ou RECEPTIONIST
  - Quando consulta um agendamento por identificador inexistente
  - Entao o sistema deve retornar nao encontrado

