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
    const unhashedPassword = 'password123'
    const myUser = {
        username: 'ryu',
        password: unhashedPassword,
        firstName: 'Ken',
        lastName: 'Ryu'
    };
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
            const unhashedPassword = 'password123';
            //const hashedPassword = User.hashPassword(unhashedPassword);
            const newUser = {
                username: 'myUsername',
                password: unhashedPassword,
                firstName: 'Billy',
                lastName: 'Bob'
            }
            return chai.request(app)
            .post('/api/users')
            .send(newUser)
            .then((res)=>{
                expect(res).to.have.status(201);
                expect(res.body).to.be.a('object');
                expect(res.body).to.have.keys('username', 'firstName', 'lastName');
                expect(res.body.username).to.equal(newUser.username);
                expect(res.body.firstName).to.equal(newUser.firstName);
                expect(res.body.lastName).to.equal(newUser.lastName);

                return User.findOne({username: res.body.username})
            }).then((user)=>{
                expect(user).to.not.be.null;
                expect(user.username).to.equal(newUser.username);
                expect(user.firstName).to.equal(newUser.firstName);
                expect(user.lastName).to.equal(newUser.lastName);
                return user.validatePassword(unhashedPassword);
            }).then((isValid)=>{
                expect(isValid).to.be.true;
            })
        });
        /*
        it('should reject if missing username', function(){
            return chai.request(app)
            .post('/api/users')
            .send({password, firstName, lastName})
            .then(()=>{
                expect.fail(null, null, 'Request should not succeed');
            }).catch( err => {
                if (err instanceof chai.AssertionError){
                    throw err;
                }

                const res = err.response;
                expect(res).to.have.status(422);
                expect(res.body.reason).to.equal('ValidationError');
            })
        });
        */
        /*
        it('should reject if missing password', function(){
            return chai.request(app)
            .post('/api/users')
            .send({
                username,
                firstName,
                lastName
            }).then(()=>
                expect.fail(null, null, `Request should not succeed`)
            ).catch((err)=>{
                if (err instanceof chai.AssertionError){
                    throw err;
                }
                const res = err.response;
                expect(res).to.have.status(404);
            })
        });
        */

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
            })
            })
        });
/*
        it('should reject if whitespace in username', function(){

        });

        it('should reject if whitespace in password', function(){

        });

        it('should reject if username is too short', function(){

        });

        it('should reject if username too long', function(){

        });

        it('should reject if password is too short', function(){

        });

        it('should reject if password is too long', function(){

        });

        it('should reject if password is incorrect', function(){

        });

        it('should reject non-string usernames', function(){

        });

        it('should reject non-string passwords', function(){

        });

        it('should reject users with non-string firstName', function(){

        });

        it('should reject user with non-string lastName', function(){

        })*/
    })
})