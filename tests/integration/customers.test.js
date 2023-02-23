const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
const { Customer } = require('../../models/customer');

let server;

describe('/api/customers', () => {

    let customerId;
    let customer;
    let token;
    
    beforeEach(async () => {
        server = require('../../index');

        customerId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();


        customer = new Customer({
                _id: customerId,
                name: '12345',
                phone: '12345'
            });
    });

        
    afterEach(async () => { 
        await Customer.remove({});
        await server.close();
    });

    const exec = () => {
        return request(server)
        .post('/api/customers')
        .set('x-auth-token', token)
        .send({ name: customer.name, phone: customer.phone });
    }

    it('should return 400 if an invalid name is sent', async () => {

        customer.name = '12';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return an equal customer object if input was valid', async () => {

        const res = await exec();

        expect(res.body.name).toMatch(customer.name);
    });
});