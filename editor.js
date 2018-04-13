'use strict';

const logs = document.getElementById('log');
// const table = document.getElementById('mainContainer');
const fontSize = document.getElementById('fontSize');
const selectTheme = document.getElementById('selectTheme');
const snippets = document.getElementById('snippets');
const circled = document.getElementsByClassName('circle');

ace.require('ace/ext/language_tools');
const Range = ace.require('ace/range');

const editor = ace.edit('source');

editor.session.setMode('ace/mode/javascript');

editor.setOptions({
  fontSize: 16,
  tabSize: 2,
  useSoftTabs: false,
  theme: 'ace/theme/cobalt',
  enableSnippets: false,
  enableBasicAutocompletion: false
});
logs.style.fontSize = '16px';

// window.onwheel = (e) => {
//   table.style.height = table.clientHeight + e.deltaY + 'px';
// };

selectTheme.onchange = (event) => {
  editor.setTheme(selectTheme.value);
  if (selectTheme.selectedIndex > 15) {
    document.body.style.backgroundColor = '#222';
    document.body.style.color = '#FFF';
  } else {
    document.body.style.backgroundColor = '#CCC';
    document.body.style.color = '#000';
  }
};

fontSize.oninput = () => {
  editor.setFontSize(parseInt(fontSize.value));
  logs.style.fontSize = `${fontSize.value}px`;
};

snippets.onchange = () => {
  editor.setOptions({
    enableSnippets: snippets.checked,
    enableBasicAutocompletion: snippets.checked
  })
};

const run = () => {
  logs.style.backgroundColor = 'dodgerblue';
  logs.textContent = 'Logs:\n\n';
  const annot = editor.getSession().getAnnotations();
  if (annot.length > 0 && annot.every(a => a.type === 'error')) {
    console.log('12');
    annot.map(a => {
      logs.textContent += `${a.row}:${a.column}\t${a.text}\n`;
    });
    return;
  }
  try {
    (() => {
      const outLog = [];
      console.log = (...args) => {
        outLog.push(myLog(args));
      };
      console.dir = (...args) => {
        outLog.push(myLog(args));
      }
      eval(editor.getValue());
      logs.textContent = 'Logs:\n\n' + outLog.reduce((res, v) => (
        res + v + '\n'
      ), '');
    })();
  } catch (e) {
    logs.style.backgroundColor = 'tomato';
    logs.textContent = 'Errors:\n\n' + e.message;
  }
};

const reset = () => {
  Array.prototype.forEach.call(document.body.children, el => {
    if (el.nodeName === 'section') {
      el.style['width'] = 'initial';
      el.style['height'] = 'initial';
    }
  });

};

const myLog = (args) => {
  const parse = (obj) => {
    if (obj === null) return null;
    if (typeof obj === 'function') return `[Function ${obj.name}]`
    if (typeof obj === 'object') {
      if (Array.isArray(obj)) {
        return `[ ${obj.reduce((res, o) => (
          res + parse(o) + ', '
        ), '').replace(/, $/, '')} ]`;
      } else {
        return `{ ${Object.keys(obj).reduce((res, k) => (
          res + `${k}: ${parse(obj[k])}, `), ''
        ).replace(/, $/, '')} }`;
      }
    } else
      return typeof obj === 'string' ? `'${obj}'` : obj;
  };
  return args.reduce((res, o) => (res + parse(o) + ' '), '');
};

// editor.focus();