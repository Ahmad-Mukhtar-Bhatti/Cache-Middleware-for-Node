const knex = require("knex");
const redis = require("ioredis");


const knexConfig = require("./knexfile");


// Create a Knex instance using the specified configuration
class ExtendedKnex extends knex {
    constructor(config) {
      super(config);
      console.log("ExtendedKnex");
      this.useCache = false;
    }
  
    select(...args) {
      const builder = super.select(...args);
      builder._useCache = this._useCache;
      return builder;
    }
  
    set useCache(value) {
      console.log("useCache value recieved", value);
      this._useCache = value;
    }
    get useCache() {
      return this._useCache;
    }
}
  
const knexInstance = new ExtendedKnex(knexConfig.development);
  

const redisClient = new redis({
    host: "localhost", // Redis server host
    port: 6379, // Redis server port
    // Optional: password: 'your_password',
});




const cacheMiddleware = async (req, res, next) => {
  try {

    if (knexInstance.useCache === false) {      // Checking if cache usage is allowed
        console.log("Cache usage is off")
        return next();
    }
    if (!redisClient) return next();            // Return if cache server isn't working

    const url = req.originalUrl;

    if (req.method === "GET") {                 // Check if it is a GET api request
        const data = await redisClient.get(url);

        if (!data) return next();
        console.log("Fetched from Cache data");
        res.cachedData = data;                      // forward the cached data to the api
        next();
    }

    if (req.method === "PUT" || req.method === "DELETE") {      // Check if it is a PUT or DELETE api request
        console.log("Deleted user data from cache")
        redisClient.del(url);                               // delete from cache
        next();
    }

    
  } catch (error) {
    console.log("Error in the cache middleware", error);
    next();
  }
};


function setCache(url, data){               // Function to set cache
    if (knexInstance.useCache === true) {
        redisClient.set(url, JSON.stringify(data), "EX", 3600);
    }
}



module.exports = {
  cacheMiddleware,
  setCache,
  knexInstance
};