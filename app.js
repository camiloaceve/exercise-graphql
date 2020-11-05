const express = require('express');
const bodyParser = require('body-parser');
const {graphqlHTTP} = require('express-graphql');
const { buildSchema } = require('graphql');
const mongoose = require('mongoose');

const Event = require('./models/event');
const event = require('./models/event');

const app = express();


const events = [];

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

            input EventInput {
                title: String!
                description: String!
                price: Float!
                date: String!
            }

            type RootQuery {
                events: [Event!]!
            }

            type RootMutation {
                createEvent(eventInput: EventInput): Event
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
                    return {...result._doc, _id: result._doc._id.title() };
                })
                .catch(err =>{
                    console.log(err);
                });
                throw err;
            }
        },
        graphiql: true,
    })
);

mongoose.connect('mongodb+srv://prueba:DWpFK4CododETv2u@cluster0.nqz2b.mongodb.net/graphl?retryWrites=true&w=majority',{
    useNewUrlParser: true,
});

app.listen(3000, () => {
    console.log("Puerto corrriendo")
});

//``