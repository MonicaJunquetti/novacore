const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const usuariosRoutes = require("./routes/usuarios");
app.use("/usuarios", usuariosRoutes);

const motoresRoutes = require("./routes/motores");
app.use("/motores", motoresRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});