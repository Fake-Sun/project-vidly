const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Genre } = require('../models/genre');
const {Movie, validateMovie} = require('../models/movie');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
    res.send(await Movie.find().sort('name'));
});

router.post('/', validate(validateMovie), async (req, res) => {

    let genre = await Genre.findById(req.body.genreId);
    if(!genre) return res.status(400).send('Género inválido');

    const movie = new Movie({ 
        title: req.body.title,
        genre: {
            _id: genre._id,
            name: genre.name
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate
     });
     
    await movie.save();
    res.send(movie);
});

router.put('/:id', validate(validateMovie), async (req, res) => {
    
    const movie = await Movie.findByIdAndUpdate(req.params.id, { name: req.body.name}, { new: true });

    if (!movie) return res.status(404).send('Esa película no existe en nuestra base de datos');
    res.send(movie);

});

router.delete('/:id', async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id)
    if (!movie) return res.status(404).send('Esa película no existe en nuestra base de datos');
    res.send(movie);
});

router.get('/:id', async (req, res) => {
    const movie = await Movie.findById(req.body.id);
    if (!movie) return res.status(404).send('Esa película no existe en nuestra base de datos');
    res.send(movie.name);
});

module.exports = router;