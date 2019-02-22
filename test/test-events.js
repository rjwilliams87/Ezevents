"use strict";
const chai = require("chai");
const chaiHttp = require("chai-http");
const faker = require("faker");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");

const { app, runServer, closeServer } = require("../server");
const { User } = require("../user");
const { Events } = require("../events/models");
const { JWT_SECRET, JWT_EXPIRY, TEST_DATABASE_URL } = require("../config");

const expect = chai.expect;
chai.use(chaiHttp);

const username = "testUser";

const authToken = jwt.sign(
  {
    user: {
      username
    }
  },
  JWT_SECRET,
  {
    algorithm: "HS256",
    subject: username,
    expiresIn: JWT_EXPIRY
  }
);

function seedEventsData() {
  console.warn("seeding database");
  const seedData = [];
  for (let i = 1; i <= 20; i++) {
    seedData.push(generateEventsData());
  }
  return Events.insertMany(seedData);
}

function generateRandomEventTime() {
  const times = [
    "1pm",
    "2pm",
    "4pm",
    "6:30pm",
    "7:45pm",
    "10:15pm",
    "11am",
    "10:45am"
  ];
  return times[Math.floor(Math.random() * 8)];
}

function generateFoodAndBevOrder() {
  const order = {
    type: faker.lorem.word(),
    pricePerOrder: faker.random.number({ min: 20, max: 75 }),
    quantity: Math.ceil(Math.random() * 10)
  };
  return order;
}

function generateEventsData() {
  let eventData = {
    user: username,
    contact: {
      firstName: faker.name.firstName(),
      lastName: faker.name.lastName(),
      email: faker.internet.email(),
      phone: faker.phone.phoneNumber()
    },
    date: faker.date.future(),
    time: generateRandomEventTime(),
    order: {
      food: generateFoodAndBevOrder(),
      beverages: generateFoodAndBevOrder(),
      rentalPrice: faker.random.number({ min: 250, max: 5000 })
    }
  };
  return eventData;
}

function tearDownDb() {
  console.warn("deleting database");
  return mongoose.connection.dropDatabase();
}

describe("Events API", function() {
  before(function() {
    return runServer(TEST_DATABASE_URL);
  });
  beforeEach(function() {
    return seedEventsData();
  });
  afterEach(function() {
    return tearDownDb();
  });
  after(function() {
    return closeServer();
  });

  describe("/api/events GET endpoint", function() {
    it("should return all events for logged in user", function() {
      let res;
      return chai
        .request(app)
        .get("/api/events")
        .set("authorization", `Bearer ${authToken}`)
        .then(_res => {
          res = _res;
          expect(res).to.have.status(200);
          return Events.find({ user: username }).count();
        })
        .then(count => {
          expect(res.body).to.have.lengthOf(count);
        });
    });

    it("shoud return events with correct fields", function() {
      let event;
      return chai
        .request(app)
        .get("/api/events")
        .set("authorization", `Bearer ${authToken}`)
        .then(res => {
          expect(res).to.have.status(200);
          expect(res).to.be.json;
          expect(res.body).to.be.a("array");
          expect(res.body).to.have.lengthOf.at.least(1);
          res.body.forEach(event => {
            expect(event).to.be.a("object");
            //should return serialized object with following keys
            expect(event).to.include.keys(
              "id",
              "contact",
              "date",
              "order",
              "time"
            );
          });
          event = res.body[0];
          return Events.findById(event.id);
        })
        .then(res => {
          expect(res.id).to.equal(event.id);
          expect(res.orderTotal).to.equal(event.orderTotal);
          expect(res.contact.firstName).to.equal(event.contact.firstName);
          expect(res.contact.lastName).to.equal(event.contact.lastName);
          expect(res.contact.email).to.equal(event.contact.email);
          expect(res.contact.phone).to.equal(event.contact.phone);
        });
    });
  });

  describe("/api/events/:id GET endpoint", function() {
    it("should return event with correct id for logged in user", function() {
      let event;
      return Events.findOne().then(_event => {
        event = _event;
        return chai
          .request(app)
          .get(`/api/events/${event.id}`)
          .set("authorization", `Bearer ${authToken}`)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res.body.id).to.equal(event.id);
          });
      });
    });

    it("should return event with the correct fields", function() {
      let event;
      return Events.findOne().then(_event => {
        event = _event;
        return chai
          .request(app)
          .get(`/api/events/${event.id}`)
          .set(`authorization`, `Bearer ${authToken}`)
          .then(res => {
            expect(res).to.have.status(200);
            expect(res).to.be.a("object");
            expect(res.body).to.include.keys(
              "id",
              "contact",
              "date",
              "time",
              "order"
            );
            expect(res.body.contact).to.be.a("object");
            expect(res.body.contact).to.include.keys(
              "firstName",
              "lastName",
              "email",
              "phone"
            );
            expect(res.body.order).to.be.a("object");
            expect(res.body.order).to.include.keys(
              "food",
              "beverages",
              "rentalPrice"
            );
            expect(res.body.id).to.equal(event.id);
            expect(res.body.contact.firstName).to.equal(
              event.contact.firstName
            );
            expect(res.body.contact.lastName).to.equal(event.contact.lastName);
            expect(res.body.contact.email).to.equal(event.contact.email);
            expect(res.body.contact.phone).to.equal(event.contact.phone);
            expect(res.body.time).to.equal(event.time);
            expect(res.body.order.food).to.be.a("array");
            expect(res.body.order.food).to.have.lengthOf.at.least(1);
            expect(res.body.order.beverages).to.be.a("array");
            expect(res.body.order.food).to.have.lengthOf.at.least(1);
            expect(res.body.order.rentalPrice).to.equal(
              event.order.rentalPrice
            );
            expect(res.body.orderTotal).to.equal(event.orderTotal);
          });
      });
    });
  });

  describe("POST endpoint", function() {
    it("should fail to send request if missing auth credentials", function() {
      const newEvent = generateEventsData();
      return chai
        .request(app)
        .post("/api/events")
        .send(newEvent)
        .then(res => {
          expect(res).to.have.status(401);
        });
    });

    it("should add a new event", function() {
      const newEvent = generateEventsData();
      return chai
        .request(app)
        .post("/api/events")
        .set("authorization", `Bearer ${authToken}`)
        .send(newEvent)
        .then(res => {
          expect(res).to.have.status(201);
          expect(res).to.be.json;
          expect(res.body).to.be.a("object");
          expect(res.body).to.include.keys(
            "id",
            "contact",
            "date",
            "time",
            "order"
          );
          expect(res.body.contact).to.be.a("object");
          return Events.findById(res.body.id);
        })
        .then(event => {
          expect(event.id).to.not.be.null;
          expect(event.user).to.equal(newEvent.user);
        });
    });
  });

  describe("PUT request", function() {
    // it('should fail to update if id is incorrect', function(){
    //     const updatedEvent = {
    //         id: '01110011',
    //         contact: {
    //             firstName: 'Fred',
    //             lastName: 'Flintstone'
    //         }
    //     }
    //     return chai.request(app)
    //     .put(`/api/events/${updatedEvent.id}`)
    //     .set('authorization', `Bearer ${authToken}`)
    //     .send(updatedEvent)
    //     .catch(err => err.response)
    //     .then(res => {
    //         expect(res).to.have.status(500);
    //     })
    // })

    it("should correctly update fields on PUT request", function() {
      const updatedEvent = {
        contact: {
          firstName: "Barny",
          lastName: "Rubble"
        },
        time: "7:30pm",
        order: {
          rentalPrice: 1000
        }
      };
      return Events.findOne().then(event => {
        updatedEvent.id = event.id;
        return chai
          .request(app)
          .put(`/api/events/${updatedEvent.id}`)
          .set("authorization", `Bearer ${authToken}`)
          .send(updatedEvent)
          .then(res => {
            expect(res).to.have.status(204);
            return Events.findById(updatedEvent.id);
          })
          .then(event => {
            expect(event.contact.firstName).to.equal(
              updatedEvent.contact.firstName
            );
            expect(event.contact.lastName).to.equal(
              updatedEvent.contact.lastName
            );
            expect(event.time).to.equal(updatedEvent.time);
            expect(event.order.rentalPrice).to.equal(
              updatedEvent.order.rentalPrice
            );
          });
      });
    });
  });

  describe("DELETE request", function() {
    it("should delete event from database by id", function() {
      let eventToDelete;
      return Events.findOne().then(event => {
        eventToDelete = event;
        return chai
          .request(app)
          .delete(`/api/events/${eventToDelete.id}`)
          .set("authorization", `Bearer ${authToken}`)
          .then(res => {
            expect(res).to.have.status(204);
            return Events.findById(eventToDelete.id);
          })
          .then(event => {
            expect(event).to.be.null;
          });
      });
    });
  });
});
