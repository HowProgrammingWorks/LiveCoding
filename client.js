'use strict';

const socket = new WebSocket('ws://127.0.0.1:8000/');

const user = document.getElementById('user');
const source = document.getElementById('source');
const buttons = document.getElementById('buttons');
const regButton = document.getElementById('register');
const settings = document.getElementById('settings');
const commit = document.getElementById('commit');

// editor
const logs = document.getElementById('log');
const snippets = document.getElementById('snippets');


logs.style.fontSize = '16px';
snippets.onchange = () => {
  editor.setOptions({
    enableSnippets: snippets.checked,
    enableBasicAutocompletion: snippets.checked
  });
};

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

const myLog = (args) => {
  const parse = (obj) => {
    if (obj === null) return null;
    if (typeof obj === 'function') return `[Function ${obj.name}]`;
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return `[ ${obj.reduce((res, o) => (
          res + parse(o) + ', '
        ), '').replace(/, $/, '')} ]`;
      } else {
        return `{ ${Object.keys(obj).reduce((res, k) => (
          res + `${k}: ${parse(obj[k])}, `), ''
        ).replace(/, $/, '')} }`;
      }
    } else {
      return typeof obj === 'string' ? `'${obj}'` : obj;
    }
  };
  return args.reduce((res, o) => (res + parse(o) + ' '), '');
};

const run = () => {
  logs.style.backgroundColor = 'dodgerblue';
  logs.textContent = 'Logs:\n\n';
  const annot = editor.getSession().getAnnotations();
  if (annot.length > 0 && annot.every(a => a.type === 'error')) {
    annot.map(a => {
      logs.textContent += `${a.row}:${a.column}\t${a.text}\n`;
    });
    return;
  }
  try {
    (() => {
      const outLog = [];
      console.log = (...args) => {
        outLog.push(myLog(args));
      };
      console.dir = (...args) => {
        outLog.push(myLog(args));
      };
      eval(editor.getValue());
      logs.textContent = 'Logs:\n\n' + outLog.reduce((res, v) => (
        res + v + '\n'
      ), '');
    })();
  } catch (e) {
    logs.style.backgroundColor = 'tomato';
    logs.textContent = 'Errors:\n\n' + e.message;
  }
};

user.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    register();
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
