const keys = require("./keys");
const redis = require("redis");

//Worker is going to be watching redis activity
const redisClient = redis.createClient({
    host: keys.redisHost,
    port: keys.redisPort,
    //This tells the redis client to try to reconnect every interval (in milliseconds )for every disconnection
    retry_strategy: () => 1000
});

const sub = redisClient.duplicate();

function fib(index) {
    if(index < 2 ) return 1;
    return fib(index - 1) + fib(index - 2);
}

//We are subscribing to redis for everytime we are getting a new message
//Everytime we are getting a new message from redis, we are going to generate a hash set of values, with the key
// being the message that was piped in from redis, and the fib value that we calculated.
sub.on('message', (channel, message) => {
    redisClient.hset('values', message, fib(parseInt(message)));
});

//Everytime there is an insert event, we are going to get the message
sub.subscribe('insert');


