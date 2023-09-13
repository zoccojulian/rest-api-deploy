const express = require('express');
const crypto = require('node:crypto');
const movies = require('./movies.json');
const cors = require('cors');
const { validationMovie, validatePartialMovie } = require('./schemas/movies');

const app = express();

//Midlewares
app.use(express.json());
app.disable('x-powered-by');

//Midleware para solucionar problemas de CORS
app.use(cors({
    origin: (origin, callback) => {
        const ACCEPTED_ORIGINS = [
            'http://127.0.0.1:5500'
        ];

        if(ACCEPTED_ORIGINS.includes(origin) || !origin){
            return callback(null, true);
        }

        return callback(new Error('Not allowed by CORS'));
    }
}));




//Todos los recursos que sean MOVIES se indentifican con /movies
app.get('/movies', (req, res) => {

    //Recupero el origen para ver si esta habilitado y agregarlo en la cabecera y evitar CORS
    // const origin = req.header('origin');
    //chequeo que el origen este en los permitidos. Se pone !origin también porque si esta dentro del mismo servidor, el navegador no manda en el header el origin
    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', origin);
    // }

    const { genre } = req.query;

    if (genre) {
        const filteredMovies = movies.filter(
            movie => movie.genre.some(g => g.toLocaleLowerCase() === genre.toLocaleLowerCase())
        );
        return res.json(filteredMovies);
    }

    res.json(movies);
})

app.get('/movies/:id', (req, res) => { //path-to-regexp
    const { id } = req.params;
    const movie = movies.find(movie => movie.id === id);
    if (movie) return res.json(movie)

    res.status(404).json({ message: 'Movie not found' });
})

app.post('/movies', (req, res) => {
    const result = validationMovie(req.body);

    if (result.error) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const newMovie = {
        id: crypto.randomUUID(),
        ...result.data
    };

    movies.push(newMovie);

    res.status(201).json(newMovie);
});

app.delete('/movies/:id', (req, res) => {

    //Recupero el origen para ver si esta habilitado y agregarlo en la cabecera y evitar CORS
    // const origin = req.header('origin');
    //chequeo que el origen este en los permitidos. Se pone !origin también porque si esta dentro del mismo servidor, el navegador no manda en el header el origin
    // if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
    //     res.header('Access-Control-Allow-Origin', origin);
    // }

    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex < 0) {
        return res.status(404).json({ message: 'Movie not found' });
    };

    movies.splice(movieIndex, 1);

    return res.json({ message: 'Movie deleted' });
})

app.patch('/movies/:id', (req, res) => {
    const result = validatePartialMovie(req.body);

    if (!result.success) {
        return res.status(400).json({ error: JSON.parse(result.error.message) });
    }

    const { id } = req.params;
    const movieIndex = movies.findIndex(movie => movie.id === id);

    if (movieIndex < 0) {
        return res.status(404).json({ messaje: 'Movie not found' });
    }


    const updateMovie = {
        ...movies[movieIndex],
        ...result.data
    };

    movies[movieIndex] = updateMovie;

    return res.json(updateMovie);
});


//cors pre-Flight
//Req con PUT, PATCH, POST Y DELETE, requiere una peticion especial que se llama OPTIONS
//El verbo OPTIONS le pregunta a la API que acciones esta ahabilitado para realizar es url
// app.options('/movies/:id', (req, res) => {
//     //Recupero el origen para ver si esta habilitado y agregarlo en la cabecera y evitar CORS
//     const origin = req.header('origin');
//     //chequeo que el origen este en los permitidos. Se pone !origin también porque si esta dentro del mismo servidor, el navegador no manda en el header el origin
//     if (ACCEPTED_ORIGINS.includes(origin) || !origin) {
//         res.header('Access-Control-Allow-Origin', origin);
//         res.header('Access-Control-Allow-Methods', 'GET, POST, PATCH, DELETE');
//     }
//     res.send(200);
// })

const PORT = process.env.PORT ?? 1234;

app.listen(PORT, () => {
    console.log(`server listening on port http://localhost:${PORT}`);
})