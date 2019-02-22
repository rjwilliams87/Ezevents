"use strict";
const { Strategy: LocalStrategy } = require("passport-local");

const { Strategy: JwtStrategy, ExtractJwt } = require("passport-jwt");

const { User } = require("../user/models");
const { JWT_SECRET } = require("../config");

const localStrategy = new LocalStrategy((username, password, callback) => {
  let user;
  User.findOne({ username: username })
    .then(_user => {
      user = _user;
      if (!user) {
        return Promise.reject({
          reason: "LoginError",
          message: "username or password not recognized"
        });
      }
      return user.validatePassword(password);
    })
    .then(isValid => {
      if (!isValid) {
        return Promise.reject({
          reason: "LoginError",
          message: "incorrect password"
        });
      }
      return callback(null, user);
    })
    .catch(err => {
      if (err.reason === "LoginError") {
        return callback(null, false, err);
      }
      console.error(err);
      return callback(err, false);
    });
});

const jwtStrategy = new JwtStrategy(
  {
    secretOrKey: JWT_SECRET,
    jwtFromRequest: ExtractJwt.fromAuthHeaderWithScheme("Bearer"),
    algorithms: ["HS256"]
  },
  (payload, done) => {
    done(null, payload.user);
  }
);

module.exports = { localStrategy, jwtStrategy };
