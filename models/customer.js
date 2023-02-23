const mongoose = require('mongoose');
const Joi = require('joi');

const customerSchema = new mongoose.Schema({
    name: { type: String, 
            required: true,
            minlength: 3,
            maxlength: 50
        },
    isGold: {type: Boolean, default: false},
    phone: { type: String, 
            required: true,
            minlength: 3,
            maxlength: 50
        }
});

const Customer = mongoose.model('Customer', customerSchema);

function validateCustomer(customer) {
    const schema = {
        name: Joi.string().min(3).required(),
        phone: Joi.string().min(3).required(),
        isGold: Joi.boolean()
    }
    return Joi.validate(customer, schema);
}

exports.customerSchema = customerSchema;
exports.Customer = Customer;
exports.validateCustomer = validateCustomer;