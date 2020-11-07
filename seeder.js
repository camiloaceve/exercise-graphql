const mongoose = require('mongoose');
const faker = require('faker');
const User = require('./models/user');
const Event = require('./models/event');

mongoose.connect('mongodb+srv://${MONGO_USER}:${MONGO_PASSWORD}@cluster0.nqz2b.mongodb.net/${MONGO_DB}?retryWrites=true&w=majority',{
    useNewUrlParser: true,
});

for (let i = 0; i < 10; i++) {
    const user = new User({
        email: faker.internet.email(),
        password: faker.internet.password()
    });

    user.save()
        .then(userRef => {
        console.log(`$${userRef.email} saved`);
        const event = new Event({
            user: user._id,
            title: faker.name.title(),
            description: faker.description.commerce(),
            price: faker.price.commerce(),
            date: faker.date.date()
        })

        event.save()
        .then(eventRef => {
            console.log(`${userRef.email} in ${eventRef.title}`)
            userRef.event = eventRef._id
            userRef.save().then(_ => _)
        })

        })

}