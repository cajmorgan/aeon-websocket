const express = require("express");
const { SocketConnection } = require('../index.js');

const PORT = 8000;
const app = express();

app.use(express.static('test'));

const server = app.listen(PORT, () => console.log(`Test Server on: ${PORT}`))
const connection = new SocketConnection(server);
connection.on('close', () => {
  console.log('Person left...');
})
const sockets = [];

app.get('/socket/:name', (req, res) => {
  const name = req.params.name;
  const socket = connection.createConnection(req, { id: 'hiho', name });
  sockets.push(socket);
  socket.on('message', (msg) => {
    sockets.forEach(sock => {
      if (sock.props.id === socket.props.id) {
        sock.send(socket.props.name + ': ' + msg);
      }
    })
  })
})

