# Aeon Websocket
## A lightweight Websocket library 

This websocket server library is written from ground-up, using the WebSocket protocol implementation from [RFC](https://datatracker.ietf.org/doc/html/rfc6455). Using a WebSocket with a library on a basic level is usually a pretty uncomplicated task, but implementing a WebSocket client or server is a bit more tedious. 

### Usage
Creating a very primitive chat room using Express and Aeon, note that this is not how you should implement a chat room if you want it to be private in any case, but it might be a start to understand the WebSockets. 

server.js
```js
const express = require("express");
const { SocketConnection } = require('aeon-websocket');

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
```

index.html
```html
  <!DOCTYPE html>
  <html>
    <head>
      <script src="index.js" defer></script>
    </head>
    <body>
      <h1>Socket</h1>
      <input type="text" id="text">
      <button id="send">Send Message</button>
      <button id="close">Close Socket</button>
    </body>
  </html>
```

index.js (client)
```js
  const btn = document.querySelector('#send');
  const close = document.querySelector('#close');
  const text = document.querySelector('#text');
  const body = document.querySelector('body');

  const name = window.prompt('Sir, name pls...'); //Gets name
  const room = window.prompt('Room id pls...'); //Gets roomId
  const socketConnection = new WebSocket(`ws://127.0.0.1:8000/socket/${name}/${room}`); //Initiate socket connection to endpoint by supplying parameters. 

/** Sets up an event to listen for incoming messages and appends the message to the body **/
  socketConnection.addEventListener('message', (event) => {
    const p = document.createElement('p'); 
    p.innerText = event.data;
    body.appendChild(p);
  }); 

  btn.addEventListener('click', () => {
    socketConnection.send(text.value); //Sends the value of the textinput to the socket
    text.value = '';
  })

  close.addEventListener('click', () => {
    socketConnection.close();
  })

  socketConnection.addEventListener('open', e => {
    console.log(e);
  })

  socketConnection.addEventListener('error', e => {
    console.log(e);
  })

```

### API

### The Protocol

The WebSocket protocol is interesting and works in a ***bit*** of a special way. 
First the client needs to take the initiative and send an opening handshake request to a normal HTTP server.
This request needs to contain upgrade headers, which can look something like: 
```html
GET /chat HTTP/1.1
Host: server.example.com
Upgrade: websocket
Connection: Upgrade
Sec-WebSocket-Key: dGhlIHNhbXBsZSBub25jZQ==
Origin: http://example.com
Sec-WebSocket-Protocol: chat, superchat
Sec-WebSocket-Version: 13
```



  






