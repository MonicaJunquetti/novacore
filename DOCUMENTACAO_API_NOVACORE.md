# Documentação da API — NovaCore

## 1. Visão geral

A API do **NovaCore** é responsável pela comunicação entre os dispositivos ESP32, a aplicação mobile e o banco de dados MySQL. O backend foi desenvolvido com **Node.js + Express** e disponibiliza rotas HTTP para cadastro e autenticação de usuários, gerenciamento de motores, recebimento dos dados dos sensores, consulta de históricos, status e alertas.

### Tecnologias

- Node.js
- Express
- MySQL / MySQL2
- CORS
- bcrypt
- ESP32
- React Native + Expo

## 2. Execução da API

Por padrão, o servidor é iniciado na porta `3000`.

```bash
npm start
```

A URL base utilizada localmente é:

```text
http://localhost:3000
```

> Em testes com o ESP32, a URL deve utilizar o endereço IP da máquina que está executando o backend, por exemplo: `http://192.168.0.146:3000`.

## 3. Formato das requisições

As requisições que utilizam corpo (`body`) devem enviar dados no formato JSON.

```http
Content-Type: application/json
```

As rotas de consulta de sensores utilizam parâmetros na URL (`query parameters`).

Exemplo:

```text
GET /sensores/dados?motor=1&ax=0.10&ay=0.05&az=1.02&gx=0.01&gy=0.02&gz=0.03
```

---

# 4. Endpoints

## 4.1 Usuários

Prefixo:

```text
/usuarios
```

### POST `/usuarios/cadastro`

Cadastra um novo usuário.

#### Corpo da requisição

```json
{
  "nome": "Mônica",
  "email": "monica@email.com",
  "senha": "123456"
}
```

#### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "message": "Usuário criado!"
}
```

A senha é armazenada utilizando hash com `bcrypt`.

---

### POST `/usuarios/login`

Realiza a autenticação do usuário.

#### Corpo da requisição

```json
{
  "email": "monica@email.com",
  "senha": "123456"
}
```

#### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "message": "Login OK",
  "usuario": {}
}
```

#### Possíveis erros

**Status:** `401 Unauthorized`

```json
{
  "message": "Usuário não encontrado"
}
```

ou:

```json
{
  "message": "Senha inválida"
}
```

---

### PUT `/usuarios/editar/:id`

Atualiza os dados de um usuário.

#### Parâmetro de rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | inteiro | ID do usuário |

#### Corpo da requisição

```json
{
  "nome": "Mônica Nunes",
  "email": "monica@email.com",
  "senha": "novaSenha"
}
```

O campo `senha` pode ser omitido ou enviado vazio caso não seja necessário alterá-lo.

#### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "message": "Perfil atualizado!"
}
```

---

# 4.2 Motores

Prefixo:

```text
/motores
```

### GET `/motores`

Retorna os motores cadastrados juntamente com seus estados atuais de vibração e temperatura.

#### Resposta de sucesso

**Status:** `200 OK`

Exemplo simplificado:

```json
[
  {
    "id_motor": 1,
    "nome_motor": "Motor 1",
    "localizacao": "Laboratório",
    "status": "ok",
    "status_vibracao": "ok",
    "status_temperatura": "ok",
    "valor_vibracao": 0.42,
    "valor_temp": 35.8
  }
]
```

O campo `status` representa o estado geral do motor:

- `ok`: funcionamento normal;
- `alerta`: condição de atenção;
- `erro`: condição crítica.

---

### POST `/motores`

Cadastra um novo motor.

#### Corpo da requisição

```json
{
  "nome_motor": "Motor 1",
  "localizacao": "Laboratório",
  "numero_polos": 4,
  "rpm_nominal": 1750,
  "potencia_motor": 1.5,
  "classe_isolamento": "F",
  "voltagem_nominal": 380,
  "corrente_nominal": 4.5,
  "fator_potencia": 0.88,
  "rendimento": 0.865,
  "espessura_carcaca": 0.006,
  "area_conducao": 1.70816,
  "condutividade_metal": 44,
  "raio_interno_carcaca": 0.07,
  "raio_externo_estator": 0.0698,
  "comprimento_estator": 0.14
}
```

#### Resposta de sucesso

**Status:** `200 OK`

```json
{
  "mensagem": "Motor cadastrado com sucesso"
}
```

---

### PUT `/motores/:id`

Atualiza os dados de um motor.

#### Parâmetro de rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | inteiro | ID do motor |

#### Corpo da requisição

Utiliza os mesmos campos do cadastro:

```json
{
  "nome_motor": "Motor 1",
  "localizacao": "Laboratório",
  "numero_polos": 4,
  "rpm_nominal": 1750,
  "potencia_motor": 1.5,
  "classe_isolamento": "F",
  "voltagem_nominal": 380,
  "corrente_nominal": 4.5,
  "fator_potencia": 0.88,
  "rendimento": 0.865,
  "espessura_carcaca": 0.006,
  "area_conducao": 1.70816,
  "condutividade_metal": 44,
  "raio_interno_carcaca": 0.07,
  "raio_externo_estator": 0.0698,
  "comprimento_estator": 0.14
}
```

#### Resposta de sucesso

```json
{
  "mensagem": "Motor atualizado com sucesso"
}
```

---

### DELETE `/motores/:id`

Exclui um motor.

#### Parâmetro de rota

| Parâmetro | Tipo | Descrição |
|---|---|---|
| `id` | inteiro | ID do motor |

#### Resposta de sucesso

```json
{
  "mensagem": "Motor excluído com sucesso"
}
```

---

# 4.3 Dados de vibração

Prefixo:

```text
/sensores
```

### GET `/sensores/dados`

Recebe os dados de aceleração e giroscópio enviados pelo ESP32.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `motor` | inteiro | Não | ID do motor. Padrão: `1` |
| `ax` | decimal | Sim | Aceleração no eixo X |
| `ay` | decimal | Sim | Aceleração no eixo Y |
| `az` | decimal | Sim | Aceleração no eixo Z |
| `gx` | decimal | Sim | Velocidade angular no eixo X |
| `gy` | decimal | Sim | Velocidade angular no eixo Y |
| `gz` | decimal | Sim | Velocidade angular no eixo Z |

#### Exemplo

```text
GET /sensores/dados?motor=1&ax=0.10&ay=0.05&az=1.02&gx=0.01&gy=0.02&gz=0.03
```

O backend realiza etapas de processamento que incluem calibração, remoção de offset, conversão para `m/s²`, filtragem de Kalman, filtragem de ruído e cálculo do RMS.

#### Resposta durante a calibração

```json
{
  "status": "calibrando",
  "progresso": 0.5
}
```

#### Resposta após o processamento

```json
{
  "aceleracaoX": 0.25,
  "aceleracaoY": 0.31,
  "aceleracaoZ": 0.18,
  "aceleracaoTotal": 0.44,
  "unidade": "m/s²",
  "estado": "ok"
}
```

#### Estados da vibração

- `ok`
- `alerta`
- `erro`

#### Erro de dados inválidos

**Status:** `400 Bad Request`

```json
{
  "erro": "Dados inválidos"
}
```

---

### GET `/sensores/ultimos-grafico`

Retorna dados de vibração para utilização nos gráficos da aplicação.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `motor` | inteiro | Não | ID do motor. Padrão: `1` |
| `filtro` | texto | Não | `Hora`, `Dia` ou `Semana` |

#### Exemplos

Últimos registros:

```text
GET /sensores/ultimos-grafico?motor=1
```

Última hora:

```text
GET /sensores/ultimos-grafico?motor=1&filtro=Hora
```

Últimas 24 horas:

```text
GET /sensores/ultimos-grafico?motor=1&filtro=Dia
```

Últimos 7 dias:

```text
GET /sensores/ultimos-grafico?motor=1&filtro=Semana
```

#### Resposta

```json
[
  {
    "ponto_escala": "18:30",
    "valor": 0.42
  },
  {
    "ponto_escala": "18:31",
    "valor": 0.45
  }
]
```

Quando nenhum filtro é informado, são retornados os últimos 20 registros.

---

# 4.4 Dados de temperatura

Prefixo:

```text
/sensor_temp
```

### GET `/sensor_temp/dados`

Recebe a temperatura da carcaça enviada pelo ESP32.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `motor` | inteiro | Não | ID do motor. Padrão: `1` |
| `Tc` | decimal | Sim | Temperatura da carcaça |
| `unidade` | texto | Não | Unidade da temperatura. Padrão: `C` |

#### Exemplo

```text
GET /sensor_temp/dados?motor=1&Tc=35.8&unidade=C
```

A temperatura recebida passa por um filtro de Kalman antes de ser processada.

O backend consulta a classe de isolamento do motor e determina os limites de alerta e condição crítica.

### Limites utilizados

| Classe | Alerta | Crítico |
|---|---:|---:|
| B | 96 °C | 104 °C |
| F | 108 °C | 124 °C |
| H | 124 °C | 144 °C |

Para a estimativa da temperatura do enrolamento, os limites são ajustados em 10%.

#### Resposta de sucesso

```json
{
  "status": "sucesso",
  "valor_salvo": 35.7,
  "estado_motor": "ok",
  "limite_alerta": 108,
  "limite_critico": 124
}
```

#### Erro de temperatura inválida

**Status:** `400 Bad Request`

```json
{
  "erro": "Temperatura inválida"
}
```

---

### GET `/sensor_temp/ultimos_temp`

Retorna o histórico de temperatura.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `motor` | inteiro | Não | ID do motor. Padrão: `1` |
| `filtro` | texto | Não | `Hora`, `Dia` ou `Semana` |
| `tipo` | texto | Não | `carcaca` ou `enrolamento` |

#### Exemplos

```text
GET /sensor_temp/ultimos_temp?motor=1
```

```text
GET /sensor_temp/ultimos_temp?motor=1&filtro=Hora
```

```text
GET /sensor_temp/ultimos_temp?motor=1&filtro=Dia
```

```text
GET /sensor_temp/ultimos_temp?motor=1&filtro=Semana
```

Para temperatura do enrolamento:

```text
GET /sensor_temp/ultimos_temp?motor=1&tipo=enrolamento
```

#### Resposta

```json
[
  {
    "ponto_escala": "18:30",
    "valor": 35.8
  },
  {
    "ponto_escala": "18:31",
    "valor": 36.1
  }
]
```

Os filtros representam:

- `Hora`: dados da última hora, agrupados por minuto;
- `Dia`: dados das últimas 24 horas, agrupados por hora;
- `Semana`: dados dos últimos 7 dias, agrupados por dia;
- sem filtro: últimos 20 registros.

---

### GET `/sensor_temp/status_motor`

Consulta o status atual de temperatura de um motor.

#### Parâmetros

| Parâmetro | Tipo | Obrigatório | Descrição |
|---|---|---|---|
| `motor` | inteiro | Não | ID do motor. Padrão: `1` |

#### Exemplo

```text
GET /sensor_temp/status_motor?motor=1
```

#### Resposta

```json
{
  "motor": 1,
  "estado": "ok",
  "temperatura": 35.8,
  "ultima_atualizacao": "2026-10-29T18:30:00.000Z"
}
```

Caso ainda não exista um registro para o motor:

```json
{
  "motor": 1,
  "estado": "ok",
  "temperatura": null,
  "ultima_atualizacao": null
}
```

---

# 4.5 Alertas

Prefixo:

```text
/alertas
```

### GET `/alertas`

Retorna os 20 alertas mais recentes registrados pelo sistema.

#### Exemplo

```text
GET /alertas
```

#### Resposta

```json
[
  {
    "id_alerta": 1,
    "fk_motor": 1,
    "fk_sensor": 2,
    "tipo_alerta": "TEMPERATURA",
    "valor_detectado": 110.5,
    "horario": "2026-10-29T18:30:00.000Z",
    "nivel_alerta": "ALERTA",
    "nome_motor": "Motor 1"
  }
]
```

Os alertas podem ser relacionados à:

- `TEMPERATURA`
- `VIBRACAO`

---

# 4.6 Contagem de status

Prefixo:

```text
/motores
```

### GET `/motores/status-contagem`

Retorna a quantidade de condições normais, de alerta e críticas encontradas nas tabelas de status de temperatura e vibração.

#### Exemplo

```text
GET /motores/status-contagem
```

#### Resposta

```json
{
  "normal": 2,
  "alerta": 1,
  "critico": 0
}
```

Os valores são calculados a partir dos registros de status de vibração e temperatura.

---

# 5. Códigos HTTP utilizados

| Código | Significado | Utilização |
|---|---|---|
| `200` | OK | Requisição processada com sucesso |
| `400` | Bad Request | Dados enviados inválidos |
| `401` | Unauthorized | Falha na autenticação |
| `500` | Internal Server Error | Erro interno no servidor ou banco |

---

# 6. Fluxo de comunicação

O fluxo principal de dados do NovaCore ocorre da seguinte forma:

```text
┌─────────────────────┐
│       ESP32         │
│                     │
│ NTC 103 + MPU6050   │
└──────────┬──────────┘
           │
           │ HTTP
           ▼
┌─────────────────────┐
│      API Express    │
│                     │
│ /sensores           │
│ /sensor_temp        │
└──────────┬──────────┘
           │
           │ Processamento
           ▼
┌─────────────────────┐
│        MySQL        │
│                     │
│ Dados / Status /    │
│ Alertas / Motores   │
└──────────┬──────────┘
           │
           │ HTTP
           ▼
┌─────────────────────┐
│   Aplicação Mobile  │
│ React Native + Expo │
└─────────────────────┘
```

## 7. Processamento dos dados

### Vibração

Os dados do MPU6050 são enviados pelo ESP32 para `/sensores/dados`. A API:

1. valida os dados recebidos;
2. realiza a calibração inicial;
3. remove os offsets;
4. converte os valores para `m/s²`;
5. aplica o filtro de Kalman;
6. aplica filtragem de ruído;
7. mantém um buffer de amostras;
8. calcula o RMS dos eixos;
9. calcula a aceleração total;
10. classifica o estado do motor;
11. registra os dados e alertas no banco.

### Temperatura

Os dados do NTC 103 são enviados para `/sensor_temp/dados`. A API:

1. valida a temperatura;
2. aplica o filtro de Kalman;
3. consulta a classe de isolamento do motor;
4. determina os limites de alerta e condição crítica;
5. atualiza o status do motor;
6. registra alertas quando necessário;
7. armazena os dados no banco de dados.

---

# 8. Observações

- A API atualmente utiliza HTTP e não possui autenticação por token/JWT implementada.
- Os parâmetros `motor` permitem identificar o motor ao qual os dados pertencem.
- Os dados de sensores são armazenados no banco de dados `db_novacore`.
- O backend utiliza a porta `3000` por padrão.
- As rotas de histórico foram desenvolvidas para fornecer dados diretamente para os gráficos da aplicação mobile.
- A API foi desenvolvida como parte do projeto acadêmico NovaCore.

## 9. Repositório

Código-fonte do projeto:

https://github.com/MonicaJunquetti/novacore
