# Aeon Websocket
## A lightweight Websocket library 

This websocket server library is written from ground-up, using the WebSocket protocol implementation from [RFC](https://datatracker.ietf.org/doc/html/rfc6455). Using a WebSocket with a library on a basic level is usually a pretty uncomplicated task, but implementing a WebSocket client or server is a bit more tedious. 

### Usage

```js
const codeExample = 0;
```

### The Protocol

The WebSocket protocol is interesting and works in a bit special way. 
First the client needs to take initiative and send an opening handshake request to a normal HTTP server.
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



  






