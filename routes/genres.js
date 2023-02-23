const admin = require('../middleware/admin');
const auth = require('../middleware/auth');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {Genre, validateGenre} = require('../models/genre');
const validateObjectId = require('../middleware/validateObjectId');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
    let genres = await Genre.find().sort('name');
    res.send(genres);
}); 

router.post('/', [auth, validate(validateGenre)], async (req, res) => {
    const genre = new Genre({ name: req.body.name });
    await genre.save();
    res.send(genre);
});

router.put('/:id', [auth, validateObjectId, validate(validateGenre)], async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(req.params.id, { name: req.body.name }, { new: true });
    if (!genre) return res.status(404).send('Ese género no existe en nuestra base de datos');
    res.send(genre);
});

router.delete('/:id', [auth, admin, validateObjectId], async (req, res) => {
    const genre = await Genre.findByIdAndRemove(req.params.id)
    if (!genre) return res.status(404).send('Ese género no existe en nuestra base de datos');
    res.send(genre);
});

router.get('/:id', validateObjectId, async (req, res) => {
    const genre = await Genre.findById(req.params.id);
    if (!genre) return res.status(404).send('Ese género no existe en nuestra base de datos');
    res.send(genre);
});
 
module.exports = router;