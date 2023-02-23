const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { Movie } = require('../models/movie');
const { Customer } = require('../models/customer');
const {Rental, validateRental} = require('../models/rental');
const validate = require('../middleware/validate');
//const Fawn = require('fawn');

//Fawn.init(mongoose);

router.get('/', async (req, res) => {
    res.send(await Rental.find().sort('name'));
});

router.post('/', validate(validateRental), async (req, res) => {

    let movie = await Movie.findById(req.body.movieId);
    if(!movie) return res.status(400).send('Película inválida');

    let customer = await Customer.findById(req.body.customerId);
    if(!customer) return res.status(400).send('Cliente inválido');


    let rental = new Rental({ 
        customer: {
            _id: customer._id,
            name: customer.name,
            isGold: customer.isGold,
            phone: customer.phone
        },
        movie: {
            _id: movie._id,
            genre: {
                _id: movie.genre._id,
                name: movie.genre.name
            },
            title: movie.title,
            dailyRentalRate: movie.dailyRentalRate
        }
    });
     
    try {
        // new Fawn.Task()
        //     .save('rentals', rental)
        //     .update('movies', { _id: movie._id}, {
        //         $inc: { numberInStock: -1 }
        //     })
        //     .run();
    
    

    await rental.save();
    await Movie.findOneAndUpdate(
        { _id: movie._id },
        { $inc: { numberInStock: -1 } }
    );

    res.send(rental);
    } catch (error) {
        res.status(500).send('Something failed.');
    }
    
});

router.put('/:id', async (req, res) => {
    let { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);
    
    const rental = await Rental.findByIdAndUpdate(req.params.id, { 
        customer: {
            _id: customer._id,
            name: customer.name,
        isGold: customer.isGold,
        phone: customer.phone
        },
        movie: {
            _id: movie._id,
            title: movie.title,
            numberInStock: movie.numberInStock,
            dailyRentalRate: movie.dailyRentalRate
        }
    }, { new: true});

    if (!rental) return res.status(404).send('Ese alquiler no existe en nuestra base de datos');
    
    res.send(rental);

});

router.delete('/:id', async (req, res) => {
    const rental = await Movie.findByIdAndRemove(req.params.id)
    if (!rental) return res.status(404).send('Ese alquiler no existe en nuestra base de datos');
    res.send(rental);
});

router.get('/:id', async (req, res) => {
    const rental = await Rental.findById(req.body.id);
    if (!rental) return res.status(404).send('Ese alquiler no existe en nuestra base de datos');
    res.send(rental);
});

module.exports = router;