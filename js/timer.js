const startTimer = (seconds, minutes) => {
  const timer = setInterval(() => {
    seconds++;
    if (seconds === 60) {
      seconds = 0;
      minutes++;
    }
    document.querySelector('.minutes').innerHTML = minutes > 9 ? `${minutes}:` : `0${minutes}:`;
    document.querySelector('.seconds').innerHTML = seconds > 9 ? seconds : `0${seconds}`;
  }, 1000);
  return timer;
}

export {
  startTimer
};