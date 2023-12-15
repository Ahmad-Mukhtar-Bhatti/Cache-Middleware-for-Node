const redis = require("ioredis");

const redisClient = new redis({
  host: "localhost", // Redis server host
  port: 6379, // Redis server port
  // Optional: password: 'your_password',
});

module.exports.attach_useCache = function attach_useCache(Knex) {
  function useCache(getKeyFunc, ttl) {
    return this.client.transaction(async (trx) => {
      try {
        if (getKeyFunc === undefined || typeof getKeyFunc !== "function") {
          ttl = ttl || 3600; // 1 hour
          key = this.toString();
          if (this._method === "select") {
            const cachedResult = await redisClient.get(key);
            if (cachedResult && Object.keys(cachedResult).length !== 0) {
              console.log("Cache hit!");
              return JSON.parse(cachedResult);
            } else {
              console.log("Cache miss!");

              // Fetching from the db now
              const result = await this.transacting(trx);
              console.log("result", result);

              redisClient.set(key,JSON.stringify(result), "EX", ttl);

              return JSON.parse(result);
            }
          } else if (this._method === "update" || this._method === "del") {
            throw new Error("getKeyFunc is not valid");
          }
        } else {
          if (this._method === "select") {
            ttl = ttl || 172800; // 2 days
            key = getKeyFunc();
            const cachedResult = await redisClient.hgetall(key);
            console.log("Key: ", key, "\nCached result: ", cachedResult);
            console.log("Result Length: ", Object.keys(cachedResult).length);
            if (cachedResult && Object.keys(cachedResult).length !== 0) {
              console.log("Cache hit!");
              return cachedResult;
            } else {
              console.log("Cache miss!");

              // Fetching from the db now
              const result = await this.transacting(trx);
              console.log("result", result);
              flatArray = result.flatMap((obj) => [
                obj.id,
                JSON.stringify(obj),
              ]);
              console.log("flatArray", flatArray);

              redisClient.hset(key, flatArray);

              // set expiry for the key
              redisClient.expire(key, ttl);

              return result;
            }
          } else if (this._method === "update") {
            ttl = ttl || 172800; // 2 days
            key = getKeyFunc();

            // For 'update', execute the query
            const result = await this.transacting(trx).returning("*");
            console.log("result: ", result);

            // for update store the result in cache
            redisClient.hset(key, result[0]);

            // set expiry for the key
            redisClient.expire(key, ttl);

            return result;
          } else if (this._method === "del") {
            ttl = ttl || 172800; // 2 days
            key = getKeyFunc();

            // For 'update' and 'delete' queries, execute the query
            const result = await this.transacting(trx);

            console.log("Result Del: ", result);

            // delete hash from redis
            redisClient.del(key);

            return result;
          }
        }
      } catch (error) {
        throw new Error(error);
      }

      console.log("method: ", this._method);
    });
  }
  console.log("Knex: ", Knex);
  Knex.QueryBuilder.extend("useCache", useCache);
};
