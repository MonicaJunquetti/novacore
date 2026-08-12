const express = require("express");
const router = express.Router();
const db = require("../db"); // conexão mysql

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

  LEFT JOIN tb_status_motor s
  ON m.id_motor = s.fk_motor

  LEFT JOIN tb_status_temp t
  ON m.id_motor = t.fk_motor
  `;

  db.query(sql, (err, rows) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        message: "Erro ao buscar motores"
      });

    }

    const motores = rows.map((motor) => {

      console.log(
        "Motor:",
        motor.id_motor,
        "Temp:",
        motor.status_temperatura,
        "Vib:",
        motor.status_vibracao
      );

      let statusFinal = "ok";

      if (
          motor.status_vibracao === "erro" ||
          motor.status_temperatura === "erro"
      ) {
          statusFinal = "erro";
      }
      else if (
          motor.status_vibracao === "alerta" ||
          motor.status_temperatura === "alerta"
      ) {
          statusFinal = "alerta";
      }

      return {
        ...motor,

        status: statusFinal,

        status_vibracao: motor.status_vibracao,
        status_temperatura: motor.status_temperatura,

        valor_vibracao: motor.valor_vibracao,
        valor_temp: motor.valor_temp
    };

    });

    res.json(motores);

  });

});

router.post("/", (req, res) => {

  const { nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor, classe_isolamento,
  voltagem_nominal,
  corrente_nominal,
  fator_potencia,
  rendimento,

  espessura_carcaca,
  area_conducao,
  condutividade_metal,
  raio_interno_carcaca,
  raio_externo_estator,
  comprimento_estator } = req.body;

  const sql = `
    INSERT INTO tb_motores
    (nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor, classe_isolamento,
    voltagem_nominal,
    corrente_nominal,
    fator_potencia,
    rendimento,

    espessura_carcaca,
    area_conducao,
    condutividade_metal,
    raio_interno_carcaca,
    raio_externo_estator,
    comprimento_estator)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `;

  db.query(sql,
    [
    nome_motor,
    localizacao,
    numero_polos,
    rpm_nominal,
    potencia_motor,
    classe_isolamento,
    voltagem_nominal,
    corrente_nominal,
    fator_potencia,
    rendimento,
    espessura_carcaca,
    area_conducao,
    condutividade_metal,
    raio_interno_carcaca,
    raio_externo_estator,
    comprimento_estator
  ],
    (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          erro: "Erro ao cadastrar motor"
        });
      }

      res.json({
        mensagem: "Motor cadastrado com sucesso"
      });

    }
  );

});

router.put("/:id", (req, res) => {
  const { id } = req.params;

  const { nome_motor,
  localizacao,
  numero_polos,
  rpm_nominal,
  potencia_motor,
  classe_isolamento,
  voltagem_nominal,
  corrente_nominal,
  fator_potencia,
  rendimento,
  espessura_carcaca,
  area_conducao,
  condutividade_metal,
  raio_interno_carcaca,
  raio_externo_estator,
  comprimento_estator } = req.body;

  const sql = `
    UPDATE tb_motores 
    SET
    nome_motor = ?,
    localizacao = ?,
    numero_polos = ?,
    rpm_nominal = ?,
    potencia_motor = ?,
    classe_isolamento = ?,
    voltagem_nominal = ?,
    corrente_nominal = ?,
    fator_potencia = ?,
    rendimento = ?,
    espessura_carcaca = ?,
    area_conducao = ?,
    condutividade_metal = ?,
    raio_interno_carcaca = ?,
    raio_externo_estator = ?,
    comprimento_estator = ?
    WHERE id_motor = ?
  `;

  db.query(sql,
    [nome_motor,
    localizacao,
    numero_polos,
    rpm_nominal,
    potencia_motor,
    classe_isolamento,
    voltagem_nominal,
    corrente_nominal,
    fator_potencia,
    rendimento,
    espessura_carcaca,
    area_conducao,
    condutividade_metal,
    raio_interno_carcaca,
    raio_externo_estator,
    comprimento_estator,
    id],
    (err, result) => {

      if (err) {
        console.error(err);
        return res.status(500).json({
          erro: "Erro ao atualizar motor"
        });
      }

      res.json({ mensagem: "Motor atualizado com sucesso" });
    }
  );
});

router.delete("/:id", (req, res) => {
  const { id } = req.params;
  const sql = `
    DELETE FROM tb_motores
    WHERE id_motor = ?
  `;
  db.query(sql, [id], (err, result) => {
    if (err) {
      console.error(err);
      return res.status(500).json({
        erro: "Erro ao excluir motor"
      });

    }
    res.json({
      mensagem: "Motor excluído com sucesso"
    });
  });
});

module.exports = router;