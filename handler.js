'use strict';

const fs = require('fs');

module.exports = (data, adress) => {
  fs.appendFile(`./clients/${adress.toString()}.txt`, data, (err) => {
    if (err) console.log(err.name);
    else console.log(data);
  });
};
