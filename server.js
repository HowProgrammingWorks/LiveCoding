'use strict';

const fs = require('fs');
const http = require('http');
const Websocket = require('websocket').server;

if (process.argv.length < 3)
  throw new Error('Please, specify a teacher\'s password in cmd arguments.');
const password = process.argv[2];
console.log('Your password: ' + password);

const router = {
  '/$': () => './index.html',
  '/ace': (url) => './node_modules/ace-builds' + url.slice(4),
  '/teacher$': () => './authorize.html'
};

router['/'.concat(password)] = () => './teacher-index.html';

const route = (req) => {
  for (const k in router) {
    if (new RegExp(k).test(req.url)) {
      return fs.readFileSync(router[k](req.url));
    }
  }
  return fs.readFileSync('./' + req.url, 'utf8');
};

const server = http.createServer((req, res) => {
  res.writeHead(200);

  const data = route(req);
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
