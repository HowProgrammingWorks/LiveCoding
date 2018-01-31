'use strict';

const socket = new WebSocket('ws://127.0.0.1/');

const user = document.getElementById('user');
const buttons = document.getElementById('buttons');
const settings = document.getElementById('settings');
const clients = {};
let selectedClient = null;
let selectedButton = null;

const toElement = (html) => new DOMParser()
  .parseFromString(html, 'text/html')
  .body.childNodes[0];

const addClient = (client) => {
  const button = toElement(
    '<button id="button' + client.name + '">' + client.name + '</button>'
  );
  buttons.appendChild(button);
  button.clientName = client.name;
  button.addEventListener('click', () => {
    if (button.clientName !== selectedButton) {
      if (selectedButton) {
        selectedButton.className = '';
      }
      button.className = 'selected';
      selectedButton = button;
      selectedClient = button.clientName;
    }
  });
  clients[client.name] = { button, client, text: '' };
};

user.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    const event = {
      client: {
        name: user.value
      }
    };
    settings.hidden = true;
    socket.send(JSON.stringify(event));
    addClient(event.client);
  }
});

const keyup = (event) => {
  socket.send(JSON.stringify({
    cell: event.target.id,
    value: event.target.value
  }));
};

socket.onmessage = (event) => {
  const change = JSON.parse(event.data);
  addClient(change.client);
};
