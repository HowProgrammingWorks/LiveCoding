'use strict';

const { mainqueue, clientsqueue } = require('./queue.js');

let clientname;

const isEmpty = (array) => {
  let counter = 0;
  array.forEach((el, id, arr) => {
    if (arr[id].length === 0) counter++;
  });
  if (array.length === counter) return true;
  else return false;
};

const queuePush = (clientsData) => {
  clientsData.forEach((el, id, arr) => {
    if (arr[id].length !== 0) mainqueue.push(el.shift());
  });
  if (!isEmpty(clientsData)) queuePush(clientsData);
};

const emitter = (message, address, serverfn) => {
  const value = JSON.parse(message[message.type + 'Data']);

  if (value.client) {
    console.log(`New client: ${value.client.name}\nip: ${address}`);
    clientname = value.client.name;
  } else if (value.edit) {
    if (Array.isArray(clientsqueue[address])) {
      clientsqueue[address].push(value.edit.value);
    }
    else clientsqueue[address] = [value.edit.value];
  }

  const alldata = Object.values(clientsqueue).concat();
  queuePush(alldata);

  if (mainqueue.length !== 0) serverfn(mainqueue.shift(), address, clientname);
};

module.exports = emitter;
