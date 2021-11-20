const EventEmitter = require('events');

class Socket extends EventEmitter {
  constructor(socket, socketObject) {
    super();
    this.socket = socket;
    this.socketObject = socketObject;
    this.fragments = '';
    this.fragmentMode = false;
    this._initializeEvents();
  }

  send(message, opcode = 0x1) {
    const finOps = 0x8 << 4 | opcode;
    const messageBuffer = Buffer.from(message, 'utf-8');
    
    const messageLength = messageBuffer.length;

    const payLoad = [];
    let byte;
    if (messageLength <= 125) {
      byte = ~0x80 & messageLength;
      payLoad.push(byte);
    }
    
    if (messageLength >= 126) {
      byte = 126;
      payLoad.push(byte);

      for (let i = 2; i > 0; i--) {
        if (i == 2)
          byte = messageLength & ~0xF;
        else
          byte = messageLength & 0xF;
        payLoad.push(byte)
      }
    }


    const fullBuffer = Buffer.from([finOps, ...payLoad, ...messageBuffer]);
    this.socket.write(fullBuffer);
  }

  _initializeEvents() {
    this._addListeners({
      data: this._decoder.bind(this)
    })
  }

  _decoder(data) {
    const dataArr = [...data];
    const opcode = dataArr[0] & 0xF;
    dataArr.shift();
    if (dataArr[0] >> 7 !== 1) {
      throw new Error('Invalid message, Current version does not support message fragmentation...');
    }

    if (opcode == '0' || opcode == '2') {
      throw new Error('Invalid message, Current version does not support messages other than text');
    }

    if (!(dataArr[0] >> 7)) {
      throw new Error('Invalid message, Mask bit not set!');
    }

    /** If ping send pong */

    /** Payload length */
    let payloadLength = dataArr[0] & 0x7F;
    dataArr.shift();

    if (payloadLength == 126) {
      payloadLength = 0;
      for (let i = 0; i < 2; i++) {
        payloadLength += dataArr[0];
        dataArr.shift();
      }
    }

    /** Will get implemented with fragments */
    if (payloadLength == 127) {
      throw new Error('Too long message, Current version does not support message fragmentation...');
      // payloadLength = dataArr[2] + dataArr[3] + dataArr[4] + dataArr[5] + dataArr[6] + dataArr[7] + dataArr[8] + dataArr[9];
    }

    /** Retrieve maskKey */
    let maskKey = [];
    for (let i = 0; i < 4; i++) {
      maskKey.push(dataArr[0]);
      dataArr.shift();
    }

    /** Decode message */
    let messageArr = [];
    for (let i = 0; i < payloadLength; i++) {
      const decode = dataArr[i] ^ maskKey[i % 4];
      messageArr.push(decode);
    }

    const message = Buffer.from(messageArr).toString();
    this.emit('message', message);
    this.send(message);
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

 

}

module.exports = Socket;