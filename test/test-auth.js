'use strict';
const chai = require('chai');
const chaiHttp = require('chai-http');
const faker = require('faker');
const jwt = require('jsonwebtoken');

const {app, runServer, closeServer} = require('../server');
const {User} = require('../user');
const {JWT_SECRET, TEST_DATABASE_URL} = require('../config');

const expect = chai.expect;
chai.use(chaiHttp);
/*
function generateUser(userPassword){
    const testUser = {
        username: faker.internet.userName(),
        password: userPassword, 
        firstName: faker.name.firstName,
        lastName: faker.name.lastName
    }
    return testUser;
}
*/
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
})