'use strict';

// const socket = new WebSocket('ws://192.168.0.103:8000/');
const socket = new WebSocket('ws://127.0.0.1:8000/');

const user = document.getElementById('user');
const source = document.getElementById('source');
const buttons = document.getElementById('buttons');
const settings = document.getElementById('settings');
const commit = document.getElementById('commit');

const clients = {};
let selectedClient = null;
let selectedButton = null;
let localUser = '';
const ranges = [];
const markers = [];


const addSymbol = () => {
  const pos = editor.getCursorPosition();
  const marker = markers.find(marker =>
    marker.contains(pos.row, pos.column - 1));

  if (marker) {
    marker.setEnd(marker.end.row, marker.end.column + 1);
    editor.session.removeMarker(marker.id);
    marker.id = editor.session.addMarker(marker, 'commit', 'text');
  } else {
    const m = new Range.Range(pos.row, pos.column - 1, pos.row, pos.column);
    m.id = editor.session.addMarker(m, 'commit', 'text');
    markers.push(m);
  }
};

const removeSymbol = () => {
  const pos = editor.getCursorPosition();
  const marker = markers.find(marker =>
    marker.contains(pos.row, pos.column - 1));

  if (marker) {
    marker.setEnd(marker.end.row, marker.end.column - 1);
    editor.session.removeMarker(marker.id);
    marker.id = editor.session.addMarker(marker, 'commit', 'text');
  }
};

const toElement = (html) => new DOMParser()
  .parseFromString(html, 'text/html')
  .body.childNodes[0];

const showSource = (clientName) => {
  selectedClient = clientName;
  const client = clients[clientName];
  if (client) {
    editor.setValue(client.source);
    if (clientName === localUser)
      editor.setReadOnly(false);
    else
      editor.setReadOnly(true);
  }
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

const changeSource = (edit) => {
  const client = clients[edit.name];
  client.source = edit.value;
  if (selectedClient === edit.name) {
    showSource(edit.name);
  }
};

user.addEventListener('keydown', (event) => {
  if (event.keyCode === 13 && localUser === '') {
    localUser = user.value;
    const event = {
      client: {
        name: user.value
      }
    };
    settings.hidden = true;
    socket.send(JSON.stringify(event));
    // const button = addClient(event.client);
    // button.classList.add('selected');
  }
});

source.addEventListener('keyup', (event) => {
  if (event.keyCode === 8) {
    // removeSymbol();
  }
});

source.addEventListener('input', (event) => {
  // addSymbol();
  // const client = clients[localUser];
  // client.source = editor.getValue();
  socket.send(JSON.stringify({
    edit: {
      name: localUser,
      value: editor.getValue()
    }
  }));
});

socket.onmessage = (event) => {
  const change = JSON.parse(event.data);
  // console.log(event.data);
  if (change.client) {
    // addClient(change.client);
  } else if (change.edit) {
    // changeSource(change.edit);
  }
};

user.focus();
