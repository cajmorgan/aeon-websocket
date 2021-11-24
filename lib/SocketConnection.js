const Socket = require('./Socket');
const EventEmitter = require('events');
const { createHash } = require('crypto');
const { magicString } = require('./constants');

class SocketConnection extends EventEmitter {
  constructor(server) {
    super();
    this.server = server;
    this.activeSockets = [];
    this._init();
  }

  createConnection(req, socketObject) {
    if (this.activeSockets.includes(req.socket)) {
      console.warn('Socket already handshaked');
      return 1;
    }
    
    this._upgradeProtocol(req, req.socket, socketObject);
    const newSocket = new Socket(req.socket, socketObject);
    newSocket.on('close', () => this._killAndRemove(newSocket));
    this.activeSockets.push(newSocket);
    this.emit('connect', newSocket);

    return newSocket;
  }

  _init() {
    if(!this.server) {
      throw new Error('SocketConnection class has to be initiated with HTTP server instance.')
    }
  }

  _upgradeProtocol(req, socket, socketObject) {
    const info = {
      method: req.method,
      key: req.headers['sec-websocket-key'],
      version: +req.headers['sec-websocket-version'],
      upgrade: req.headers['upgrade'],
    }

    if (info.method !== 'GET') {
      socket.destroy();
      throw new Error('Only get accepted!');
    }

    if (!info.key) {
      socket.destroy();
      throw new Error('Undefined socket key!');
    }

    if (info.upgrade !== 'websocket') {
      socket.destroy();
      throw new Error('Expected upgrade!');
    }

    const hashedKey = this._hasher(info.key);

    const resHeaders = {
      version: 'HTTP/1.1 101 Switching Protocols',
      upgrade: 'Upgrade: websocket',
      connection: 'Connection: Upgrade',
      key: `Sec-WebSocket-Accept: ${hashedKey}`
    }

    const resString = Object
      .values(resHeaders)
      .concat('\r\n')
      .join('\r\n');

    socket.write(resString);
  }

  _addListeners(listenerObject) {
    //Listener Object, key is event, value is cb
    const values = Object.entries(listenerObject);
    values.forEach(entry => this.server.on(entry[0], entry[1]));
    /** Remove Listeners */
    return () => {
      values.forEach(entry => this.server.removeListener(entry[0], entry[1]));
    }
  }

  _hasher(key) {
    const socketKey = key + magicString;
    const hash = createHash('sha1')
      .update(socketKey)
      .digest('base64');
    return hash;
  }  

  _killAndRemove(target) {
    this.activeSockets = this.activeSockets.filter(curr => curr !== target);
    target.socket.destroy();
    this.emit('close', target);
  }
}

module.exports = SocketConnection;