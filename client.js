'use strict';

const socket = new WebSocket('ws://127.0.0.1:8000/');

const user = document.getElementById('user');
const source = document.getElementById('source');
const buttons = document.getElementById('buttons');
const regButton = document.getElementById('register')
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

const register = () => {
  localUser = user.value;
  const event = {
    client: {
      name: user.value
    }
  };
  settings.hidden = true;
  socket.send(JSON.stringify(event));
  regButton.style.backgroundColor = 'limegreen';
  regButton.textContent = 'Registered';
};

user.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    register();
  }
});

source.addEventListener('keyup', (event) => {
  if (event.keyCode === 8) {
  }
});

source.addEventListener('input', (event) => {
  socket.send(JSON.stringify({
    edit: {
      name: localUser,
      value: editor.getValue()
    }
  }));
});

user.focus();
