'use strict';
const express = require('express');
const bodyParser = require('body-parser');

const {User} = require('./models');

const router = express.Router();
const jsonParser = bodyParser.json();

//post req to reqister user 
router.post('/', jsonParser, (req, res) => {
    const requiredFields = ['username', 'password'];
    const missingField = requiredFields.find(field => !(field in req.body));

    if (missingField){
        return res.status(422).json({
            code: 422, 
            reason: 'ValidationError',
            message: 'Missing field',
            location: missingField
        });
    }
    const stringFields = ['username', 'password', 'firstName', 'lastName'];
    const nonStringField = stringFields.find((field) =>{
        field in req.body && typeof req.body[field] !== 'string'
    });

    if (nonStringField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Incorrect typeof field: expect string',
            location: nonStringField
        });
    }

    const trimmedFields = ['username', 'password'];
    const nonTrimmedField = trimmedFields.find((field)=>{
        req.body[field].trim() !== req.body[field]
    });

    if (nonTrimmedField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 'Cannot have whitespace',
            location: nonTrimmedField
        });
    }

    const sizeFields = {
        username: {
            min: 3,
            max: 15
        },
        password: {
            min: 8,
            max: 72
        }
    };

    const tooSmallField = Object.keys(sizeFields).find((field)=>{
        'min' in sizeFields[field] && req.body[field].trim().length < sizeFields[field].min
    });

    const tooBigField = Object.keys(sizeFields).find((field)=>{
        'max' in sizeFields[field] && req.body[field].trim().length > sizeFields[field].max
    });

    if (tooSmallField || tooBigField){
        return res.status(422).json({
            code: 422,
            reason: 'ValidationError',
            message: 
                tooSmallField ? `Must be at least ${sizeFields[tooSmallField].min} characters`
                : `Must be less than ${sizeFields[tooBigField].max} characters`,
            location: tooSmallField || tooBigField
        });
    }

    let {username, password, firstName = '', lastName = ''} = req.body;
    firstName = firstName.trim();
    lastName = lastName.trim();

    return User.find({username}).count()
    .then((count)=>{
        if (count > 0) {
            return Promise.reject({
                code: 422,
                reason: 'ValidationError',
                message: `username already exist`,
                location: `username`
            });

        }
        return User.hashPassword(password);
    }).then((hash)=>{
        return User.create({
            username,
            password: hash,
            firstName,
            lastName
        });
    }).then((user) => {
        return res.status(201).json(user.serialize());
    }).catch(err =>{
        if(err.reason === 'ValidationError') {
            return res.status(err.code).json(err);
        }
        console.error(err);
        res.status(500).json({message: `Internal Server Error`});
    });
});

//delete before publishing
router.get('/', (req, res) =>{
    return User.find()
    .then(users => res.json(users.map(user => user.serialize())))
    .catch(err => res.status(500).json({message: `Internal Server Error`}));
});

module.exports = {router};