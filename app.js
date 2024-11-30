const express = require('express')
const {open} = require('sqlite')
const sqlite3 = require('sqlite3')
const path = require('path')

const app = express()
app.use(express.json())

const dbpath = path.join(__dirname, 'moviesData.db')
let db = null

const instalizeDBAndServer = async () => {
  try {
    database = await open({
      filename: dbpath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('server is running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

instalizeDBAndServer()

const convertDBObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
    directorName: dbObject.director_name,
  }
}

// API 1 Get all movie names

app.get('/movies/', async (request, response) => {
  const getMoviesQuery = `
    select movie_name from movie;`
  const moviesArray = await database.all(getMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => convertDBObjectToResponseObject(eachMovie)),
  )
})

// API 2 POST add new movie

app.post('/movies/', async (request, response) => {
  const {directorId, movieName, leadActor} = request.body
  const postMovieQuery = `
  insert into 
  movie(director_id, movie_name, lead_actor)
  values
  ('${directorId}', '${movieName}', '${leadActor}');`
  const dbresponse = await database.run(postMovieQuery)
  response.send('Movie Successfully Added')
})

// API 3 Get a movie

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getMovieQuery = `
  select * from movie where movie_id = ${movieId};`
  const movie = await database.get(getMovieQuery)
  response.send(convertDBObjectToResponseObject(movie))
})

// API 4 update movie details

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const {directorId, movieName, leadActor} = request.body
  const updateMovieQuery = `
  update 
    movie
  set 
    director_id = ${directorId},
    movie_name = '${movieName}',
    lead_actor = '${leadActor}'
  where 
    movie_id = ${movieId};`
  await database.run(updateMovieQuery)
  response.send('Movie Details Updated')
})

// API 5 delete movie

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deleteMovie = `
  delete from movie where movie_id = ${movieId};`
  await database.run(deleteMovie)
  response.send('Movie Removed')
})

// API 6 get director

app.get('/directors/', async (request, response) => {
  const getDirectorsQuery = `
    select * from director;`
  const directorArray = await database.all(getDirectorsQuery)
  response.send(
    directorArray.map(eachMovie => convertDBObjectToResponseObject(eachMovie)),
  )
})

// API 7 get all movie directed by a specific director

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getDirectorMoviesQuery = `
    SELECT
      movie_name
    FROM
      movie
    WHERE
      director_id='${directorId}';`
  const moviesArray = await database.all(getDirectorMoviesQuery)
  response.send(
    moviesArray.map(eachMovie => ({movieName: eachMovie.movie_name})),
  ) 
})

module.exports = app
