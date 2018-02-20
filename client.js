'use strict';

const socket = new WebSocket('ws://127.0.0.1:8000/');

const user = document.getElementById('user');
const source = document.getElementById('source');
const buttons = document.getElementById('buttons');
const settings = document.getElementById('settings');
const clients = {};
let selectedClient = null;
let selectedButton = null;
let localUser = '';

const toElement = (html) => new DOMParser()
  .parseFromString(html, 'text/html')
  .body.childNodes[0];

const showSource = (clientName) => {
  selectedClient = clientName;
  const client = clients[clientName];
  if (client) {
    source.value = client.source;
  }
};

const addClient = (client) => {
  const button = toElement(
    '<button id="button' + client.name + '">' + client.name + '</button>'
  );
  buttons.appendChild(button);
  button.clientName = client.name;
  button.addEventListener('click', () => {
    if (button.clientName !== selectedButton) {
      if (selectedButton) selectedButton.className = '';
      button.className = 'selected';
      selectedButton = button;
      selectedClient = button.clientName;
      showSource(selectedClient);
    }
  });
  clients[client.name] = { button, client, source: '' };
  return button;
};

const changeSource = (edit) => {
  const client = clients[edit.name];
  client.source = edit.value;
  if (selectedClient === edit.name) {
    showSource(edit.name);
  }
};

user.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    localUser = user.value;
    const event = {
      client: {
        name: user.value
      }
    };
    settings.hidden = true;
    socket.send(JSON.stringify(event));
    const button = addClient(event.client);
    button.className = 'selected';
  }
});

source.addEventListener('input', (event) => {
  const client = clients[localUser];
  client.source = source.value;
  socket.send(JSON.stringify({
    edit: {
      name: localUser,
      value: source.value
    }
  }));
});

socket.onmessage = (event) => {
  const change = JSON.parse(event.data);
  console.log(event.data);
  if (change.client) {
    addClient(change.client);
  } else if (change.edit) {
    changeSource(change.edit);
  }
};
