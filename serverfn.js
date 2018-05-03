'use strict';

const fs = require('fs');

module.exports = (data, adress, name) => {
	fs.appendFile(`./clients/${adress.toString()}.txt`, data, (err) => {
		if (err) console.log(err.name);
		else console.log(`${name}\n${data}`);
	});
}
