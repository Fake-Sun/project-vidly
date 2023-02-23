
const _ = require('lodash');
const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const {User} = require('../models/user');
const bcrypt = require('bcrypt');
const Joi = require('joi');
const validate = require('../middleware/validate');

router.get('/', async (req, res) => {
    res.send(await User.find().sort('name'));
});

router.post('/', validate(validateAuth), async (req, res) => {

    let user = await User.findOne({ email: req.body.email});
    if(!user) return res.status(400).send('Invalid email or password.');

    const validPassword = await bcrypt.compare(req.body.password, user.password);
    if(!validPassword) return res.status(400).send('Invalid email or password.');

    const token = user.generateAuthToken();
    res.send(token)
});

function validateAuth(req) {
    const schema = {
        email: Joi.string().min(5).max(255).required().email(),
        password: Joi.string().min(5).max(255).required()
    }
    return Joi.validate(req, schema);
};

module.exports = router;