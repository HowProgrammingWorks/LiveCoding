const circleCanvases = document.getElementsByClassName('buttonCanv');
// const circleButtons = document.getElementById('circleButton');

Array.prototype.forEach.call(circleCanvases, canvas => {
  let offset = canvas.getBoundingClientRect();

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const ctx = canvas.getContext('2d');
  // const t = 0;
  const delta = Math.floor(Math.sqrt(canvas.width * canvas.height) / 10);
  const max = Math.floor(Math.sqrt(Math.pow(canvas.width, 2) +
    Math.pow(canvas.height, 2)));

  let runs = false;
  let pressed = false
  canvas.onmousedown = e => {
    offset = canvas.getBoundingClientRect();

    pressed = true
    runs = true;

    let size = 0;
    const t = setInterval(() => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = `rgba(0, 0, 0, ${5 * (1 / size)})`;
      ctx.beginPath();
      ctx.arc(e.clientX - offset.left, e.clientY - offset.top, size, 0, 2 * Math.PI);
      ctx.fill();
      size += delta;
      if (size > max) {
        runs = false;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        clearInterval(t);
        // if (!pressed)
        //   ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    }, 20);
  };
  // canvas.onmouseup = e => {
  //   pressed = false;
  //   if (!runs)
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);
  // }
});

// const circleDropdowns = document.getElementsByClassName('')
