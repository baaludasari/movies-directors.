const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());
const dbPath = path.join(__dirname, "moviesData.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3001, () => {
      console.log("Server running at http://localhost:3001/");
    });
  } catch (e) {
    console.log(`DB Error : ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

//GET all API

app.get("/movies/", async (request, response) => {
  const getMoviesQuery = `
        SELECT movie_name FROM movie
        ORDER BY movie_id;
    `;
  const movieArray = await db.all(getMoviesQuery);
  response.send(movieArray);
});

//POST movie API

app.post("/movies/", async (request, response) => {
  const convert = (dbObject) => {
    return {
      movieId: dbObject.movie_id,
      directorId: dbObject.director_id,
      movieName: dbObject.movie_name,
      leadActor: dbObject.lead_actor,
    };
  };
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const addMovieQuery = `
        INSERT INTO 
            movie (director_id, movie_name, lead_actor)
        VALUES
            (
                ${directorId},
                '${movieName}',
                '${leadActor}'
            )
    `;
  const dbResponse = await db.run(addMovieQuery);
  const movieId = dbResponse.lastID;
  response.send("Movie Successfully Added");
});

//GET single movie API

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const getMovieQuery = `
        SELECT * 
        FROM movie
        WHERE 
            movie_id = ${movieId};
    `;
  const movie = await db.get(getMovieQuery);
  response.send(movie);
});

//PUT movie API

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieDetails = request.body;
  const { directorId, movieName, leadActor } = movieDetails;
  const updateMovie = `
        UPDATE movie
        SET 
            director_id = ${directorId},
            movie_name = '${movieName}',
            lead_actor = '${leadActor}'
        WHERE 
            movie_id = ${movieId};
    `;
  const updateSet = await db.run(updateMovie);
  response.send("Movie Details Updated");
});

//DELETE movie API

app.delete("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `
        DELETE FROM movie
        WHERE movie_id = ${movieId};
    `;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//GET all directors API

app.get("/directors/", async (request, response) => {
  const getDirectorQuery = `
        SELECT * FROM director
        ORDER BY director_id;
    `;
  const directorArray = await db.all(getDirectorQuery);
  response.send(directorArray);
});

//GET dir_mov API

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMovieName = `
        SELECT movie_name FROM movie
        WHERE director_id = ${directorId};
    `;
  const movie = await db.all(getMovieName);
  response.send(movie);
});

module.exports = app;
