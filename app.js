const express = require('express');
// const { knexInstance } = require('./middleware');
const {cacheMiddleware, setCache, knexInstance} = require('./cacheMiddleware');
const app = express();
app.use(express.json());





// Define whether you wish to use Cache or not
knexInstance.useCache = false;
// Route to retrieve all users
app.get('/users', async (req, res) => {
  try {

    // knexInstance.useCache = true;

    const users = await knexInstance.select('*').from('users');
    res.json(users);
    console.log('Feteched all users from db');
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});





// Route to retrieve a user by ID (no cache handling in this route)
app.get('/users/:id', cacheMiddleware, async (req, res) => {
  try {
    const { id } = req.params;

    // knexInstance.useCache = true;
    if (res.cachedData) {
      res.json(JSON.parse(res.cachedData));
      return;
    }

    const user = await knexInstance('users').select('*').where({ id });
    setCache(req.originalUrl, user);

    if (user) {
      res.json(user);
      console.log('Fetched from DB');
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    console.error('Error fetching user by ID:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});




// Route to add a new user (no cache handling in this route)
app.post('/users',  async (req, res) => {
  try {
    const { username, email } = req.body;
    // knexInstance.useCache = true;
    const [userId] = await knexInstance('users').insert({ username, email });
    res.json({ id: userId, username, email });
    console.log('Added a new user');
  } catch (error) {
    console.error('Error adding a new user:', error);
    res.status(500).json({ error: 'An error occurred' });
  }
});



// Route to update a user (no cache handling in this route)
app.put('/users/:id',cacheMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { username, email } = req.body;
    // knexInstance.useCache = true;
    const updatedUser = await knexInstance('users')
      .where({ id })
      .update({ username, email });
    if (updatedUser) {
      res.json({ message: 'User updated' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});




// Route to delete a user (no cache handling in this route)
app.delete('/users/:id',cacheMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    // knexInstance.useCache = true;
    const deletedUser = await knexInstance('users').where({ id }).del();
    if (deletedUser) {
      res.json({ message: 'User deleted' });
    } else {
      res.status(404).json({ error: 'User not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});
