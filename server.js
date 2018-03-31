'use strict';

const fs = require('fs');
const http = require('http');
const Websocket = require('websocket').server;

if (process.argv.length < 3)
  throw new Error('Please, specify a teacher\'s password in cmd arguments.');
const password = process.argv[2];
console.log('Your password: ' + password);

const files = {};

const readR = (root, path) => {
  const getFilenames = (path, prefix) => {
    if (fs.lstatSync(root + prefix + path).isDirectory()) {
      return fs.readdirSync(root + prefix + path)
        .map(val => getFilenames(val, prefix + path + '/'));
    } else {
      return prefix + path;
    }
  };

  const flatty = (arr) => {
    if (!Array.isArray(arr)) return [arr];
    return arr.reduce((flat, toFlat) => (
      flat.concat(Array.isArray(toFlat) ? flatty(toFlat) : toFlat)
    ), []);
  };

  return flatty(getFilenames(path, ''));
};

readR('./client', '').forEach(f => {
  const key = (f === '/index.html' ? '/' : f);
  files[key] = fs.readFileSync('client' + f, 'utf8');
});
files['/teacher'] = fs.readFileSync('./client/authorize.html', 'utf8');
files['/' + password] = fs.readFileSync('./client/teacher-index.html', 'utf8');

const server = http.createServer((req, res) => {
  res.writeHead(200);

  const data = files[req.url]; //|| files['/'];
  res.writeHead(200);
  res.end(data);
});

server.listen(8000, () => {
  console.log('Listen port 8000');
});

const ws = new Websocket({
  httpServer: server,
  autoAcceptConnections: false
});

const clients = [];

ws.on('request', (req) => {
  const connection = req.accept('', req.origin);
  clients.push(connection);
  console.log('Connected ' + connection.remoteAddress);
  connection.on('message', (message) => {
    const dataName = message.type + 'Data';
    const data = message[dataName];
    console.log('Received: ' + data);
    clients.forEach((client) => {
      if (connection !== client) {
        client.send(data);
      }
    });
  });
  connection.on('close', (reasonCode, description) => {
    console.log('Disconnected ' + connection.remoteAddress);
    console.dir({
      reasonCode,
      description
    });
  });
});
