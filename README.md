
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
6. [Running through Docker](#running-through-docker)
7. [Conclusion](#conclusion)


## About

The cacheMiddleware is a custom-made middleware component for caching data in a Node.js application. It uses Redis as a cache store and integrates with Knex for database operations. This README will guide you through the setup and usage of the cache middleware in your project.

Following is an overview of what the Cache middleware is supposed to do:\
\
**For GET requests:**\
If the request is for the entire data, fetch the data directly from the database.\
If the request is for a specific user or some users, check if the user's key exists in the cache. If yes, return its data directly. if not, fetch it from the database, return it and additionally store it in the cache as well.\
\
**For PUT & DELETE requests:**\
Check if the user key exists in the cache. If it does, delete its data from the cache and perform the respective operation on the data in the database, otherwise just perform the respective operation on th database. You may additionally provide the key for the cached data and the operation will delete the corresponding data from the cache storage.



## Installation

Before using the `cacheMiddleware`, make sure you have the following prerequisites:

- Node.js installed on your system
- A Redis server running

You can install the middleware via npm or yarn:

```bash
npm install ioredis knex
# OR
yarn add ioredis knex
```


## Usage

### Configuration

1. **Import Dependencies**:

In your Node.js application, first, import the necessary dependencies (in `app.js` in our case`):

```javascript
const { attach_useCache } = require('cacheMiddleware');
```


2. **Knex Configuration**:

The middleware requires a Knex instance to perform database operations. Configure your Knex instance and include it in your project:

```javascript
const { development } = require("./knexfile");
const knex = require("knex")(development);
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

**Note:** The knex module has a singleton pattern, i.e., the same instance of this module will be loaded anywhere you require it in your project. For our project, you'll have ti iport it in both, the `cacheMiddleware.js` and 'app.js` files.

### Using the Middleware

1. **Enable/Disable Caching**:

To enable or disable the use of cache, you can chain your knex query with a `useCache` function to tell whether you want cache usage or not.
Following is how you can achieve it:

```javascript
   const user = await knex('users')
      .select('*')
      .where({ id })
      .useCache({val:true})
```


2. **Use the Cache**:

Each query is stored against a key in the cache. All they keys are essentially hashed outputs. You may decide to manually decide the key that will be hashed to keep against the output, e.g:

```javascript
   const user = await knex('users')
      .select('*')
      .where({ id })
      .useCache({val:true, key: "Getting data for user 3"})
```

The result of the query above will be stored in the cache against the hashed output of the string : `"Getting data for user 3"`

If no key is provided, the result will be stored against the hashed output of the query object itself and the hashed key will be displayed on the console screen e.g.: `Cache key is: 527adf25b1189e91cfda2de8c49a1c39`

While retrieving the data, you may either decide to give the string itself or the hashed value in the 'key' attribute, and for that, if the relevant data is retrieved, the result will be returned, else the result, if retrieved from the db, will be stored in the cache against the hash value of whatever was present inside the key attribute (so beware, if you write a hash value inside the key for which no corresponding data in cache storage is present, the data will be retrieved from the db and stored in cache, and its key will be the hash of the hashed value that you provided).


You can additonnally instruct the code whether you want to delete the cache associated with a certian key or not. Or, you could also instruct it to retrieve data from a given cache key. The subsection below it tells you how you could actually check chache keys. Nonetheless, following is how you can send cache keys:

```javascript
const deletedUser = await knex('users')
.where({ id })
.del()
.useCache({val:true, key: "aa1f12c68588b14b2bf7e28716928263"});
```

Additionally, some delete or update commands may require you to evict multiple key value pairs from the cache storage. For that purpose, you may decide to send multiple keys for eviction purposes. For example:

```javascript
.useCache({val:true, key: []"aa1f12c68588b14b2bf7e28716928263", "527adf25b1189e91cfda2de8c49a1c39"]});
```

The keys are cryptographically created in the the  `cacheMiddleware.js` file and you need to install and import the following dependency:

```javascript
const crypto = require('crypto');
```

The following function creates cache keys:

```javascript
function generateCacheKey(query) {
    const queryString = query.toString();
    return crypto.createHash("md5").update(queryString).digest("hex");
}
```



### Cache Control for Specific Routes

- To cache data for GET requests, make sure to apply the cacheMiddleware as middleware on the route handlers where you want caching to occur. you will also be required to modify your API code to accommodate the `setCache` function, as done above.



### Viewing Cached Keys

In order to view the Keys currently present in your cache, open up a new terminal and write:
`redis-cli`

This will open up a redis terminal. Then enter `KEYS *`, and this will display all the keys currently cached.

Finally, enter `exit` to end the redis terminal.



## API

### `cacheMiddleware`

This middleware is responsible for handling caching based on HTTP methods and URL. It is used as a middleware in your route handlers to control caching behavior.



### `knex`

An instance of the knex class used for database operations. You can configure it with your Knex settings and control caching through its `useCache` property.


## Examples

To see a complete working example of how to use the `cacheMiddleware`, check the `app.js` file in this repository.

Log statements have been placed in the middleware and the APIs as well, hence you may try to play around with the code. 
Try sending a couple of postman requests and you will notice how the middleware is operating.


## Running through Docker

The application is also Dockerized which allows you to run the application in an isolated container.

To run the application in a container through docker, firstly open up the container in the directory for the applictaion (after cloning it from github). Then run the following commands on your terminal:

```
sudo docker pull ahmadmukhtar7/cache-middleware:v20

sudo docker pull ahmadmukhtar7/redis:latest

sudo docker compose up
```

The first two commands will pull the two images from the dockerhub repository that are required to run the application. The third command will run the docker-compose file on your system.


## Conclusion
Efficient caching is a valuable strategy for optimizing performance by reducing redundant operations. Frequently used data is stored in a cache, offering faster access and significantly decreasing the overall time required to execute operations.

This project showcases the implementation of a cache middleware that seamlessly integrates caching into your project, enhancing its performance and responsiveness.