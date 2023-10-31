
# Cache Middleware for Node.js Application


## Table of Contents
1. [About](#about)
2. [Installation](#installation)
3. [Usage](#usage)
   - [Configuration](#configuration)
   - [Using the Middleware](#using-the-middleware)
   - [Cache Control for Specific Routes](#cache-control-for-specific-routes)
   - [Viewing Cached Keys](#viewing-cached-keys)
4. [API](#api)
5. [Examples](#examples)
5. [Conclusion](#conclusion)


## About

The cacheMiddleware is a custom-made middleware component for caching data in a Node.js application. It uses Redis as a cache store and integrates with Knex for database operations. This README will guide you through the setup and usage of the cache middleware in your project.

Following is an overview of what the Cache middleware is supposed to do:\
\
**For GET requests:**\
If the request is for the entire data, fetch the data directly from the database.\
If the request is for a specific user, check if the user's key exists in the cache. If yes, return its data directly. if not, fetch it from the database, return it and additionally store it in the cache as well.\
\
**For PUT & DELETE requests:**\
Check if the user key exists in the cache. If it does, delete its data from the cache and perform the respective operation on the data in the database, otherwise just perform the respective operation on th database.



## Installation

Before using the `cacheMiddleware`, make sure you have the following prerequisites:

- Node.js installed on your system
- A Redis server running

You can install the middleware via npm or yarn:

```bash
npm install ioredis knex cache-middleware
# OR
yarn add ioredis knex cache-middleware
```


## Usage

### Configuration

1. **Import Dependencies**:

In your Node.js application, first, import the necessary dependencies:

```javascript
const { cacheMiddleware, setCache, knexInstance } = require('cache-middleware');
```


2. **Knex Configuration**:

The middleware requires a Knex instance to perform database operations. Configure your Knex instance and include it in your project:

```javascript
const knexConfig = require('./knexfile'); // Your Knex configuration
const knexInstance = new ExtendedKnex(knexConfig.development);
```
A `knexfile.js` is present in the project which shows the configurations for knex. Modify that according to your requirement.

3. **Redis Configuration**:

You need to configure the Redis client for caching. Create a Redis client and connect it to your Redis server:

```javascript
const redis = require('ioredis');
const redisClient = new redis({ // Use your configuration here
    host: 'localhost', // Redis server host
    port: 6379,       // Redis server port
    // Optional: password: 'your_password',
});
```


### Using the Middleware

1. **Enable/Disable Caching**:

The `knexInstance.useCache` property is used to enable or disable caching. By default, it is set to `true`. You can change it in your routes:

```javascript
knexInstance.useCache = true; // Enable caching
knexInstance.useCache = false; // Disable caching
```
Set it to *true* to enable caching and *false* to disable it.

2. **Use the Cache Middleware**:
Apply the `cacheMiddleware` as middleware in your route handlers:

```javascript
app.get('/users/:id', cacheMiddleware, async (req, res) => {
    // Your route logic here
});
```

The `cacheMiddleware` will handle caching based on the HTTP request method (GET, PUT, DELETE) and URL.
You don't need to add this middleware to your PUT commands.


3. **Using the setCache Function**:
To manually set data in the cache, you can use the `setCache` function:

```javascript
setCache(req.originalUrl, data);
```

This function accepts a URL and data as parameters and stores the data in the Redis cache. It only caches data if `knexInstance.useCache` is *true*.\
You will have to add this function to the (specific) GET api nonetheless, since if a data isn't found in the cache, you fetch it from the Database and store it in the cache as well.\
Following is what a typical specific GET request would look like:
```javascript
app.get('/users/:id', cacheMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    if (res.cachedData) {
      res.json(JSON.parse(res.cachedData));
      return;
    }
    const user = await knexInstance('users').select('*').where({ id });
    setCache(req.originalUrl, user);

    if (user) {
      res.json(user);
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});
```




### Cache Control for Specific Routes

- To cache data for GET requests, make sure to apply the cacheMiddleware as middleware on the route handlers where you want caching to occur. you will also be required to modify your API code to accommodate the `setCache` function, as done above.

- For routes that use other HTTP methods (PUT, DELETE), you will just need to implement caching logic within the route handlers.

- For PUT and GET (all) method, you won't require cache since these operations are done directly on the DataBase.


### Viewing Cached Keys

In order to view the Keys currently present in your cache, open up a new terminal and write:
`redis-cli`

This will open up a redis terminal. Then enter `KEYS *`, and this will display all the keys currently cached.

Finally, enter `exit` to end the redis terminal.



## API

### `cacheMiddleware`

This middleware is responsible for handling caching based on HTTP methods and URL. It is used as a middleware in your route handlers to control caching behavior.

### `setCache(url, data)`

This function is used to manually set data in the Redis cache. It accepts a URL and data as parameters and stores the data in the cache, but only if caching is enabled.

Following is the function:

```javascript
function setCache(url, data){         
    if (knexInstance.useCache === true) {
        redisClient.set(url, JSON.stringify(data), "EX", 3600);
    }
}
```
The 3600 means seconds, hence the cache is only being set for an hour in the example above. You may change it according to your needs.


### `knexInstance`

An instance of the extended Knex class used for database operations. You can configure it with your Knex settings and control caching through its `useCache` property.


## Examples

To see a complete working example of how to use the `cacheMiddleware`, check the `app.js` file in this repository.

Log statements have been placed in the middleware and the APIs as well, hence you may try to play around with the code. 
Try sending a couple of postman requests and you will notice how the middleware is operating.



## Conclusion
Efficient caching is a valuable strategy for optimizing performance by reducing redundant operations. Frequently used data is stored in a cache, offering faster access and significantly decreasing the overall time required to execute operations.

This project showcases the implementation of a cache middleware that seamlessly integrates caching into your project, enhancing its performance and responsiveness.