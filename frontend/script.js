const API_KEY = "2a93dae81163d6374aeb0495b9c17b16";
const API_URL = "https://api.themoviedb.org/3";
const IMG_PATH = "https://image.tmdb.org/t/p/w500";

const genreSelect = document.getElementById("genreSelect");
const moviesContainer = document.getElementById("movies");

// Obtener géneros
async function obtenerGeneros() {
  try {
    const res = await fetch(`${API_URL}/genre/movie/list?api_key=${API_KEY}&language=es-ES`);
    const data = await res.json();
    // Añadir opción por defecto
    const defaultOpt = document.createElement("option");
    defaultOpt.value = "";
    defaultOpt.textContent = "-- Elige un género --";
    genreSelect.appendChild(defaultOpt);

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

// Obtener películas por género
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

    // Ver más detalles
    div.querySelector(".verMas").addEventListener("click", () => {
      localStorage.setItem("movieId", p.id);
      window.location.href = "movie.html";
    });

    // Agregar a favoritos (API privada)
    div.querySelector(".favorito").addEventListener("click", async () => {
      try {
        const res = await fetch("/api/favoritos", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: p.id,
            title: p.title,
            poster_path: p.poster_path
          })
        });
        const data = await res.json();
        alert(data.message || data.mensaje || "Operación completada");
      } catch (err) {
        console.error(err);
        alert("Error al agregar a favoritos");
      }
    });

    moviesContainer.appendChild(div);
  });
}

// Evento: cambiar de género
genreSelect.addEventListener("change", e => {
  obtenerPeliculasPorGenero(e.target.value);
});

// Cargar géneros al inicio
obtenerGeneros();
