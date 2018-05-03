'use strict';

const mainqueue = [];
/*
**	Это главная очередь, из которой мы будем брать сообщения на обработку.
**  Ниже у нас клиентская очередь, в которой в полях это ip адреса, а в них
**  лежит массив с сообщениями.
*/
const clientsqueue = {};

let clientname;
// Эта переменная для имени клиента с которым сейчас мы работаем.

/*
**	Эта функция для проверки на пустоту клиентской очереди,
**  где мы считаем колличество пустых массивов и если их
**  число совпадет с длиной очереди, значит она вся пустая
**  и мы вернем true иначе false.
*/
const isEmpty = (array) => {
  let counter = 0;
  array.forEach((el, id, arr) => {
    if (arr[id].length === 0) counter++;
  });
  if (array.length === counter) return true;
  else return false;
};


/*
**	Функция ниже получает все клиентские сообщения и
**	и переопределяет их в главную очередь уже с интерисущем нас порядком.
*/
const queuePush = (clientsData) => {
  clientsData.forEach((el, id, arr) => {
    if (arr[id].length !== 0) mainqueue.push(el.shift());
  });
  if (!isEmpty(clientsData)) queuePush(clientsData);
};

module.exports = (message, address, serverfn) => {
  //	В value я присваиваю объект который парсится из строчки.
  const value = JSON.parse(message[message.type + 'Data']);
  /*
  **	Если же это первое сообщение от данного клиента, то запишем его имя
  **	в глобальную переменную clientname, позже с которой я буду иметь дело.
  */
  if (value.client) {
    console.log(`New client: ${value.client.name}\nip: ${address}`);
    clientname = value.client.name;
  } else if (value.edit) {
    typeof clientsqueue[address] === 'object' ?
      clientsqueue[address].push(value.edit.value) :
      clientsqueue[address] = [value.edit.value];
  }
  /*
  **	Если же сообщение не первое, то там будет поле edit, где лежит изменение
  **  файла. Если в нашей клиентской очереди еще в поле ip адреса клиента нет
  **	массива с его сообщениями,	то добавим туда массив с первым сообщением,
  **	иначе просто добавим в конец массива новое сообщение.
  */

  /*
  **	Переведу все массивы с сообщениями в единный массив канкатом,
  **	а после передам его в свою функцию queuePush которая распределит
  ** 	её в балансированом порядке.
  */

  const alldata = Object.values(clientsqueue).concat();
  queuePush(alldata);
  /*
  **	Если в главной очереди есть сообщения, то я отдаю их
  **	в обработчик сервера, который я написал для примера,
  **  а так это тема уже другой курсовой работы.
  */
  if (mainqueue.length !== 0) serverfn(mainqueue.shift(), address, clientname);
};
