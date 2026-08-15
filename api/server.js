import express from "express";
import cors from "cors";
import sequelize from "./database/database.js";
import Dizimista from "./models/Dizimista.js";
import dizimistaRoutes from "./routes/dizimistaRoutes.js";
import RegistroMensal from "./models/RegistroMensal.js";
import registroMensalRoutes from "./routes/registroMensalRoutes.js";


const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/dizimistas", dizimistaRoutes);
app.use("/api/registros", registroMensalRoutes);


app.get("/", (req, res) => {
  res.json({
    mensagem: "API do sistema de dízimo funcionando!",
  });
});

try {
  await sequelize.authenticate();

  console.log("Banco de dados conectado com sucesso!");

 await sequelize.sync({ alter: true });

  console.log("Tabelas sincronizadas com sucesso!");

  const PORT = process.env.PORT || 8080;

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
});
} catch (error) {
  console.error("Erro ao iniciar o servidor:");
  console.error(error);
}