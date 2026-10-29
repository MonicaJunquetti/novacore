const express = require("express");
const router = express.Router();
const db = require("../db");

// 1. LISTAR DASHBOARDS DE UM USUÁRIO (Gestor, Usuário ou Monitorador)
router.get("/usuario/:idUsuario", (req, res) => {
  const { idUsuario } = req.params;

  const sql = `
    SELECT 
      d.id_dashboard, 
      d.nome_dashboard, 
      d.descricao,
      CASE 
        WHEN d.fk_gestor = ? THEN 'gestor'
        ELSE COALESCE(p.nivel_acesso, 'monitorador')
      END AS nivel_acesso
    FROM tb_dashboards d
    LEFT JOIN tb_dashboard_permissoes p 
      ON d.id_dashboard = p.fk_dashboard AND p.fk_usuario = ?
    WHERE d.fk_gestor = ? OR p.fk_usuario = ?
  `;

  db.query(sql, [idUsuario, idUsuario, idUsuario, idUsuario], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar dashboards do usuário:", err);
      return res.status(500).json({ erro: "Erro ao buscar dashboards" });
    }
    res.json(rows);
  });
});

// 2. CRIAR UM NOVO DASHBOARD / PLANTA (Atribui 'gestor' ao criador)
router.post("/", (req, res) => {
  const { nome_dashboard, descricao, fk_gestor } = req.body;

  if (!nome_dashboard || !fk_gestor) {
    return res.status(400).json({ message: "Nome do dashboard e ID do gestor são obrigatórios." });
  }

  const sql = `
    INSERT INTO tb_dashboards (nome_dashboard, descricao, fk_gestor)
    VALUES (?, ?, ?)
  `;

  db.query(sql, [nome_dashboard, descricao, fk_gestor], (err, result) => {
    if (err) {
      console.error("Erro ao criar dashboard:", err);
      return res.status(500).json({ erro: "Erro ao criar dashboard" });
    }

    const idDashboard = result.insertId;

    // Registra o criador como GESTOR na tabela de permissões
    const sqlPermissao = `
      INSERT INTO tb_dashboard_permissoes (fk_dashboard, fk_usuario, nivel_acesso)
      VALUES (?, ?, 'gestor')
      ON DUPLICATE KEY UPDATE nivel_acesso = 'gestor'
    `;

    db.query(sqlPermissao, [idDashboard, fk_gestor], (errPerm) => {
      if (errPerm) {
        console.error("Erro ao registrar permissão automática do gestor:", errPerm);
      }

      res.json({
        message: "Dashboard criado com sucesso!",
        id_dashboard: idDashboard,
      });
    });
  });
});

// 3. LISTAR MEMBROS COM ACESSO A UM DASHBOARD ESPECÍFICO (Incluindo o Gestor principal)
router.get("/:idDashboard/membros", (req, res) => {
  const { idDashboard } = req.params;

  const sql = `
    SELECT u.id_usuario, u.nome_usuario as nome, u.email_usuario as email, 
           COALESCE(p.nivel_acesso, 'gestor') as nivel_acesso
    FROM tb_dashboards d
    INNER JOIN tb_usuarios u ON u.id_usuario = d.fk_gestor OR u.id_usuario IN (
      SELECT fk_usuario FROM tb_dashboard_permissoes WHERE fk_dashboard = ?
    )
    LEFT JOIN tb_dashboard_permissoes p ON p.fk_dashboard = d.id_dashboard AND p.fk_usuario = u.id_usuario
    WHERE d.id_dashboard = ?
  `;

  db.query(sql, [idDashboard, idDashboard], (err, rows) => {
    if (err) {
      console.error("Erro ao buscar membros:", err);
      return res.status(500).json({ erro: "Erro ao buscar membros" });
    }
    res.json(rows);
  });
});

// 4. ADICIONAR NOVO MEMBRO POR E-MAIL
router.post("/:idDashboard/membros", (req, res) => {
  const { idDashboard } = req.params;
  const { email, nivel_acesso } = req.body;

  if (!email) {
    return res.status(400).json({ erro: "Informe o e-mail do usuário." });
  }

  // Localiza o ID do usuário através do e-mail digitado
  db.query("SELECT id_usuario FROM tb_usuarios WHERE email_usuario = ?", [email], (err, users) => {
    if (err || users.length === 0) {
      return res.status(404).json({ erro: "Usuário não encontrado com este e-mail." });
    }

    const idUsuarioConvidado = users[0].id_usuario;
    const nivelFinal = nivel_acesso || "usuario";

    const sqlInsert = `
      INSERT INTO tb_dashboard_permissoes (fk_dashboard, fk_usuario, nivel_acesso)
      VALUES (?, ?, ?)
      ON DUPLICATE KEY UPDATE nivel_acesso = VALUES(nivel_acesso)
    `;

    db.query(sqlInsert, [idDashboard, idUsuarioConvidado, nivelFinal], (errIns) => {
      if (errIns) {
        console.error("Erro ao dar acesso ao membro:", errIns);
        return res.status(500).json({ erro: "Erro ao conceder acesso ao usuário." });
      }

      res.json({ mensagem: "Acesso concedido com sucesso!" });
    });
  });
});

// 5. ATUALIZAR NÍVEL DE ACESSO DO USUÁRIO NO DASHBOARD
router.put("/:idDashboard/permissoes/:idUsuarioAlvo", (req, res) => {
  const { idDashboard, idUsuarioAlvo } = req.params;
  const { idUsuarioLogado, nivel_acesso } = req.body;

  if (Number(idUsuarioLogado) === Number(idUsuarioAlvo)) {
    return res.status(403).json({ erro: "Você não pode alterar seu próprio nível de acesso." });
  }

  const niveisValidos = ["gestor", "usuario", "monitorador"];
  if (!niveisValidos.includes(nivel_acesso)) {
    return res.status(400).json({ erro: "Nível de acesso inválido." });
  }

  const sql = `
    INSERT INTO tb_dashboard_permissoes (fk_dashboard, fk_usuario, nivel_acesso)
    VALUES (?, ?, ?)
    ON DUPLICATE KEY UPDATE nivel_acesso = VALUES(nivel_acesso)
  `;

  db.query(sql, [idDashboard, idUsuarioAlvo, nivel_acesso], (err) => {
    if (err) return res.status(500).json({ erro: "Erro ao atualizar nível de acesso." });
    res.json({ mensagem: "Nível de acesso atualizado com sucesso!" });
  });
});

// 6. REMOVER USUÁRIO DO QUADRO OU SAIR DA PLANTA
router.delete("/:idDashboard/membros/:idUsuarioRemover", (req, res) => {
  const { idDashboard, idUsuarioRemover } = req.params;
  const { idUsuarioLogado, novoDonoId } = req.body;

  db.query("SELECT fk_gestor FROM tb_dashboards WHERE id_dashboard = ?", [idDashboard], (err, rows) => {
    if (err || rows.length === 0) return res.status(404).json({ erro: "Dashboard não encontrado." });

    const donoId = rows[0].fk_gestor;

    if (Number(donoId) === Number(idUsuarioRemover)) {
      if (!novoDonoId) {
        return res.status(400).json({
          erro: "O Gestor deve obrigatoriamente transferir a gestão para outro usuário antes de sair."
        });
      }

      db.query("UPDATE tb_dashboards SET fk_gestor = ? WHERE id_dashboard = ?", [novoDonoId, idDashboard], (errTransf) => {
        if (errTransf) return res.status(500).json({ erro: "Erro ao transferir gestão." });

        db.query(
          "UPDATE tb_dashboard_permissoes SET nivel_acesso = 'gestor' WHERE fk_dashboard = ? AND fk_usuario = ?",
          [idDashboard, novoDonoId]
        );

        db.query("DELETE FROM tb_dashboard_permissoes WHERE fk_dashboard = ? AND fk_usuario = ?", [idDashboard, idUsuarioRemover], (errDel) => {
          if (errDel) return res.status(500).json({ erro: "Erro ao remover do quadro." });
          return res.json({ mensagem: "Gestão transferida e usuário removido com sucesso!" });
        });
      });
      return;
    }

    db.query("DELETE FROM tb_dashboard_permissoes WHERE fk_dashboard = ? AND fk_usuario = ?", [idDashboard, idUsuarioRemover], (errDel) => {
      if (errDel) return res.status(500).json({ erro: "Erro ao remover usuário." });
      res.json({ mensagem: "Usuário removido do quadro com sucesso!" });
    });
  });
});

module.exports = router;