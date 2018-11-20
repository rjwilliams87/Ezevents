'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const mongoose = require('mongoose');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../user');
const {TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
const should = chai.should;
chai.use(chaiHttp);

function seedUserData(){
    console.warn(`seeding database`);
    const usersList = [];
    for (let i =1; i <= 10; i++){
        usersList.push(generateUser());
    }
    return usersList;
}

function generateUser(){
    const unhashedPassword = 'hellogoverna';
    const hashedPassword = User.hashPassword(unhashedPassword);
    const testUser = {
        username: faker.internet.userName(),
        password: hashedPassword,
        firstName: faker.name.firstName(),
        lastName: faker.name.lastName(),
    }
    return testUser;
}

function tearDownDb(){
    console.warn(`deleting database`);
    return mongoose.connection.dropDatabase();
}

describe('/api/users', function(){

    const username = 'user';
    const password = 'blahblah';
    const firstName = 'Luke';
    const lastName = 'Skywalker';

    before(function(){
        return runServer(TEST_DATABASE_URL);
    })
    beforeEach(function(){
        return seedUserData();
    })
    afterEach(function(){
        return tearDownDb();
    })
    after(function(){
        return closeServer();
    })

    describe('GET req', function(){
        it('should return all users', function(){
            let res;
            return chai.request(app)
            .get('/api/users')
            .then((_res)=>{
                res = _res;
                expect(res).to.have.status(200);
            })
        })
    })

    describe('POST req', function(){
        it('should create new user when proper credentials are input', function(){

            return chai.request(app)
            .post('/api/users')
            .send({username, password, firstName, lastName})
            .then((res)=>{
                expect(res).to.have.status(201);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('username', 'firstName', 'lastName');
                expect(res.body.username).to.equal(username);
                expect(res.body.firstName).to.equal(firstName);
                expect(res.body.lastName).to.equal(lastName);

                return User.findOne({username: res.body.username})
            }).then((user)=>{
                expect(user).to.not.be.null;
                expect(user.username).to.equal(username);
                expect(user.firstName).to.equal(firstName);
                expect(user.lastName).to.equal(lastName);
                return user.validatePassword('blahblah');
            }).then((isValid)=>{
                expect(isValid).to.be.true;
            })
        });
        
        it('should reject if missing username', function(){
            return chai.request(app)
            .post('/api/users')
            .send({password, firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Missing field');
                expect(res.body.location).to.equal('username');
            })
        });
        
        
        it('should reject if missing password', function(){
            return chai.request(app)
            .post('/api/users')
            .send({
                username,
                firstName,
                lastName
            }).catch(err => err.response)
            .then((res) => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Missing field');
                expect(res.body.location).to.equal('password');
            })
        });
        

        it('should reject if username already exist', function(){
           return User.create({
               username,
               password,
               firstName,
               lastName
           }).then(() => {              
            return chai.request(app)
            .post('/api/users')
            .send({
                username,
                password,
                firstName,
                lastName
            }).catch(err => err.response)
            .then((res)=>{
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('username already exist');
                expect(res.body.location).to.equal('username');
            })
            })
        });

        it('should reject if whitespace in username', function(){
            return chai.request(app)
            .post('/api/users')
            .send({
                username: ' dude   ',
                password,
                firstName,
                lastName
            }).catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Cannot contain whitespace');
                //expect(res.body.location).to.equal('username');
            })
        });

        it('should reject if whitespace in password', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username, password: 'clown shoes', firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Cannot contain whitespace');
                //expect(res.body.location).to.equal('password');
            })
        });

        it('should reject if username is too short', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username: 'a', password, firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Must be at least 3 characters long')
                expect(res.body.location).to.equal('username');
            })
        });

        it('should reject if username too long', function(){
            return chai.request(app)
            .post('/api/users')
            .send({
                username: new Array(21).fill('z').join(''),
                password,
                firstName,
                lastName
            }).catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Must be at most 20 characters long')
                expect(res.body.location).to.equal('username');
            })
        });

        it('should reject if password is too short', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username, password: 'abc', firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422)
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Must be at least 8 characters long');
                expect(res.body.location).to.equal('password');
            })
        });

        it('should reject if password is too long', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username, password: new Array(73).fill('a').join(''), firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422)
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Must be at most 72 characters long');
                expect(res.body.location).to.equal('password');
            })           
        });

        it('should reject non-string usernames', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username: 123, password, firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Incorrect typeof field: expect string');
                expect(res.body.location).to.equal('username');
            })
        });

        it('should reject non-string passwords', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username, password: 12345678, firstName, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Incorrect typeof field: expect string');
                expect(res.body.location).to.equal('password');
            })
        });

        it('should reject users with non-string firstName', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username, password, firstName: 12345, lastName})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Incorrect typeof field: expect string');
                expect(res.body.location).to.equal('firstName');
            })
        });

        it('should reject user with non-string lastName', function(){
            return chai.request(app)
            .post('/api/users')
            .send({username, password, firstName, lastName: 987654321})
            .catch(err => err.response)
            .then(res => {
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
                expect(res.body.message).to.equal('Incorrect typeof field: expect string');
                expect(res.body.location).to.equal('lastName');
            })
        })
        
    })
})