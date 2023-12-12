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
                    var cacheKey = '';

                    if (key){
                      
                      // If user sends a cache key to retrieve its data, try fetching from that directly
                      const cachedResult = await redisClient.get(key);
                      if (cachedResult) {
                          console.log("Cache hit!, data found against the provided key");
                          return JSON.parse(cachedResult);
                      }
                      
                      // If the cache key is not found, then generate a new cache key and find data in database to store against it
                      cacheKey = `${generateCacheKey(key)}`
                      console.log("User sent query converted to hash. Key was:", key)
                    }
                    else{
                      cacheKey = `${generateCacheKey(this)}`
                    }
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
                    // var cacheKey = [];

                    // // Checking whether the developer has sent a key
                    // if (key){
                    //   // Checking if multiple keys need to be evicted from the cache
                    //   if (key.isArray()) {
                    //     for (var i = 0; i < key.length; i++) {
                    //       cacheKey.append(`${generateCacheKey(key[i])}`)
                    //     }
                    //   }
                    //   else{
                    //     cacheKey.append(`${key}`)
                    //   }
                    // }

                    // Storing the keys to delete in a variable called cacheKey 
                    const cacheKey = key;
                    
                    // Removing all cached keys that the developer sent
                    if (cacheKey.length >= 1){    // Checking whether the user sent a single cache key or multiple
                      for (var i = 0; i < cacheKey.length; i++) {
                        const cacheKeyToInvalidate = `${cacheKey[i]}`;
                        // Remove the cached data associated with the cache key
                        redisClient.del(cacheKeyToInvalidate);
                      }
                    }

                
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
