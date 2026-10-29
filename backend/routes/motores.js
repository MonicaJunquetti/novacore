const express = require("express");
const router = express.Router();
const db = require("../db"); // conexão mysql

// ==========================================
// 1. LISTAR TODOS OS MOTORES DE UM DASHBOARD ESPECÍFICO
// ==========================================
router.get("/dashboard/:idDashboard", (req, res) => {
  const { idDashboard } = req.params;

  const sql = `
    SELECT
      m.*,
      s.estado AS status_vibracao,
      s.valor_vibracao,
      t.estado AS status_temperatura,
      t.valor_temp,
      s.ultima_atualizacao
    FROM tb_motores m
    LEFT JOIN tb_status_motor s ON m.id_motor = s.fk_motor
    LEFT JOIN tb_status_temp t ON m.id_motor = t.fk_motor
    WHERE m.fk_dashboard = ?
  `;

  db.query(sql, [idDashboard], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar motores do dashboard:", err);
      return res.status(500).json({ message: "Erro ao buscar motores do dashboard" });
    }

    const motores = rows.map((motor) => {
      let statusFinal = "ok";

      if (motor.status_vibracao === "erro" || motor.status_temperatura === "erro") {
        statusFinal = "erro";
      } else if (motor.status_vibracao === "alerta" || motor.status_temperatura === "alerta") {
        statusFinal = "alerta";
      }

      return {
        ...motor,
        status: statusFinal,
        status_vibracao: motor.status_vibracao || "ok",
        status_temperatura: motor.status_temperatura || "ok",
        valor_vibracao: motor.valor_vibracao || 0,
        valor_temp: motor.valor_temp || 0,
        cor_grafico: motor.cor_grafico || "#6C5DD1"
      };
    });

    res.json(motores);
  });
});

// ==========================================
// 2. LISTAR TODOS OS MOTORES (Geral)
// ==========================================
router.get("/", (req, res) => {
  const sql = `
    SELECT
      m.*,
      s.estado AS status_vibracao,
      s.valor_vibracao,
      t.estado AS status_temperatura,
      t.valor_temp,
      s.ultima_atualizacao
    FROM tb_motores m
    LEFT JOIN tb_status_motor s ON m.id_motor = s.fk_motor
    LEFT JOIN tb_status_temp t ON m.id_motor = t.fk_motor
  `;

  db.query(sql, (err, rows) => {
    if (err) {
      console.error("Erro ao buscar motores:", err);
      return res.status(500).json({ message: "Erro ao buscar motores" });
    }

    const motores = rows.map((motor) => {
      let statusFinal = "ok";
      if (motor.status_vibracao === "erro" || motor.status_temperatura === "erro") {
        statusFinal = "erro";
      } else if (motor.status_vibracao === "alerta" || motor.status_temperatura === "alerta") {
        statusFinal = "alerta";
      }

      return {
        ...motor,
        status: statusFinal,
        cor_grafico: motor.cor_grafico || "#6C5DD1"
      };
    });

    res.json(motores);
  });
});

// ==========================================
// 3. CADASTRAR MOTOR (Incluindo cor_grafico)
// ==========================================
router.post("/", (req, res) => {
  const {
    nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor,
    classe_isolamento, voltagem_nominal, corrente_nominal, fator_potencia,
    rendimento, espessura_carcaca, area_conducao, condutividade_metal,
    raio_interno_carcaca, raio_externo_estator, comprimento_estator,
    fk_dashboard, cor_grafico
  } = req.body;

  if (!fk_dashboard) {
    return res.status(400).json({ erro: "ID do Dashboard (fk_dashboard) é obrigatório." });
  }

  const corFinal = cor_grafico || '#6C5DD1';

  const sqlMotor = `
    INSERT INTO tb_motores
    (nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor, classe_isolamento,
    voltagem_nominal, corrente_nominal, fator_potencia, rendimento,
    espessura_carcaca, area_conducao, condutividade_metal, raio_interno_carcaca,
    raio_externo_estator, comprimento_estator, fk_dashboard, cor_grafico)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(
    sqlMotor,
    [
      nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor,
      classe_isolamento, voltagem_nominal, corrente_nominal, fator_potencia,
      rendimento, espessura_carcaca, area_conducao, condutividade_metal,
      raio_interno_carcaca, raio_externo_estator, comprimento_estator,
      fk_dashboard, corFinal
    ],
    (err, result) => {
      if (err) {
        console.error("Erro ao cadastrar motor:", err);
        return res.status(500).json({ erro: "Erro ao cadastrar motor" });
      }

      const idMotorCriado = result.insertId;

      // Criação automática dos registros em tb_status_motor e tb_status_temp
      const sqlStatusMotor = `INSERT INTO tb_status_motor (fk_motor, estado, valor_vibracao) VALUES (?, 'ok', 0.0)`;
      const sqlStatusTemp = `INSERT INTO tb_status_temp (fk_motor, estado, valor_temp) VALUES (?, 'ok', 0.0)`;

      db.query(sqlStatusMotor, [idMotorCriado], () => {
        db.query(sqlStatusTemp, [idMotorCriado], () => {
          res.json({
            mensagem: "Motor e estados vinculados com sucesso ao dashboard!",
            id_motor: idMotorCriado,
            fk_dashboard,
            cor_grafico: corFinal
          });
        });
      });
    }
  );
});

// ==========================================
// 4. EDITAR MOTOR (Atualizando também a cor)
// ==========================================
router.put("/:id", (req, res) => {
  const { id } = req.params;
  const {
    nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor,
    classe_isolamento, voltagem_nominal, corrente_nominal, fator_potencia,
    rendimento, espessura_carcaca, area_conducao, condutividade_metal,
    raio_interno_carcaca, raio_externo_estator, comprimento_estator,
    cor_grafico
  } = req.body;

  const sql = `
    UPDATE tb_motores SET
      nome_motor = ?, localizacao = ?, numero_polos = ?, rpm_nominal = ?,
      potencia_motor = ?, classe_isolamento = ?, voltagem_nominal = ?,
      corrente_nominal = ?, fator_potencia = ?, rendimento = ?,
      espessura_carcaca = ?, area_conducao = ?, condutividade_metal = ?,
      raio_interno_carcaca = ?, raio_externo_estator = ?, comprimento_estator = ?,
      cor_grafico = COALESCE(?, cor_grafico)
    WHERE id_motor = ?
  `;

  db.query(
    sql,
    [
      nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor,
      classe_isolamento, voltagem_nominal, corrente_nominal, fator_potencia,
      rendimento, espessura_carcaca, area_conducao, condutividade_metal,
      raio_interno_carcaca, raio_externo_estator, comprimento_estator,
      cor_grafico, id
    ],
    (err, result) => {
      if (err) {
        console.error("Erro ao atualizar motor:", err);
        return res.status(500).json({ erro: "Erro ao atualizar motor" });
      }
      res.json({ mensagem: "Motor atualizado com sucesso" });
    }
  );
});

// ==========================================
// 5. EXCLUIR MOTOR
// ==========================================
router.delete("/:id", (req, res) => {
  const { id } = req.params;

  db.query(`DELETE FROM tb_status_motor WHERE fk_motor = ?`, [id], () => {
    db.query(`DELETE FROM tb_status_temp WHERE fk_motor = ?`, [id], () => {
      db.query(`DELETE FROM tb_motores WHERE id_motor = ?`, [id], (err) => {
        if (err) {
          console.error("Erro ao excluir motor:", err);
          return res.status(500).json({ erro: "Erro ao excluir motor" });
        }
        res.json({ mensagem: "Motor excluído com sucesso" });
      });
    });
  });
});

module.exports = router;