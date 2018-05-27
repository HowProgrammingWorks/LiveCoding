'use strict';

const mainQueue = [];
const clientQueue = {};

let clientName;

const isEmpty = (array) => {
  array.forEach((el, id, arr) => {
    if (arr[id].length !== 0) return false;
  });
  return true;
};

const queuePush = (clientData) => {
  clientData.forEach((el, id, arr) => {
    if (arr[id].length !== 0) mainQueue.push(el.shift());
  });
  if (!isEmpty(clientData)) queuePush(clientData);
};

const processClientMessage = (message, address, handler) => {
  const value = JSON.parse(message[message.type + 'Data']);
  if (value.client) {
    console.log(`New client: ${value.client.name}\nip: ${address}`);
    clientName = value.client.name;
  } else if (value.edit) {
    if (!Array.isArray(clientQueue[address])) {
      clientQueue[address] = [value.edit.value];
    } else {
      clientQueue[address].push(value.edit.value);
    }
  }
  queuePush(Object.values(clientQueue).concat());
  if (mainQueue.length !== 0) handler(mainQueue.shift(), address, clientName);
};

module.exports = processClientMessage;
