const express = require("express");
const { SocketConnection } = require('../index');

const PORT = 8000;
const HOST = '127.0.0.1';
const app = express();

app.use(express.static('test'));
/** Storing the server in a variable **/
const server = app.listen(PORT, HOST, () => console.log(`Test Server on: ${PORT}`))

const connection = new SocketConnection(server); // Prepares the socket by supplying the server as an argument
connection.on('connect', socket => console.log(`${socket.props.name} connected!`)); //Sets up an event when a connection is successful
connection.on('close', socket => console.log(`${socket.props.name} left...`)); //Sets up an event when a connection is closed

app.get('/socket/:name/:id', req => {
  const chatProps = {
    name: req.params.name,
    id: req.params.id
  }

  const socket = connection.createConnection(req, chatProps); //Creates the socket connection by passing in req and props
  socket.on('message', (msg) => { //Sets up an event listener
    connection.activeSockets.forEach(sock => { //Loop through sockets if message is received
      if (sock.props.id === socket.props.id) { //If the socket id matches the chatroom id, display message
        sock.send(socket.props.name + ': ' + msg);
      }
    })
  })
})