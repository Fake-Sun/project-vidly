const request = require('supertest');
const {Genre} = require('../../models/genre');
const mongoose = require('mongoose');
const { User } = require('../../models/user');
let server;

describe('/api/genres', () => {

    beforeEach(() => { server = require('../../index'); });
    
    afterEach(async () => { 
        await Genre.remove({});
        await server.close();
    });

    describe('GET /', () => {

        it('should return all genres', async () => {
            await Genre.collection.insertMany([
                { name: 'genre1' },
                { name: 'genre2' }
            ]);
            const res = await request(server).get('/api/genres');
            expect(res.status).toBe(200);
            expect(res.body.length).toBe(2);
            expect(res.body.some(g => g.name === 'genre1')).toBeTruthy();
            expect(res.body.some(g => g.name === 'genre2')).toBeTruthy();
        });
    });
    describe('GET /:id', () => {

        it('should return genre if valid id is passed', async () => {
            const genre = new Genre({ name: 'genre1' });
            await genre.save();

            const res = await request(server).get(`/api/genres/${genre._id}`);
            expect(res.status).toBe(200);
            expect(res.body).toHaveProperty('name', genre.name);
        });

        it('should return 404 if invalid id is passed', async () => {
            const res = await request(server).get(`/api/genres/1`);
            expect(res.status).toBe(404);
        });

        it('should return 404 if no genre with the given id exists', async () => {
            const id = mongoose.Types.ObjectId();
            const res = await request(server).get(`/api/genres/${id}`);
            expect(res.status).toBe(404);
        });
    });
    
    describe('POST /', () => {

        // Define the happy path, and then in each test, we change
        // one parameter that clearly aligns with the name of the test.

        let token;
        let name;

        const exec = () => {
            return request(server)
                .post('/api/genres')
                .set('x-auth-token', token)
                .send({ name }); // En ES6 se puede hacer solo {name} si el valor tiene el mismo nombre que la key
        }

        beforeEach(() => {
            token = new User().generateAuthToken();
            name = 'genre1';
        });

        it('should return 401 if client is not logged in', async () => {
            token = '';

            const res = await exec();

            expect(res.status).toBe(401);
        });

        it('should return 400 if genre is less than 5 characters', async () => {
            name = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {
            name = new Array(52).join('a');

            const res = await exec();
             
            expect(res.status).toBe(400);
        });

        it('should save the genre if it is valid', async () => {
            await exec();

            const genre = Genre.find({ name: 'genre1'})

            expect(genre).not.toBeNull();
        });

        it('should return the genre if it is valid', async () => {
            
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });
    });

    describe('DELETE /:id', () => {

        let token;
        let id;
        let genre;

        beforeEach(async () => {
            
            genre = new Genre({ name: 'genre1' })
            await genre.save();

            token = new User({isAdmin: true}).generateAuthToken();
            id = genre._id;
        });

        const exec = () => {
            return request(server)
            .delete(`/api/genres/${id}`)
            .set('x-auth-token', token);
        }

        it('should return 401 if client is not logged in', async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);

        });

        it('should return 403 if user is not admin', async () => {
            token = new User({ isAdmin: false }).generateAuthToken();

            const res = await exec();

            expect(res.status).toBe(403);
        });
        
        it('should return 404 if id is invalid', async () => {

            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if a genre with the id given doesn\'t exist.', async () => {

            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });


        it('should delete a genre if id and token are valid', async () => {
            
            await exec();

            let genreInDB = await Genre.findById(id);

            expect(genreInDB).toBeNull();
        });

        it('should return the deleted genre', async () => {
            
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', 'genre1');
        });

    });

    describe('PUT /:id', () => {

        let token;
        let id;
        let genre;
        let newName;

        beforeEach(async () => {
            
            genre = new Genre({ name: 'genre1' })
            await genre.save();

            token = new User({isAdmin: true}).generateAuthToken();
            id = genre._id;
            newName = 'updatedName';
        });

        const exec = () => {
            return request(server)
            .put(`/api/genres/${id}`, `name: ${newName}`)
            .set('x-auth-token', token)
            .send({ name: newName });
        }

        it('should return 401 if client is not logged in', async () => {
            token = '';
            
            const res = await exec();

            expect(res.status).toBe(401);

        });

        it('should return 400 if genre is less than 5 characters', async () => {

            newName = '1234';

            const res = await exec();

            expect(res.status).toBe(400);
        });

        it('should return 400 if genre is more than 50 characters', async () => {

            newName = new Array(52).join('a');

            const res = await exec();

            expect(res.status).toBe(400);
        });
        
        it('should return 404 if id is invalid', async () => {

            id = 1;

            const res = await exec();

            expect(res.status).toBe(404);
        });

        it('should return 404 if a genre with the id given doesn\'t exist.', async () => {

            id = mongoose.Types.ObjectId();

            const res = await exec();

            expect(res.status).toBe(404);
        });


        it('should update genre if id and token are valid', async () => {
            await exec();

            let updatedGenre = await Genre.findById(id);

            expect(updatedGenre.name).toBe(newName);
        });

        it('should return the updated genre', async () => {
            
            const res = await exec();

            expect(res.body).toHaveProperty('_id');
            expect(res.body).toHaveProperty('name', newName);
        });
    });
});