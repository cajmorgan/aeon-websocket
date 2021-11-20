import { createHash } from 'crypto';
import { Socket } from 'dgram';
import { magicString } from './constants';

class SocketConnection {
  #server
  #sockets

  constructor(server) {
    this.#server = server;
    this.#sockets = [];
    this.#init();
  }

  get server() {
    return this.#server;
  }

  get sockets() {
    return this.#sockets;
  }
  
  #init() {
    this.#addListeners({
      upgrade: this.#upgradeProtocol,
    })
  }

  createSocket() {
    if(!this.server) {
      throw new Error('SocketConnection class has to be initiated with HTTP server instance.')
    }

  }

  #upgradeProtocol(req, socket, head) {
    console.log(req.headers);

    const key = req.headers['sec-websocket-key']



    const newSocket = new Socket(ws, 'id');
    this.#sockets.push(newSocket);
  }

  #addListeners(listenerObject) {
    //Listener Object, key is event, value is cb
    const values = Object.entries(listenerObject);
    values.forEach(entry => this.server.on(entry[0], entry[1]));
    /** Remove Listeners */
    return () => {
      values.forEach(entry => this.server.removeListener(entry[0], entry[1]));
    }
  }

  #hasher(key) {
    const socketKey = key + magicString;
    const hash = createHash('sha1')
      .update(socketKey)
      .digest('base64');
    return hash;
  }

}

export default SocketConnection;