const express = require("express");
const { SocketConnection } = require('../index.js');

const PORT = 8000;
const app = express();

app.use(express.static('test'));

const server = app.listen(PORT, () => console.log(`Test Server on: ${PORT}`))
const connection = new SocketConnection(server);

app.get('/socket', (req, res) => {
  const socket = connection.createConnection(req, { id: 'hiho' });
  
})

