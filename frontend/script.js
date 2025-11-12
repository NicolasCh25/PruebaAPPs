const API_KEY = "2a93dae81163d6374aeb0495b9c17b16";
const API_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

// 🔹 Detecta si estás en Netlify o en local y usa la URL correcta
const BACKEND_URL = window.location.hostname.includes("netlify.app")
  ? "https://pruebaapps.onrender.com"
  : "http://localhost:3000";

const genreSelect = document.getElementById("genreSelect");
const moviesContainer = document.getElementById("movies");

// 🧩 Obtener géneros de películas
async function obtenerGeneros() {
  try {
    const res = await fetch(`${API_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
    const data = await res.json();

    genreSelect.innerHTML = '<option value="">-- Elige un género --</option>';

    data.genres.forEach(g => {
      const option = document.createElement("option");
      option.value = g.id;
      option.textContent = g.name;
      genreSelect.appendChild(option);
    });
  } catch (err) {
    console.error("Error obteniendo géneros", err);
  }
}

// 🎥 Obtener películas por género
async function obtenerPeliculasPorGenero(genreId) {
  if (!genreId) {
    moviesContainer.innerHTML = "<p>Selecciona un género para ver películas.</p>";
    return;
  }

  try {
    const res = await fetch(`${API_URL}/discover/movie?api_key=${API_KEY}&language=es-ES&with_genres=${genreId}`);
    const data = await res.json();
    mostrarPeliculas(data.results || []);
  } catch (err) {
    console.error("Error obteniendo películas", err);
  }
}

// 💾 Mostrar películas en pantalla
function mostrarPeliculas(peliculas) {
  moviesContainer.innerHTML = "";
  if (!peliculas.length) {
    moviesContainer.innerHTML = "<p>No hay películas para este género.</p>";
    return;
  }

  peliculas.forEach(p => {
    const div = document.createElement("div");
    div.classList.add("movie");
    div.innerHTML = `
      <img src="${p.poster_path ? IMG_PATH + p.poster_path : ''}" alt="${p.title}">
      <h3>${p.title}</h3>
      <button class="verMas">Ver más</button>
      <button class="favorito">⭐ Agregar a Favoritos</button>
    `;

    // 🔹 Ver más detalles
    div.querySelector(".verMas").addEventListener("click", () => {
      localStorage.setItem("movieId", p.id);
      window.location.href = "movie.html";
    });

    // 🔹 Agregar a favoritos (Render o local)
    div.querySelector(".favorito").addEventListener("click", async () => {
      try {
        const res = await fetch(`${BACKEND_URL}/api/favoritos`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: p.id,
            title: p.title,
            poster_path: p.poster_path
          })
        });

        if (!res.ok) throw new Error(`Error HTTP: ${res.status}`);

        const data = await res.json();
        mostrarToast(data.mensaje || "Película agregada a favoritos ✅");
      } catch (err) {
        console.error(err);
        mostrarToast("❌ Error al agregar a favoritos");
      }
    });

    moviesContainer.appendChild(div);
  });
}

// 🎨 Toast de notificación
function mostrarToast(mensaje) {
  const toast = document.createElement("div");
  toast.textContent = mensaje;
  toast.style.position = "fixed";
  toast.style.bottom = "20px";
  toast.style.left = "50%";
  toast.style.transform = "translateX(-50%)";
  toast.style.background = "#222";
  toast.style.color = "#fff";
  toast.style.padding = "10px 20px";
  toast.style.borderRadius = "10px";
  toast.style.opacity = "0.9";
  toast.style.zIndex = "1000";
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

// 🔹 Evento: cambiar de género
genreSelect.addEventListener("change", e => {
  obtenerPeliculasPorGenero(e.target.value);
});

// 🚀 Cargar géneros al inicio
obtenerGeneros();
