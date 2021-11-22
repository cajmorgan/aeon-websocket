const btn = document.querySelector('#ping');
const close = document.querySelector('#close');
const text = document.querySelector('#text');
const body = document.querySelector('body');

const name = window.prompt('Sir, name pls...');
const socketConnection = new WebSocket(`ws://192.168.32.202:8000/socket/${name}`);

socketConnection.onmessage = function(event) {
  const p = document.createElement('p');
  p.innerText = event.data;
  body.appendChild(p);
};

btn.addEventListener('click', () => {
  socketConnection.send(text.value);
  text.value = '';
})

close.addEventListener('click', () => {
  socketConnection.close();
})

socketConnection.addEventListener('error', e => {
  console.log(e);
})

socketConnection.addEventListener('open', e => {
  console.log(e);
})