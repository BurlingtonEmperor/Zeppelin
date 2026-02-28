let i = 0;
let myInterval = setInterval(function () {
  i++;
  if (i < 101) {
    closeRecticleRange(i);
  }
  else {
    clearInterval(myInterval);
  }
}, 100);