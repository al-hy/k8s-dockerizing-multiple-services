const keys = require('./keys');

// Express App Setup
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');

//This object is going to receive and respond to any http request to the react server
const app = express();
//Cross Origin Resource Sharing ---> Essentially allows us to make a request from one domain (the react application is running on) to another domain (the express server is running on) 
app.use(cors());
//Body parser --> Takes the HTTP request from the react application and turns the body of the request into a JSON that express API can easily work with.
app.use(bodyParser.json());

// POSTGRES Client set up
const { Pool } = require('pg');
const pgClient = new Pool({
    user: keys.pgUser,
    host: keys.pgHost,
    database: keys.pgDatabase,
    password: keys.pgPassword
});

pgClient.on('error', () => {
    console.log("Lost PG Connection");
});

//NOTE: Everytime we connect we connect to a SQL type database , we have to create at least one time a table that is going to store all the values.
//We are going to create a table that is going to store the indices for any submitted values.

pgClient.query('CREATE TABLE IF NOT EXISTS values (number INT)')
    .catch((err) => {console.log(err)});


//REDIS CLIENT SET UP
const redis = require('redis');
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    retry_strategy: () => 1000
});

//We are making a duplicate connection. A connection that is listening or publishing, that is only its sole purpose. So we need to create a new one to handle other jobs tha we need todo. 
const redisPublisher = redis.duplicate();

//EXPRESS ROUTE HANDLER
app.get('/', (req, res) => {
    res.send('Hi');

});

app.get('/values/all', async (req, res) => {
    const values = await pgClient.query('SELECT * from values');
    res.send(values.rows);
});

app.get('/values/current', async (req, res) => {
    //redis does not have promise support
    redisClient.hgetall('values', (err, values) => {
        res.send(values);
    });
});

app.post('/values', async (req, res) => {
    const index = req.body.index;

    if(parseInt(index) > 40) {
        return res.status(422).send('Index too high'); //what is status code 422?
    }

    redisClient.hset('values', index, 'Nothing yet!'); //We have not yet calculated the Fib values for the index, and we are going to let the work calculate and replace the value
    redisPublisher.publish('insert', index);
    pgClient.query('INSERT INTO values(number) VALUES($1)', [index]);
    res.send({ working: true});

});

app.listen(5000, err => {
    console.log('Listening on port 5000');
})