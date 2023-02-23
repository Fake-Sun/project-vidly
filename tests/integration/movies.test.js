const request = require('supertest');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
const { Movie } = require('../../models/movie');
const { Genre } = require('../../models/genre');


let server;

describe('/api/movies', () => {

    let movieId;
    let movie;
    let token;
    
    beforeEach(async () => {
        server = require('../../index');

        genreId = mongoose.Types.ObjectId();
        movieId = mongoose.Types.ObjectId();
        token = new User().generateAuthToken();
        title = '12345';
        genre = new Genre({ _id: genreId, name: '12345'});

        await genre.save();

        movie = new Movie();

    });

        
    afterEach(async () => { 
        await Movie.remove({});
        await Genre.remove({});
        await server.close();
    });
 
    const exec = () => {
        return request(server)
        .post('/api/movies')
        .set('x-auth-token', token)
        .send({
            title,
            dailyRentalRate: 2,
            genreId,
            numberInStock: 10
        });
    }

    it('should return 400 if an invalid title is sent', async () => {

        title = '12';

        const res = await exec();

        expect(res.status).toBe(400);
    });

    it('should return an equal movie object if input was valid', async () => {

        const res = await exec();

        expect(res.status).toBe(200);
    });
});