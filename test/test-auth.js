'use strict';
require('dotenv').config();
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../user');
const {JWT_EXPIRY, TEST_DATABASE_URL} = require('../config');
const JWT_SECRET = 'fizzbangbuzzboom';

const expect = chai.expect;
chai.use(chaiHttp);

function generateUser(userPassword){
    const testUser = {
        username: faker.internet.userName(),
        password: userPassword, 
        firstName: faker.name.firstName,
        lastName: faker.name.lastName
    }
    return testUser;
}

describe('Authorization endpoints', function(){
    const username = 'mytestuser';
    const password = 'password123';
    const firstName = 'Test';
    const lastName = 'User';

    before(function(){
        return runServer(TEST_DATABASE_URL);
    })

    beforeEach(function(){
        return User.hashPassword(password)
        .then(password => {
            User.create({
                username,
                password,
                firstName,
                lastName
            })
        })
    })

    afterEach(function(){
        return User.remove({})
    })

    after(function(){
        return closeServer();
    })

    describe('/api/auth/login', function(){
        it('should reject request with no credentials', function(){
            return chai.request(app)
            .post('/api/auth/login')
            .send()
            .then(res => {
                expect(res).to.have.status(400);
            })
        })
        
        // it should reject incorrect username
        it('should reject request with incorrect or nonexistent username', function(){
            return chai.request(app)
            .post('/api/auth/login')
            .send({username: 'notRealUser', password})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(401);
            })
        })

        //it should reject incorrect password
        it('should reject login with incorrect password', function(){
            return chai.request(app)
            .post('/api/auth/login')
            .send({username, password: 'wrongpassword'})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(401);
            })
        })
        //it should return valid auth token
        it('should return a valid auth token with correct credential input', function(){
            return chai.request(app)
            .post('/api/auth/login')
            .send({username, password})
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.an('object');
                expect(res.body).to.have.keys('authToken');
                const authToken = res.body.authToken;
                expect(authToken).to.be.a('string');
                const payload = jwt.verify(authToken, JWT_SECRET, {
                    algorithm: ['HS256']
                });
                expect(payload.user).to.deep.equal({
                    username,
                    firstName,
                    lastName
                })
            })
        })

    })

    describe('/refresh endpoint', function(){

        it('should reject refresh request with no credentials/token', function(){
            return chai.request(app)
            .post('/api/auth/refresh')
            .then(res => {
                expect(res).to.have.status(401);
            })
        })
        //it should reject invalid token
        it('should reject invalid credentials', function(){
            const authToken = jwt.sign(
                {
                    user: {
                        username,
                        firstName,
                        lastName
                    }
                },
                'wrongJwtSecret',
                {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: JWT_EXPIRY
                }
            );
            return chai.request(app)
            .post('/api/auth/refresh')
            .set('authorizations', `Bearer ${authToken}`)
            .then(res => {
                expect(res).to.have.status(401);
            })
        })
        //it should respond with a new valid token 
        it('should create a new token with a new expiry date', function(){
            const authToken = jwt.sign(
                {
                    user: {
                        username,
                        firstName,
                        lastName
                    }
                },
                JWT_SECRET,
                {
                    algorithm: 'HS256',
                    subject: username,
                    expiresIn: JWT_EXPIRY
                }
            );
            const decoded = jwt.decode(authToken);
            return chai.request(app)
            .post('/api/auth/refresh')
            .set('authorization', `Bearer ${authToken}`)
            .then(res => {
                expect(res).to.have.status(200);
                expect(res.body).to.be.a('object');
                const token = res.body.authToken;
                expect(token).to.be.a('string');
                const payload = jwt.verify(token, JWT_SECRET, {
                    algorithm: ['HS256']
                });
                expect(payload.user).to.have.keys( `username`, `firstName`, `lastName`);
                expect(payload.exp).to.be.at.least(decoded.exp);
            })
        })
    })
})
