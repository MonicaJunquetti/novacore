<div style="display: flex; align-items: center; gap: 25px;">

  <h1 align="center">NovaCore</h1>
  <br>

  <div>
    <br>
    <p>
      <em>Sistema de Monitoramento de Vibração e Temperatura de Motores Elétricos</em>
    </p>
  </div>

</div>

O **NovaCore** é um sistema desenvolvido para realizar o monitoramento de motores elétricos por meio da coleta e análise de dados de **temperatura** e **vibração**.

O projeto utiliza sensores conectados a uma placa **ESP32**, responsável pela coleta dos dados, que são enviados para uma API e posteriormente armazenados em um banco de dados. As informações podem ser acompanhadas por meio da aplicação mobile.

O sistema tem como objetivo auxiliar na identificação de condições anormais de funcionamento dos motores, permitindo o acompanhamento dos dados e a emissão de alertas quando os valores monitorados ultrapassam os limites definidos.

---

## Sobre o projeto

O NovaCore foi desenvolvido como um projeto acadêmico com foco em **Internet das Coisas (IoT)**, automação e desenvolvimento de sistemas.

A solução integra:

* Monitoramento de temperatura;
* Monitoramento de vibração;
* Comunicação entre hardware e servidor;
* Armazenamento dos dados;
* Processamento das informações;
* Identificação do estado do motor;
* Sistema de alertas;
* Visualização dos dados em aplicativo mobile.

---

## Funcionalidades

### Monitoramento de temperatura

O sistema realiza a leitura da temperatura do motor com o sensor **NTC103** e utiliza os valores coletados para identificar diferentes condições de funcionamento.

Os estados do motor são classificados como:

* 🟢 **OK** — funcionamento dentro dos limites definidos;
* 🟡 **Alerta** — valor próximo ou acima do limite de atenção;
* 🔴 **Erro** — condição crítica identificada.

### Monitoramento de vibração

O projeto utiliza o sensor **MPU6050** para realizar a medição da vibração do motor.

Os dados são processados e analisados para identificar possíveis condições anormais de funcionamento.

### Sistema de alertas

Quando uma condição de alerta ou erro é identificada, o sistema registra a ocorrência para que ela possa ser acompanhada pela aplicação.

### Visualização dos dados

A aplicação permite acompanhar os dados coletados pelos sensores e visualizar o comportamento da temperatura e da vibração.

---

## Arquitetura

O NovaCore possui uma arquitetura composta por três partes principais:

```text
┌──────────────────────┐
│      Sensores        │
│ Temperatura/Vibração │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│        ESP32         │
│ Coleta e envio dados │
└──────────┬───────────┘
           │ HTTP
           ▼
┌──────────────────────┐
│       Backend        │
│     Node.js/API      │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│       MySQL          │
│ Armazenamento dados  │
└──────────┬───────────┘
           │
           ▼
┌──────────────────────┐
│    App Mobile        │
│   React Native       │
└──────────────────────┘
```

---

## Tecnologias utilizadas

| Componente | Tecnologia |
|---|---|
| Aplicação Mobile | React Native + Expo |
| Backend | Node.js + Express |
| Banco de dados | MySQL |
| Temperatura | NTC 103 |
| Vibração | MPU6050 |
| Microcontrolador | ESP32 |
| Desenvolvimento | VS Code + Arduino IDE |

---

## Estrutura do projeto

O repositório está organizado principalmente em dois módulos:

```text
novacore/
│
├── backend/
│   ├── routes/
│   ├── ...
│   └── ...
│
├── novacore2/
│   ├── app/
│   ├── components/
│   ├── assets/
│   └── ...
│
└── README.md
```

O diretório `backend` contém a API responsável pelo processamento das requisições e comunicação com o banco de dados.

O diretório `novacore2` contém a aplicação mobile desenvolvida com React Native e Expo.

---

## Hardware

A solução utiliza uma placa ESP32 para realizar a aquisição dos dados dos sensores.

### MPU6050

O MPU6050 é utilizado para realizar o monitoramento da vibração do motor.

A comunicação com o ESP32 é realizada por meio do protocolo **I²C**.

### NTC103

O NTC 103 é utilizado para realizar a medição da temperatura do motor.

O sensor apresenta variação de resistência de acordo com a temperatura, permitindo que o ESP32 obtenha a temperatura da carcaça do motor para posterior processamento e análise pelo sistema.

---

## Funcionamento do sistema

O funcionamento do NovaCore ocorre da seguinte forma:

1. Os sensores realizam a coleta dos dados;
2. O ESP32 processa as leituras;
3. Os dados são enviados para a API;
4. O backend recebe e processa as informações;
5. Os dados são armazenados no MySQL;
6. O sistema verifica as condições de funcionamento;
7. Alertas são registrados quando necessário;
8. A aplicação mobile apresenta as informações ao usuário.

---

## Possíveis melhorias

Entre as possibilidades de evolução do projeto estão:

* Monitoramento de múltiplos motores simultaneamente;
* Utilização de múltiplas placas ESP32;
* Implantação do backend em ambiente de nuvem;
* Histórico mais completo dos dados;
* Dashboard web;
* Utilização de Inteligência Artificial para manutenção preditiva.

---

## Autores

**Mônica Nunes Junquetti**,
**Marina Laís Rosa**,
**Ana Luiza Ribeiro de Oliveira** e
**Maria Clara de Toledo**.

Projeto desenvolvido para fins acadêmicos.

---

## Repositório
 <img src="novacore2/assets/images/logo.png" alt="Logo NovaCore" width="90">
 
[GitHub — NovaCore](https://github.com/MonicaJunquetti/novacore) 
