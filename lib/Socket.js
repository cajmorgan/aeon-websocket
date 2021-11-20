const EventEmitter = require('events');

class Socket extends EventEmitter {
  constructor(socket, socketObject) {
    super();
    this.socket = socket;
    this.socketObject = socketObject;
    this.initializeEvents();
  }

  initializeEvents() {
    this._addListeners({
      data: this.decoder
    })
  }
 
  decoder(data) {
    console.log(data);
  }

  _addListeners(listenerObject) {
    //Listener Object, key is event, value is cb
    const values = Object.entries(listenerObject);
    values.forEach(entry => this.socket.on(entry[0], entry[1]));
    /** Remove Listeners */
    return () => {
      values.forEach(entry => this.socket.removeListener(entry[0], entry[1]));
    }
  }

  send() {

  }

}

module.exports = Socket;