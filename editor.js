'use strict';

const fontSize = document.getElementById('fontSize');
const selectTheme = document.getElementById('selectTheme');

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

const reset = () => {
  Array.prototype.forEach.call(document.body.children, el => {
    if (el.nodeName === 'section') {
      el.style['width'] = 'initial';
      el.style['height'] = 'initial';
    }
  });

};
