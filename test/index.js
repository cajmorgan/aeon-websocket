const btn = document.querySelector('#send');
const close = document.querySelector('#close');
const text = document.querySelector('#text');
const body = document.querySelector('body');

const name = window.prompt('Sir, name pls...');
const room = window.prompt('Room id pls...');
const socketConnection = new WebSocket(`ws://127.0.0.1:8000/socket/${name}/${room}`);

socketConnection.addEventListener('message', (event) => {
  const p = document.createElement('p');
  p.innerText = event.data;
  body.appendChild(p);
}); 

btn.addEventListener('click', () => {
  socketConnection.send(text.value);
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