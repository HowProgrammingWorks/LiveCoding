'use strict';

const mainQueue = [];
const clientQueue = {};

const isEmpty = (array) => {
  for (let i = 0; i < array.length; i++) {
    if (array[i].length) return false;
  }
  return true;
};

const queuePush = (clientData) => {
  clientData.forEach(el => {
    if (el.length) mainQueue.push(el.shift());
  });
  if (!isEmpty(clientData)) queuePush(clientData);
};

const processClientMessage = (message, address, handler) => {
  const value = JSON.parse(message[message.type + 'Data']);
  if (value.client) {
    console.log(`New client: ${value.client.name}\nip: ${address}`);
  } else if (value.edit) {
    if (!Array.isArray(clientQueue[address])) {
      clientQueue[address] = [value.edit.value];
    } else {
      clientQueue[address].push(value.edit.value);
    }
  }
  queuePush(Object.values(clientQueue).concat());
  if (mainQueue.length !== 0) handler(mainQueue.shift(), address);
};

module.exports = processClientMessage;
