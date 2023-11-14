const Knex = require("knex");
const crypto = require('crypto');

const redis = require("ioredis");


const redisClient = new redis({
  host: "localhost", // Redis server host
  port: 6379, // Redis server port
  // Optional: password: 'your_password',
});




module.exports.attach_useCache = function attach_useCache() {
    function useCache({val, key}) {
        this._useCache = val;

        
        if (val === true)
            console.log("Using Cache");
        

        return this.client.transaction(async (trx) => {

            // console.log("statements", this._statements)
            
            try{

                // Performing without cache
                if (!this._useCache){
                    console.log("Not using cache")

                    // Removing all data from cache if cache usage is off and something is updated or deleted from db
                    // if (this._method === "update" || this._method === "del") {
                    //     redisClient.flushall((err, response) => {
                    //         if (err) {
                    //             // Handle the error
                    //         } else {
                    //             console.log("All data cleared from Redis.");
                    //         }
                    //         });
                    // }

                    const result = await this.transacting(trx);
                    return result;
                }
                
                if (this._method === "select") {
                  
                  // Check if the query is specific to a user (e.g., /users/1).
                  const isUserSpecificQuery = ( (this._statements).length == 2);
                  console.log("User specific query?:", isUserSpecificQuery);
            
                  if (isUserSpecificQuery) {
                    // It's a user-specific query, and caching is enabled
                    const cacheKey = `${generateCacheKey(this)}`
                    console.log("Cache key is:", cacheKey)
            
            
                    const cachedResult = await redisClient.get(cacheKey);
                    if (cachedResult) {
                        console.log("Cache hit!");
                        return JSON.parse(cachedResult);

                    } else {
                        console.log("Cache miss!");
                            
                        // Fetching from the db now
                        const result = await this.transacting(trx)
                            
                        redisClient.set(cacheKey, JSON.stringify(result), "EX", 3600);

                        return result;
                    }
                  }
                  else
                    console.log("Not a user specific query");
                  
                } else if (this._method === "update" || this._method === "del") {
                    // For 'update' and 'delete' queries, execute the quer
                    const result = await this.transacting(trx)

                    console.log("result", result)
                
                    // Determine the cache key to invalidate
                    var cacheKey = 0;
                    if (key){
                        cacheKey = `${key}`
                    }
                    else{
                        cacheKey = `${generateCacheKey(this)}`
                    }
                  
                    const cacheKeyToInvalidate = `${cacheKey}`;
            
                    // Remove the cached data associated with the cache key
                    redisClient.del(cacheKeyToInvalidate);
                
                    return result;
                }
              }
              catch (error) {
                console.log("Error in the cache middleware", error);
                return;
              }
        });
};


function generateCacheKey(query) {
    const queryString = query.toString();
    return crypto.createHash("md5").update(queryString).digest("hex");
}

Knex.QueryBuilder.extend("useCache", useCache);
}

