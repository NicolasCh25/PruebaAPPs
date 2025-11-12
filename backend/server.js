const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(express.json());
app.use(cors()); // ✅ Permite peticiones desde Netlify o cualquier origen

// 📂 Ruta del archivo db.json 
const dataPath = path.join(__dirname, "db.json");

// ✅ Asegurar que db.json exista
if (!fs.existsSync(dataPath)) {
  fs.writeFileSync(dataPath, JSON.stringify({ favoritos: [] }, null, 2));
}

// 🟢 Obtener lista de favoritos
app.get("/api/favoritos", (req, res) => {
  try {
    const data = JSON.parse(fs.readFileSync(dataPath));
    res.json(data);
  } catch (err) {
    console.error("Error al leer db.json:", err);
    res.status(500).json({ mensaje: "Error al obtener favoritos" });
  }
});

// 🟢 Agregar película a favoritos
app.post("/api/favoritos", (req, res) => {
  try {
    const body = req.body;
    if (!body || !body.id) {
      return res.status(400).json({ mensaje: "Datos inválidos" });
    }

    const data = JSON.parse(fs.readFileSync(dataPath));

    // Evitar duplicados
    if (data.favoritos.some(fav => fav.id === body.id)) {
      return res.status(400).json({ mensaje: "Esa película ya está en favoritos" });
    }

    data.favoritos.push(body);
    fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
    res.json({ mensaje: "Película agregada a favoritos ✅" });
  } catch (err) {
    console.error("Error al guardar favorito:", err);
    res.status(500).json({ mensaje: "Error al guardar favorito" });
  }
});

// 🚀 Iniciar servidor
app.listen(PORT, () => {
  console.log(`✅ Servidor corriendo en http://localhost:${PORT}`);
});
