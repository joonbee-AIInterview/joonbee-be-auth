import * as redis from 'redis';
import { promisify } from 'util';

export const client = redis.createClient({
    url: 'redis://:secret1234@localhost:6378'
});

client.connect();
client.on('error', (err) => {
    console.error('Redis Error ',err);
});



// REDIS 비동기
// export const setAsync = promisify(client.setEx).bind(client);
// export const getAsync = promisify(client.get).bind(client);
// export const delAsync = promisify(client.del).bind(client);


