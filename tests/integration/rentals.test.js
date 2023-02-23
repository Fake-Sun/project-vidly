const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');
const { Customer } = require('../../models/customer');


let server;

describe('/api/rentals', () => {

    let movieId;
    let movie;
    let token;
    
    beforeEach(async () => {
        server = require('../../index');

        movieId = mongoose.Types.ObjectId();
        customerId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();
        name = '12345';

        movie = new Movie({
            _id: movieId,
            title: '12345',
            dailyRentalRate: 2,
            genre: { name: '12345'},
            numberInStock: 10
        });
        customer = new Customer({
            _id: customerId,
            name,
            phone: '12345'
        });

        await movie.save();
        await customer.save();

    });

        
    afterEach(async () => { 
        await Customer.remove({});
        await Movie.remove({});
        await server.close();
    });
 
    const exec = () => {
        return request(server)
        .post('/api/rentals')
        .set('x-auth-token', token)
        .send({ customerId, movieId });
    }

    it('should return 400 if an invalid movieId is sent', async () => {

        movieId = '';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return an equal customer object if input was valid', async () => {

        const res = await exec();

        expect(res.status).toBe(200);
    });
});