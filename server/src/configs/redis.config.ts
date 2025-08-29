import redis from 'ioredis';

const redisClient = new redis(process.env.REDIS_URL as string);

redisClient.on('connect', () => {
    console.log('Connected to Redis');
});

export default redisClient;

