// server.js
const express = require('express');
const SocketServer = require('ws').Server;

// To generate a UUID v1 time-based
const {v1: uuidv1} = require('uuid');

// Set the port to 3001
const PORT = 3001;

// Create a new express server
const server = express()
   // Make the express server serve static assets (html, javascript, css) from the /public folder
  .use(express.static('public'))
  .listen(PORT, '0.0.0.0', 'localhost', () => console.log(`Listening on ${ PORT }`));

// Create the WebSockets server
const wss = new SocketServer({ server });

// Function for random username color
function colorRandomizer() {
  var letters = '0123456789ABCDEF';
  var color = '#';
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
};


// Set up a callback that runs when a client connects to the server.
// After client connects, they are assigned a socket (represented by the ws parameter in the callback).
wss.on('connection', (ws) => {
  console.log('Client connected');
  ws.send(JSON.stringify({color: colorRandomizer(), type: "color"}));
  
  // Update the connected number of users (usersCount)
  // Send wss.clients.size to get the number of users connected
  wss.clients.forEach(function each(client) {
    client.send(wss.clients.size);
  });

  // Broadcast to everyone
  wss.broadcast = function broadcast(data) {
    wss.clients.forEach(function each(client) {
      client.send(JSON.stringify(data));
    });
  };

  ws.on('message', (incomingData) => {
    const parsedMessage = JSON.parse(incomingData);
    parsedMessage.message.id = uuidv1();
    switch (parsedMessage.message.type) {
      case 'postMessage': parsedMessage.message.type = 'incomingMessage';
        break;
      case 'postNotification': parsedMessage.message.type = 'incomingNotification';
        break;
    }
    wss.broadcast(parsedMessage);
  });

   // Set up a callback for when a client closes the socket (i.e. closed browser)
   ws.on('close', () => {
    console.log('Client disconnected');
    
  // Update the connected number of users (usersCount)
  // Send wss.clients.size to get the number of users connected
    wss.clients.forEach(function each(client) {
      client.send(wss.clients.size);
    });
  });
});
  
  