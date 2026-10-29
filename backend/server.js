const express = require("express");
const cors = require("cors");

const app = express();

app.use(cors());
app.use(express.json());

const usuariosRoutes = require("./routes/usuarios");
app.use("/usuarios", usuariosRoutes);

const motoresRoutes = require("./routes/motores");
app.use("/motores", motoresRoutes);

const sensoresRoutes = require("./routes/sensores");
app.use("/sensores", sensoresRoutes);

const sensorTempRoutes = require("./routes/sensor_temp");
app.use("/sensor_temp", sensorTempRoutes);

const alertasRoutes = require("./routes/alertas");
app.use("/alertas", alertasRoutes);

const motoresStatusRoutes = require("./routes/motores_status");
app.use("/motores_status", motoresStatusRoutes); // Corrigido prefixo duplicado

const dashboardsRoutes = require("./routes/dashboards");
app.use("/dashboards", dashboardsRoutes);

const chatRoutes = require("./routes/chat");
app.use("/chat", chatRoutes);

app.listen(3000, () => {
  console.log("Servidor rodando na porta 3000");
});
