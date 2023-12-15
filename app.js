// const express = require("express");
// // const knex = require('./cacheMiddleware');
// const app = express();

// const { development } = require("./knexfile");
// const knex = require("knex")(development);

const { attach_useCache } = require("./cacheMiddleware");
// console.log("knexExtended loaded");
// attach_useCache();

// app.use(express.json());

// // Route to retrieve all users
// app.get("/users", async (req, res) => {
//   try {
//     // knexInstance.useCache = true;

//     const users = await knex.select("*").from("users");

//     res.json(users);
//     // console.log('Feteched all users from db', users);
//   } catch (error) {
//     console.log(error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// // Route to retrieve a user by ID (no cache handling in this route)
// app.get("/users/:id", async (req, res) => {
//   const getKeyFunc = () => {
//     const { id } = req.params;
//     return "user:" + id;
//   };

//   try {
//     const { id } = req.params;

//     const user = await knex("users")
//       .select("*")
//       .where({ id })
//       .useCache(getKeyFunc);

//     if (user != undefined || user.length != 0) {
//       res.json(user);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// // Route to add a user
// app.post("/user", async (req, res) => {
//   const getKeyFunc = () => {
//     const { id } = req.body;
//     return "user:" + id;
//   };

//   try {
//     const user = await knex("users")
//       .insert(req.body)
//       .onConflict("id")
//       .merge()
//       .useCache(getKeyFunc);

//     if (user != undefined || user.length != 0) {
//       res.json(user);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// // Route to update a user
// app.delete("/user/:id", async (req, res) => {
//   const getKeyFunc = () => {
//     const { id } = req.params;
//     return "user:" + id;
//   };

//   try {
//     const user = await knex("users")
//       .del()
//       .where({ id: req.params.id })
//       .useCache(getKeyFunc);

//     if (user != undefined || user.length != 0) {
//       res.json(user);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// // Route to delete a user
// app.delete("/user/:id", async (req, res) => {
//   const getKeyFunc = () => {
//     const { id } = req.params;
//     return "user:" + id;
//   };

//   try {
//     const user = await knex("users")
//       .update(req.body)
//       .where({ id: req.params.id })
//       .useCache(getKeyFunc);

//     if (user != undefined || user.length != 0) {
//       res.json(user);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// // Route to retrieve a user by ID (no cache handling in this route)
// app.get("/complexQuery/:id", async (req, res) => {
//   const getKeyFunc = () => {
//     const { id } = req.params;
//     return "item inner join part_types where item_id = " + id;
//   };

//   try {
//     const { id } = req.params;

//     const user = await knex("users")
//       .select("*")
//       .where({ id })
//       .useCache(getKeyFunc);

//     if (user != undefined || user.length != 0) {
//       res.json(user);
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     console.error("Error fetching user by ID:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// // Route to add a new user (no cache handling in this route)
// app.post("/users", async (req, res) => {
//   try {
//     const { username, email } = req.body;
//     // knexInstance.useCache = true;
//     const [userId] = await knex("users").insert({ username, email });
//     res.json({ id: userId, username, email });
//     console.log("Added a new user");
//   } catch (error) {
//     console.error("Error adding a new user:", error);
//     res.status(500).json({ error: "An error occurred" });
//   }
// });

// app.put("/users/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     const { username, email } = req.body;
//     // knexInstance.useCache = true;
//     const updatedUser = await knex("users")
//       .where({ id })
//       .update({ username, email })
//       .useCache({
//         val: true,
//         key: [
//           "527adf25b1189e91cfda2de8c49a1c39",
//           "e2fc714c4727ee9395f324cd2e7f331f",
//         ],
//       });
//     if (updatedUser) {
//       res.json({ message: "User updated" });
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred" });
//     console.log(error);
//   }
// });

// app.delete("/users/:id", async (req, res) => {
//   try {
//     const { id } = req.params;
//     // knexInstance.useCache = true;
//     const deletedUser = await knex("users")
//       .where({ id })
//       .del()
//       .useCache({ val: true });
//     if (deletedUser) {
//       res.json({ message: "User deleted" });
//     } else {
//       res.status(404).json({ error: "User not found" });
//     }
//   } catch (error) {
//     res.status(500).json({ error: "An error occurred" });
//     console.log(error);
//   }
// });

// app.listen(3000, () => {
//   console.log("Server is running on port 3000");
// });

module.exports = {
  attach_useCache,
};
