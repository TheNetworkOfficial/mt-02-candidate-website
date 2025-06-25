const redis = require('redis');
require('dotenv').config();

const redisClient = redis.createClient({
  url: process.env.REDIS_URL
});

redisClient
  .connect()
  .then(() => console.log('Redis client connected'))
  .catch((err) => console.error('Redis connection error', err));

module.exports = redisClient;