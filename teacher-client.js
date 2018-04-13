'use strict';

const socket = new WebSocket('ws://127.0.0.1:8000/t');
const source = document.getElementById('source');
const buttons = document.getElementById('buttons');

const clients = {};
let selectedClient = null;
let selectedButton = null;

const toElement = (html) => new DOMParser()
  .parseFromString(html, 'text/html')
  .body.childNodes[0];

const showSource = (clientName) => {
  selectedClient = clientName;
  const client = clients[clientName];
  if (client) {
    editor.setValue(client.source, 1);
  }
  document.getElementById('button' + clientName).classList.add('selected');
};

const addClient = (client) => {
  const button = toElement(
    '<button id="button' + client.name + '">' + client.name + '</button>'
  );
  button.classList.add('circleButton', 'circle');
  console.log(button.classList);
  buttons.appendChild(button);
  button.clientName = client.name;
  button.addEventListener('click', () => {
    if (button.clientName !== selectedButton) {
      if (selectedButton) selectedButton.classList.remove('selected');
      button.classList.add('selected');
      selectedButton = button;
      selectedClient = button.clientName;
      showSource(selectedClient);
    }
  });
  clients[client.name] = { button, client, source: '' };
  return button;
};

const removeClient = (client) => {
  buttons.removeChild(document.getElementById('button' + client.name));
  showSource(buttons.firstChild.clientName);
};

const updateClients = (clients) => {
  clients.forEach(client => {
    addClient(client);
  });
};

const changeSource = (edit) => {
  const client = clients[edit.name];
  client.source = edit.value;
  if (selectedClient === edit.name) {
    showSource(edit.name);
  }
};


socket.onmessage = (event) => {
  const change = JSON.parse(event.data);
  console.log(change);
  if (change.client) {
    addClient(change.client);
  } else if (change.edit) {
    changeSource(change.edit);
  } else if (change.removeClient) {
    removeClient(change.removeClient);
  } else if (change.updateClients) {
    updateClients(change.updateClients);
  }
};

const editor = ace.edit('source');
editor.setOptions({
  fontSize: 16,
  tabSize: 2,
  useSoftTabs: false,
  theme: 'ace/theme/monokai'
});
editor.session.setMode('ace/mode/javascript');
editor.setReadOnly(true);
