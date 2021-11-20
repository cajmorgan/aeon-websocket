const btn = document.querySelector('#ping');
const text = document.querySelector('#text');

const socketConnection = new WebSocket('ws://localhost:8000/socket/');

socketConnection.onmessage = function(event) {
  console.log(event.data);
};

btn.addEventListener('click', () => {
  socketConnection.send(text.value);
})

socketConnection.addEventListener('error', e => {
  console.log(e);
})

socketConnection.addEventListener('open', e => {
  console.log(e);
})