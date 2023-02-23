const {Customer, validateCustomer} = require('../models/customer');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
    res.send(await Customer.find().sort('name'));
});

router.post('/', validate(validateCustomer), async (req, res) => {
    let { error } = validate(req.body);
    if (error) return res.status(400).send(error.details[0].message);

    const customer = new Customer({ 
        _id: req.body._id,
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone });
    await customer.save();
    res.send(customer);
});

router.put('/:id', validate(validateCustomer), async (req, res) => {
    
    const customer = await Customer.findByIdAndUpdate(req.params.id, { 
        name: req.body.name,
        phone: req.body.phone,
        isGold: req.body.isGold}, { new: true });

    if (!customer) return res.status(404).send('Ese cliente no existe en nuestra base de datos');
    res.send(customer);

});

router.delete('/:id', async (req, res) => {
    const customer = await Customer.findByIdAndRemove(req.params.id)
    if (!customer) return res.status(404).send('Ese cliente no existe en nuestra base de datos');
    res.send(customer);
});

router.get('/:id', async (req, res) => {
    const customer = await Customer.findById(req.body.id);
    if (!customer) return res.status(404).send('Ese cliente no existe en nuestra base de datos');
    res.send(customer.name);
});

module.exports = router;