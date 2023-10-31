/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> } 
 */
exports.seed = function (knex) {
  // Deletes ALL existing entries and resets the primary key to 1
  return knex('users').truncate()
    .then(function () {
      // Inserts seed entries
      return knex('users').insert([
        { id: 1, username: 'Ahmad', email: 'user1@example.com' },
        { id: 2, username: 'user2', email: 'Myuser@example.com' },
        { id: 3, username: 'Work', email: 'Person@example.com' },
        { id:4, username: 'Brother', email: 'Done@example.com' },
        // Add more data as needed
      ]);
    });
};

