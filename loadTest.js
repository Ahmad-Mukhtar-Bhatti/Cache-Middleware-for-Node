const http = require('http');

// Adjust these parameters as needed
const numRequests = 2000;  
const concurrency = 10;


function sendRequest() {
  http.get('http://localhost:3000/users', (res) => {
    console.log(`Response status code: ${res.statusCode}`);
  });
}

// Simulate concurrent requests
for (let i = 0; i < concurrency; i++) {
  for (let j = 0; j < numRequests / concurrency; j++) {
    sendRequest();
  }
}