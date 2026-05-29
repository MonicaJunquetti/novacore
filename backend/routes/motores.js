const express = require("express");
const router = express.Router();
const db = require("../db"); // conexão mysql

router.get("/", (req, res) => {

  const sql = `
    SELECT
        m.*,
        s.estado AS status,
        s.valor_vibracao,
        s.ultima_atualizacao

    FROM tb_motores m

    LEFT JOIN tb_status_motor s
    ON m.id_motor = s.fk_motor
  `;

  db.query(sql, (err, rows) => {

    if (err) {

      console.error(err);

      return res.status(500).json({
        message: "Erro ao buscar motores"
      });

    }

    res.json(rows);

  });

});

router.post("/", (req, res) => {

  const { nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor } = req.body;

  const sql = `
    INSERT INTO tb_motores
    (nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor)
    VALUES (?, ?, ?, ?, ?)
  `;

  db.query(sql,
    [nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor],
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

  const { nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor } = req.body;

  const sql = `
    UPDATE tb_motores 
    SET nome_motor = ?, localizacao = ?, numero_polos = ?, rpm_nominal = ?, potencia_motor = ?
    WHERE id_motor = ?
  `;

  db.query(sql,
    [nome_motor, localizacao, numero_polos, rpm_nominal, potencia_motor, id],
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