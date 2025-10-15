import Redis from 'ioredis';

let redisClient;

if (!redisClient) {
  redisClient = new Redis({
    host: process.env.REDIS_HOST,
    port: Number(process.env.REDIS_PORT),
    username: process.env.REDIS_USERNAME, // for Redis v6+
    password: process.env.REDIS_PASSWORD,
  });

  redisClient.on('connect', () => console.log('✅ Redis connected'));
  redisClient.on('error', (err) => console.error('❌ Redis error', err));
}

export default redisClient;
