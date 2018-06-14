'use strict';

const socket = new WebSocket('ws://192.168.0.111:2000/');

const user = document.getElementById('user');
const source = document.getElementById('source');
const buttons = document.getElementById('buttons');
const settings = document.getElementById('settings');
const clients = {};
let selectedClient = null;
let selectedButton = null;
let localUser = '';
let lastsource = '';
//переменная , для хранения старого поля, до правки изменений

const insertArrayAt = (array, index, arrayToInsert) => {
//функция присоединяет массив на определенный индекс массива
  Array.prototype.splice.apply(array, [index, (array[index] === '') ? 1 : 0]
    .concat(arrayToInsert));
  return array;
};

const toElement = (html) => new DOMParser()
  .parseFromString(html, 'text/html')
  .body.childNodes[0];

const showSource = (clientName) => {
  selectedClient = clientName;
  const client = clients[clientName];
  if (client) source.value = client.source;
};

const addClient = (client) => {
  const button = toElement(
    '<button id="button' + client.name + '">' + client.name + '</button>'
  );
  buttons.appendChild(button);
  button.clientName = client.name;
  button.addEventListener('click', () => {
    if (button.clientName !== selectedButton) {
      if (selectedButton) selectedButton.className = '';
      button.className = 'selected';
      selectedButton = button;
      selectedClient = button.clientName;
      showSource(selectedClient);
    }
  });
  clients[client.name] = { button, client, source: '' };

  return button;
};

const setDiff = (obj, name, type, line, data) => {
//функция, что добавляет поведение, поле diff = {} к объекту
  obj.diff = {
    name,
    operation: type,
    line,
    data,
  };
  return obj;
};

const findLine = (arr1, arr2, data) => {
//функция для поиска нужной строки где происходит начало изменения
  const index = arr1.findIndex(
    (el, i) => { if (el === data[0] && el !== data[i]) return i; });
  return index + 1;
};

const exclude = (arr1, arr2) => {
//функция , что возвращает массив изменений, разность массивов
  const data = [];
  const t1 = arr1.slice();
  const t2 = arr2.slice();
  let del = false;
  if (t1.length > t2.length) { //delete
    for (let i = 0; i < t1.length; i++) {
      const j = i + 1;
      if (t2[i] !== t1[i]) {
        if (t1.length === t2.length + 1 && t2[i] === t1[j]) {
          data.push(t1[i]);
          break;
        }
        if (t2[i] === '' && !del) {
          t2.splice(i, 1);
          del = true;
        }
        if (t1[i] === '' && t1.length === t2.length + 1) {
          t1.splice(i, 1);
        } else {
          data.push(t1[i]);
          t1.splice(i, 1);
          i--;
        }
      }
    }
  } else { //add
    for (let i = 0; i < t2.length; i++) {
      const j = i + 1;
      if (t2[i] !== t1[i]) {
        if (t1.length === t2.length - 1 &&
          t1[i] === t2[i] + t2[j] &&
          t2[i] !== '' &&
          t2[j] !== '') {
          data.push(t2[i]);
          data.push(t2[j]);
          break;
        }
        if (t1[i] === '' && !del) {
          t1.splice(i, 1);
          del = true;
        }
        data.push(t2[i]);
        t2.splice(i, 1);
        i--;
      }
    }
  }
  return data;
};
const setDelta = (oldSource, newSource) => {
//наша главная функция, в которой мы определяем , какого типа будет наша дельта
//и что в ней будет находится
  const Delta = {};
  const data = exclude(oldSource, newSource); //определяем разницу
  if (oldSource.length === 1 && oldSource[0] === '') {
  //добавление в пустое поле
    setDiff(Delta, localUser, 'addToEmpty', 1, newSource);
  } else if (oldSource.length === newSource.length) {
  //замена строки, с ней чаще всего и работаем
    newSource.forEach((el, i) => {
      if (el !== oldSource[i]) {
        setDiff(Delta, localUser, 'replace', ++i, el);
      }
    });
  } else if (oldSource.length < newSource.length) { //добавление
    const l = findLine(newSource, oldSource, data);
    //определяем строку с изменением
    if (data.length === 1 && data[0] === '' && l !== 0) {
    //добавленеие пустой строки
      setDiff(Delta, localUser, 'addNewLine', l, data);
    } else if (data.length === 2 && newSource[l - 1] === data[0]) {
      setDiff(Delta, localUser, 'addWithReplace', l, data);
    } else if (data.length !== 0 && l !== 0) { //нескольких строк
      setDiff(Delta, localUser, 'add', l, data);
    } else { //и в случаи бага, отправка всего source.value
      setDiff(Delta, localUser, 'addWithTrouble', 1, newSource);
    }
  } else if (oldSource.length > newSource.length) { //удаление из поля
    const l = findLine(oldSource, newSource, data);
    //определяем строку с изменением
    if (data.length === 1 && l !== 0) { //удаление строки
      setDiff(Delta, localUser, 'deleteLine', l, data);
    } else if (l !== 0 && newSource.length === oldSource.length - data.length) {
    //удаление без учета энтера
      setDiff(Delta, localUser, 'deleteWithoutEnter', l, data);
    } else if (l !== 0 && newSource.length !== oldSource.length - data.length) {
    //удаление с учетом энтера
      setDiff(Delta, localUser, 'deleteWithEnter', l, data);
    } else { //ну  и на случай бага , отправка source.value
      setDiff(Delta, localUser, 'deleteWithTrouble', 1, newSource);
    }
  }
  return Delta; //возвращаем наш объект с переводом в строку ->->->
};

const applyDeltaOBJ = {
  'replace': (arr, obj) => { arr[this.idx] = obj.data; },
  'replaceAll': (arr, obj) => {
    obj.data.forEach((el, i) => {
      arr[i] = el;
    });
  },
  'add': (arr, obj) => { insertArrayAt(arr, this.idx, obj.data); },
  'addWithReplace': (arr, obj) => {
    arr[this.idx] = obj.data[0];
    if (arr[this.idx + 1] === '') {
      insertArrayAt(arr, this.idx + 1, obj.data[1]);
      arr.splice(obj.line + 1, 0, '');
    } else insertArrayAt(arr, this.idx + 1, obj.data[1]);
  },
  'addNewLine': (arr, obj) => { arr.splice(this.idx, 0, obj.data); },
  'deleteWithTrouble': (arr, obj) => {
    arr = [];
    obj.data.forEach((el, i) => arr[i] = el);
  },
  'deleteLine': (arr) => { arr.splice(this.idx, 1); },
  'deleteWithEnter': (arr, obj) => {
    arr.splice(this.idx, obj.data.length, '');
  },
  'deleteWithoutEnter': (arr, obj) => { arr.splice(this.idx, obj.data.length); }
};

const applyDelta = (arr, obj) => {
//функция , для применения изменений у других клиентов
  const idx = obj.line - 1; // индекс массива
  this.idx = idx;
  if (obj.operation === 'addToEmpty' || obj.operation === 'addWithTrouble')
    applyDeltaOBJ['replaceAll'](arr, obj);
  else applyDeltaOBJ[obj.operation](arr, obj);
  //колекция функий , для каждого случая(колекция в виде объекта)
  return  arr.join('\n');
};

const changeSource = (edit) => {
  const client = clients[edit.name];
  client.source = applyDelta(client.source.split('\n'), edit);
  //в client.source мы запишем старый client.source , но с изменениями
  if (selectedClient === edit.name) {
    showSource(edit.name);
  }
};

user.addEventListener('keydown', (event) => {
  if (event.keyCode === 13) {
    localUser = user.value;
    const event = {
      client: {
        name: user.value
      }
    };
    settings.hidden = true;
    socket.send(JSON.stringify(event));
    const button = addClient(event.client);
    button.className = 'selected';
  }
});

source.addEventListener('input', () => {
  const client = clients[localUser];
  client.source = source.value;
  socket.send(JSON.stringify( //отправляем серверу нашу дельту строкой
    setDelta(lastsource.split('\n'), client.source.split('\n'))
    //в setDelta передаем массивы строк, так удобнее вычислять отличия
  ));
  lastsource = client.source;
  // запишем в lastsource текущее поле, и когда мы снова будем вычислять дельту,
  // у нас будет два поля, до изменений и после
});

socket.onmessage = (event) => {
  const change = JSON.parse(event.data);
  if (change.client) {
    addClient(change.client);
  } else if (change.diff) {
    changeSource(change.diff);
  }
};
