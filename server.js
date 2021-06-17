const HTTP = require('http');
const EXPRESS = require('express');
const APP = EXPRESS();
const SERVER = HTTP.createServer(APP);
const PORT = 8000;
const { Server } = require('socket.io');
const IO = new Server(SERVER);
let users = [];
let recentMessages = [];

APP.get('/', (req, res) => {
  res.sendFile(__dirname + '/index.html');
  APP.use(EXPRESS.static('public'));
});

// on connection to server, adds user to user array
IO.on('connection', (socket) => {
  socket.on('user connect', (user) => {
    console.log('User connected: ' + user);
    console.log('User id: ' + socket.id);
    users.push({userName: user, userId: socket.id});
    IO.emit('user connect', user);
    if (recentMessages.length != 0){
      IO.emit('recent messages', {recentMessages});
    }
  });

// on user disconnect, looks for user in user array and removes them
  socket.on('disconnect', () => {
    console.log('User disconnected: ' + socket.id);
    for (index = 0; index < users.length; index++) {
      if (users[index].userId === socket.id) {
        IO.emit('user disconnect', users[index].userName);
        users.splice[index, 1];
        console.log('User removed: ' + socket.id);
        break;
      }
    }
  });

  socket.on('chat message', (message) => {
    for (index = 0; index < users.length; index++) {
      if (users[index].userId === socket.id) {
        let user = users[index].userName;
        IO.emit('chat message', message, user);
        if (recentMessages.length < 10) {
          recentMessages.push({user: user, message: message});
        }
        else if (recentMessages.length == 10) {
          recentMessages.shift();
          recentMessages.push({user: user, message: message});
        }
        console.log(recentMessages);
      }
    }
  });
});

SERVER.listen(PORT, () => {
  console.log(`Server listening on Port ${PORT}`);
});
