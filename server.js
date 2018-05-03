'use strict';

const fs = require('fs');
const http = require('http');
const Websocket = require('websocket').server;
const balancer = require('./balancer.js');
const serverfn = require('./serverfn.js');
const PORT = 8000;

const files = {};
['index.html', 'client.js', 'styles.css'].forEach((fileName, i) => {
  const key = '/' + (i === 0 ? '' : fileName);
  files[key] = fs.readFileSync('./' + fileName);
});

const server = http.createServer((req, res) => {
  const data = files[req.url] || files['/'];
  res.writeHead(200);
  res.end(data);
});

server.listen(PORT, () => console.log(`Listening port ${PORT}...`));

const ws = new Websocket({
  httpServer: server,
  autoAcceptConnections: false
});

ws.on('request', (req) => {
  const connection = req.accept(null, req.origin);
  const address = connection.remoteAddress;

  connection.on('message', (message) => balancer(message, address, serverfn));

  connection.on('close', (reasonCode, description) => {
    console.log('Disconnected ' + connection.remoteAddress);
    console.dir({ reasonCode, description });
  });
});
