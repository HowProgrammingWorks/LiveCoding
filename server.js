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

router['/' + password + '$'] = () => './teacher-index.html'

const getRoutePath = (req) => {
  for (const k in router) {
    if (new RegExp(k).test(req.url)) {
      return router[k](req.url);
    }
  }
  return './' + req.url;
};

const server = http.createServer((req, res) => {
  res.writeHead(200);

  res.writeHead(200);
  fs.readFile(getRoutePath(req), (err, data) => {
    if (err) { console.log(err.message) }
    res.end(data);
  });
});

server.listen(8000, () => {
  console.log('Listen port 8000');
});

const ws = new Websocket({
  httpServer: server,
  autoAcceptConnections: false
});

let teacher = null;
const clients = [];

ws.on('request', (req) => {
  const connection = req.accept('', req.origin);
  if (req.resourceURL.href === '/t') {
    teacher = connection;
    teacher.send(JSON.stringify({
      updateClients: clients.map(client => ({ name: client.username }))
    }));
    console.log('teacher connected');
  }
  else
    clients.push(connection);

  console.log('Connected ' + connection.remoteAddress);

  connection.on('message', (message) => {
    const dataName = message.type + 'Data';
    const data = message[dataName];
    console.log('Received: ' + data);
    const parsed = JSON.parse(data);
    if (parsed.client)
      connection.username = parsed.client.name
    if (teacher)
      teacher.send(data);
  });

  connection.on('close', (reasonCode, description) => {
    console.log('Disconnected ' + connection.remoteAddress);
    const clIndex = clients.findIndex((c) => c === connection);
    if (clIndex > -1)
      clients.splice(clIndex, 1);
    if (teacher)
      teacher.send(JSON.stringify({ removeClient: { name: connection.username } }));
    console.dir({
      reasonCode,
      description
    });
  });
});
