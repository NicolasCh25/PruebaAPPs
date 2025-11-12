const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // ✅ Permite peticiones desde Netlify

// 📂 Ruta del archivo db.json
const dataPath = path.join(__dirname, "db.json");

// Endpoint GET: obtener favoritos
app.get("/api/favoritos", (req, res) => {
  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ favoritos: [] }, null, 2));
  }
  const data = fs.readFileSync(dataPath);
  res.json(JSON.parse(data));
});

// Endpoint POST: agregar a favoritos
app.post("/api/favoritos", (req, res) => {
  if (!req.body || !req.body.id) {
    return res.status(400).json({ mensaje: "Datos inválidos" });
  }

  if (!fs.existsSync(dataPath)) {
    fs.writeFileSync(dataPath, JSON.stringify({ favoritos: [] }, null, 2));
  }

  const data = JSON.parse(fs.readFileSync(dataPath));
  data.favoritos.push(req.body);
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));

  res.json({ mensaje: "Película agregada a favoritos ✅" });
});

// Iniciar servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
