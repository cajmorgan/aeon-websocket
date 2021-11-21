const EventEmitter = require('events');

class Socket extends EventEmitter {
  constructor(socket, socketObject) {
    super();
    this.socket = socket;
    this.props = socketObject;
    this.fragments = '';
    this.fragmentMode = false;
    this._initializeEvents();
  }

  send(message, opcode = 0x1) {
    let finOps = 0x80 | opcode;
    const messageBuffer = Buffer.from(message, 'utf-8');
    const messageLength = messageBuffer.length;

    let payLoad = [];
    let byte;

    if (messageLength < 180) {
      if (messageLength <= 125) {
        byte = ~0x80 & messageLength;
        payLoad.push(byte);
      }
    
      if (messageLength >= 126) {
        for (let i = 0; i < 3; i++) {
          if (!i)
            byte = 126;
          if (i === 1)
            byte = messageLength & ~0xff;
          if (i === 2)
            byte = messageLength & 0xff;
          
          payLoad.push(byte);
        }
      }
  
      const fullBuffer = Buffer.from([finOps, ...payLoad, ...messageBuffer]);
      this.socket.write(fullBuffer);
    } else {
      finOps = opcode;
      let firstRound = true;
      let messageBank = [...messageBuffer];
      let newMessageLength = messageBank.length;

      while (newMessageLength !== 0) {
        let messageToStream = [];
        payLoad = [];
        
        if (newMessageLength <= 125) {
          finOps = 0x80 | 0x0;
          byte = ~0x80 & newMessageLength;
          payLoad.push(byte);

          for (let i = 0; i < newMessageLength; i++)
            messageToStream.push(messageBank.shift());
          
          newMessageLength = 0;
        } else if (newMessageLength >= 126) {
          if (firstRound) {
            firstRound = false;
          } else {
            finOps = 0x0;
          }

          let streamMessageLength = newMessageLength;
          if (newMessageLength >= 180) {
            streamMessageLength = 180;
          }
          
          for (let i = 0; i < streamMessageLength; i++) {
            messageToStream.push(messageBank.shift());
            newMessageLength--;
          }

          for (let i = 0; i < 3; i++) {
            if (!i)
              byte = 126;
            if (i === 1)
              byte = streamMessageLength & ~0xff;
            if (i === 2)
              byte = streamMessageLength & 0xff;
            
            payLoad.push(byte);
          }
        }

        const streamBuffer = Buffer.from([finOps, ...payLoad, ...messageToStream]);
        this.socket.write(streamBuffer);
      }      
    }
  }

  _initializeEvents() {
    this._addListeners({
      data: this._decoder.bind(this),
      close: () => this.emit('close')
    })
  }

  _decoder(data) {
    const dataArr = [...data];
    const opcode = dataArr[0] & 0xF;
    dataArr.shift();
    if (dataArr[0] >> 7 !== 1) {
      throw new Error('Invalid message, Current version does not support message fragmentation...');
    }

    if (!(dataArr[0] >> 7)) {
      throw new Error('Invalid message, Mask bit not set!');
    }

    if (opcode === 0x8) {
      this.socket.destroy();
      return 0;
    }

    /** If ping send pong */

    /** Payload length */
    let payloadLength = dataArr[0] & 0x7F;
  
    dataArr.shift();
    if (payloadLength == 126) {
      payloadLength = 0;
      for (let i = 0; i < 2; i++) {
        if (!i)
          payloadLength = (payloadLength | dataArr[0]) << 8;
        else
          payloadLength = payloadLength | dataArr[0];
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