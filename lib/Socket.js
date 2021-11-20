class Socket {
  #socket
  #identifier

  constructor(socket, identifier) {
    this.#socket = socket;
    this.#identifier = identifier;
  }

  get socket() {
    return this.#socket;
  }
}

export default Socket;