// Import required libraries
const knex = require("knex");
const redis = require("ioredis");

// Import the Knex configuration from a separate file
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


// Create a Redis client to connect to the Redis server
const redisClient = new redis({
  host: "localhost", // Redis server host
  port: 6379, // Redis server port
  // Optional: password: 'your_password',
});

const queryMiddleware = (queryBuilder) => {
  queryBuilder.on("query", async (queryData) => {
    try {
      // Check if queryData is falsy
      if (!queryData) {
        // This typically indicates an issue with the query data
        // Log whether caching is enabled in the query builder
        return;
      }

      // Log the query method being executed
      console.log("\nOutside, Query method:", queryData.method);
      console.log("\nCache usage allowed?:", knexInstance.useCache);

      // Check if the query method is 'select'
      if (queryData.method === "select") {
        // Check if the query is specific to a user (e.g., /users/1)
        const isUserSpecificQuery = /FROM users WHERE .+ = \?/.test(queryData.sql);

        // Log that a 'select' query is being processed
        console.log("Here, Using select - get");
        console.log("User specific query?:", isUserSpecificQuery);

        if (knexInstance.useCache && isUserSpecificQuery) {
          // It's a user-specific query, and caching is enabled
          const userId = extractUserIdFromQuery(queryData); // Extract user ID from the query
          if (userId !== null) {
            const cacheKey = `user:${userId}`;
            const cachedResult = await redisClient.get(cacheKey);
            if (cachedResult && knexInstance.useCache) {
              // Data is cached; return it
              queryData.response = JSON.parse(cachedResult);
              console.log("Using cached data");
              return;
            }
          }
        }
        
        // Data is not found in the cache or caching is disabled; fetch it from the database
        const result = await queryData;
        if (knexInstance.useCache) {
          // Cache the result data
          const userId = extractUserIdFromQuery(queryData); // Extract user ID from the query
          if (userId !== null) {
            const cacheKey = `user:${userId}`;
            redisClient.set(cacheKey, JSON.stringify(result), "EX", 3600);
            console.log("Caching data");
          }
          queryData.response = result;
        } else {
          queryData.response = result;
        }
      }
    } catch (error) {
      // Log any errors that occur during the middleware processing
      console.error("Middleware error:", error);
    }
  });
};
// Implement the function to extract the user ID from the query
function extractUserIdFromQuery(queryData) {
  if (queryData.sql) {
    // Assuming the query structure is similar to "UPDATE users SET ... WHERE id = ?"
    const match = queryData.sql.match(/WHERE id = (\d+)/i);
    if (match) {
      const userId = parseInt(match[1], 10);
      if (!isNaN(userId)) {
        return userId;
      }
    }
  }

  // If the user ID is not found in the query, return null
  return null;
}

// Apply the queryMiddleware to the Knex instance
queryMiddleware(knexInstance);

// Export the Knex instance and Redis client for use in other parts of your application
module.exports = {
  knexInstance,
  redisClient,
};
