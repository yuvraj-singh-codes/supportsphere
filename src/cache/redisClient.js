import Redis from 'ioredis';

const redisClient = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD || undefined,
});

redisClient.on('error', (err) => {
  console.error('Redis error:', err);
});

const setCache = async (key, value, expiration = 3600) => {
  try {
    await redisClient.set(key, JSON.stringify(value), 'EX', expiration);
  } catch (error) {
    console.error('Error setting cache:', error);
  }
};

const getCache = async (key) => {
  try {
    const data = await redisClient.get(key);
    return data ? JSON.parse(data) : null;
  } catch (error) {
    console.error('Error getting cache:', error);
    return null;
  }
};

const deleteCache = async (key) => {
  try {
    await redisClient.del(key);
  } catch (error) {
    console.error('Error deleting cache:', error);
  }
};

export { setCache, getCache, deleteCache };