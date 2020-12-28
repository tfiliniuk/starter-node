const socket = require('socket.io');
// const http = require('http');

let users = {};

exports.createSocket = (http) => {
  const io = socket(http, {
    cors: true,
  });

  io.on('connection', (socket) => {
    console.log('connection', socket.id);
    socket.on('new_visitor', (user) => {
      console.log(user);
      socket.user = user;
    });
    socket.on('listOfUsers', (user) => {
      users[socket.id] = user._id;
      console.log('users', users);
      socket.emit('onlineUsers', users);
    });

    socket.on('disconnect', () => {
      console.log('Disconnect: ');
      delete users[socket.id];
    });
  });

  return io;
};
