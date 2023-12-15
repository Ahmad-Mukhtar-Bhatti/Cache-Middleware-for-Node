const redis = require("ioredis");

const redisClient = new redis({
  host: "localhost", // Redis server host
  port: 6379, // Redis server port
  // Optional: password: 'your_password',
});

module.exports.attach_useCache = function attach_useCache(Knex) {
  function useCache(getKeyFunc, ttl) {
    return this.client.transaction(async (trx) => {
      if (
        (!ttl && getKeyFunc === undefined) ||
        typeof getKeyFunc !== "function"
      ) {
        ttl = 3600; // 1 hour
      } else if (!ttl) ttl = 172800; // 2 days

      
      console.log('method: ', this._method)

      try {
        if (this._method === "select") {
          //check if getKeyFunc is defined
          if (getKeyFunc === undefined || typeof getKeyFunc !== "function") {
            // if not defined, use the query as the key
            key = this.toString();
          } else {
            key = getKeyFunc();
          }

          const cachedResult = await redisClient.hgetall(key);
          console.log('Key: ',key,'\nCached result: ', cachedResult);
          console.log('Result Length: ', Object.keys(cachedResult).length);
          if (cachedResult && Object.keys(cachedResult).length !== 0) {
            console.log("Cache hit!");
            return cachedResult;
          } else {
            console.log("Cache miss!");

            // Fetching from the db now
            const result = await this.transacting(trx);
            console.log("result", result);
            flatArray = result.flatMap(obj => [obj.id, JSON.stringify(obj)]);
            console.log("flatArray", flatArray);

            redisClient.hset(key, flatArray);

            // set expiry for the key
            redisClient.expire(key, ttl);

            return result;
          }
        } else if (this._method === "update") {
          if (getKeyFunc === undefined || typeof getKeyFunc !== "function") {
            // throw error if getKeyFunc is not defined
            throw new Error("getKeyFunc is not valid");
          }

          key = getKeyFunc();

          // For 'update', execute the query
          const result = await this.transacting(trx).returning("*");
          console.log('result: ', result)

          // for update store the result in cache
          redisClient.hset(key, result[0]);

          // set expiry for the key
          redisClient.expire(key, ttl);

          return result;
        } else if (this._method === "del") {
          if (getKeyFunc === undefined || typeof getKeyFunc !== "function") {
            // throw error if getKeyFunc is not defined
            throw new Error("getKeyFunc is not valid");
          }

          key = getKeyFunc();

          // For 'update' and 'delete' queries, execute the query
          const result = await this.transacting(trx);

          console.log('Result Del: ', result)

          // delete hash from redis
          redisClient.del(key);

          return result;
        }
        else{
          const result = await this.transacting(trx);
          return result;
        }
      } catch (error) {
        console.log("Error in the cache middleware", error);
        return;
      }
    });
  }
  console.log('Knex: ', Knex)
  Knex.QueryBuilder.extend("useCache", useCache);
};
