const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const Event = require('./models/event');
const User = require('./models/user');

const app = express();

app.use(bodyParser.json());

app.use(
    '/graphql',
    graphqlHTTP({
        schema: buildSchema(`

            type Event {
                _id: ID!
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type User {
                _id: ID!
                email:String!
                password: String
            }

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            input UserIntput {
                email:String!
                password: String!
            }

            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
                createUser(userInput: UserIntput): User
            }

            schema {
                query: RootQuery
                mutation: RootMutation
            }
    `),
    rootValue: {
        events: () => {
           return Event.find()
           .then(events => {
               return events.map(event => {
                   return { ...event._doc, _id: event.id };
               });
           })
           .catch(err => {
            throw err;
           });
        },
            createEvent: (args) => {
                const event = new Event({
                    title: args.eventInput.title,
                    description: args.eventInput.description,
                    price: +args.eventInput.price,
                    date: new Date (args.eventInput.date)
                });
                return event
                .save()
                .then( result => {
                    console.log(result);
                    return {...result._doc, _id: result._doc._id.toString() };
                })
                .catch(err =>{
                    console.log(err);
                });
            },
            createUser: (args) => {
                return bcrypt
                .hash(args.userInput.password, 12)
                .then(hashedPassword => {
                    const user = new User({
                        email: args.userInput.email,
                        password: hashedPassword
                    });
                    return user.save();
                })
                .then(result => {
                    return {...result._doc, _id: result.id};
                })
                .catch(err => {
                    throw err;
                });
            }
        },
        graphiql: true,
    })
);

mongoose.connect('mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.nqz2b.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority',{
    useNewUrlParser: true,
});

app.listen(3000, () => {
    console.log("Puerto corrriendo")
});

//``